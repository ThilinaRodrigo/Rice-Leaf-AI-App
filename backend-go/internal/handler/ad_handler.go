package handler

import (
	"encoding/base64"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"backend-go/config"
	"backend-go/internal/domain"
	"backend-go/internal/middleware"
	"backend-go/internal/usecase"
	"backend-go/pkg/token"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type AdHandler struct {
	adUC usecase.AdUseCase
	cfg  *config.Config
}

func NewAdHandler(adUC usecase.AdUseCase, cfg *config.Config) *AdHandler {
	return &AdHandler{adUC: adUC, cfg: cfg}
}

func (h *AdHandler) UploadAdImage(c *gin.Context) {
	adsDir := filepath.Join(h.cfg.UploadsDir, "ads")
	if err := os.MkdirAll(adsDir, 0755); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed creating upload directory"})
		return
	}

	// 1. Try multipart file
	file, err := c.FormFile("image")
	if err == nil {
		ext := filepath.Ext(file.Filename)
		if ext == "" {
			ext = ".jpg"
		}
		newFilename := fmt.Sprintf("ad_%d_%s%s", time.Now().UnixNano(), uuid.New().String()[:8], ext)
		dst := filepath.Join(adsDir, newFilename)

		if err := c.SaveUploadedFile(file, dst); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed saving image file"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"image_url": fmt.Sprintf("/uploads/ads/%s", newFilename),
			"filename":  newFilename,
		})
		return
	}

	// 2. Try JSON base64 payload
	var jsonReq struct {
		ImageBase64 string `json:"image_base64"`
		Filename    string `json:"filename"`
	}
	if err := c.ShouldBindJSON(&jsonReq); err == nil && jsonReq.ImageBase64 != "" {
		b64Data := jsonReq.ImageBase64
		if idx := strings.Index(b64Data, ","); idx != -1 {
			b64Data = b64Data[idx+1:]
		}
		data, decodeErr := base64.StdEncoding.DecodeString(b64Data)
		if decodeErr != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid base64 image data"})
			return
		}

		ext := ".jpg"
		if jsonReq.Filename != "" {
			if e := filepath.Ext(jsonReq.Filename); e != "" {
				ext = e
			}
		}
		newFilename := fmt.Sprintf("ad_%d_%s%s", time.Now().UnixNano(), uuid.New().String()[:8], ext)
		dst := filepath.Join(adsDir, newFilename)

		if err := os.WriteFile(dst, data, 0644); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed saving base64 image file"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"image_url": fmt.Sprintf("/uploads/ads/%s", newFilename),
			"filename":  newFilename,
		})
		return
	}

	c.JSON(http.StatusBadRequest, gin.H{"error": "image file or image_base64 is required"})
}

func getUserIDFromContext(c *gin.Context) (string, bool) {
	if val, exists := c.Get("userID"); exists {
		if s, ok := val.(string); ok && s != "" {
			return s, true
		}
	}
	if payload, exists := c.Get(middleware.AuthorizationPayloadKey); exists {
		if claims, ok := payload.(*token.Claims); ok {
			return claims.UserID.String(), true
		}
	}
	return "", false
}

func (h *AdHandler) CreateAd(c *gin.Context) {
	userID, exists := getUserIDFromContext(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	var ad domain.Ad
	if err := c.ShouldBindJSON(&ad); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid payload: " + err.Error()})
		return
	}

	ad.ShopOwnerID = userID
	if ad.Title == "" || ad.ImageURL == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "title and image_url are required"})
		return
	}

	if err := h.adUC.CreateAd(c.Request.Context(), &ad); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, ad)
}

func (h *AdHandler) UpdateAd(c *gin.Context) {
	userID, exists := getUserIDFromContext(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	id := c.Param("id")

	var req domain.Ad
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid payload: " + err.Error()})
		return
	}

	req.ID = id
	req.ShopOwnerID = userID
	req.Status = domain.AdStatusPending
	req.RejectionReason = ""

	if req.Title == "" || req.ImageURL == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "title and image_url are required"})
		return
	}

	if err := h.adUC.UpdateAd(c.Request.Context(), &req); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, req)
}

func (h *AdHandler) GetMyAds(c *gin.Context) {
	userID, exists := getUserIDFromContext(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	ads, err := h.adUC.GetByShopOwner(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if ads == nil {
		ads = []domain.Ad{}
	}

	c.JSON(http.StatusOK, ads)
}

func (h *AdHandler) DeleteAd(c *gin.Context) {
	userID, exists := getUserIDFromContext(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}
	id := c.Param("id")

	if err := h.adUC.DeleteAd(c.Request.Context(), id, userID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "ad deleted successfully"})
}

func (h *AdHandler) GetApprovedMarketplaceAds(c *gin.Context) {
	diseaseTag := c.Query("disease_tag")
	ads, err := h.adUC.GetApprovedAds(c.Request.Context(), diseaseTag)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if ads == nil {
		ads = []domain.Ad{}
	}
	c.JSON(http.StatusOK, ads)
}

func (h *AdHandler) GetAdminAds(c *gin.Context) {
	status := c.Query("status")
	ads, err := h.adUC.GetAllAdsForAdmin(c.Request.Context(), status)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if ads == nil {
		ads = []domain.Ad{}
	}
	c.JSON(http.StatusOK, ads)
}

func (h *AdHandler) UpdateAdStatus(c *gin.Context) {
	id := c.Param("id")
	var req struct {
		Status          domain.AdStatus `json:"status" binding:"required"`
		RejectionReason string          `json:"rejection_reason"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid status body: " + err.Error()})
		return
	}

	if req.Status != domain.AdStatusApproved && req.Status != domain.AdStatusRejected && req.Status != domain.AdStatusPending {
		c.JSON(http.StatusBadRequest, gin.H{"error": "status must be pending, approved, or rejected"})
		return
	}

	if err := h.adUC.UpdateAdStatus(c.Request.Context(), id, req.Status, req.RejectionReason); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "ad status updated successfully"})
}
