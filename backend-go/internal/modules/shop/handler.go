package shop

import (
	"encoding/base64"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"backend-go/config"
	"backend-go/internal/shared/middleware"
	"backend-go/pkg/token"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type AdHandler struct {
	adService AdService
	cfg       *config.Config
}

func NewAdHandler(adService AdService, cfg *config.Config) *AdHandler {
	return &AdHandler{adService: adService, cfg: cfg}
}

type ProductHandler struct {
	productService ProductService
}

func NewProductHandler(productService ProductService) *ProductHandler {
	return &ProductHandler{productService: productService}
}

func (h *AdHandler) UploadAdImage(c *gin.Context) {
	adsDir := filepath.Join(h.cfg.UploadsDir, "ads")
	if err := os.MkdirAll(adsDir, 0755); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed creating upload directory"})
		return
	}

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

		c.JSON(http.StatusOK, UploadAdImageResponse{
			ImageURL: fmt.Sprintf("/uploads/ads/%s", newFilename),
			Filename:  newFilename,
		})
		return
	}

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

		c.JSON(http.StatusOK, UploadAdImageResponse{
			ImageURL: fmt.Sprintf("/uploads/ads/%s", newFilename),
			Filename:  newFilename,
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

	var ad Ad
	if err := c.ShouldBindJSON(&ad); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid payload: " + err.Error()})
		return
	}

	ad.ShopOwnerID = userID
	if ad.Title == "" || ad.ImageURL == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "title and image_url are required"})
		return
	}

	if err := h.adService.CreateAd(c.Request.Context(), &ad); err != nil {
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

	var req Ad
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid payload: " + err.Error()})
		return
	}

	req.ID = id
	req.ShopOwnerID = userID
	req.Status = AdStatusPending
	req.RejectionReason = ""

	if req.Title == "" || req.ImageURL == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "title and image_url are required"})
		return
	}

	if err := h.adService.UpdateAd(c.Request.Context(), &req); err != nil {
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

	ads, err := h.adService.GetByShopOwner(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if ads == nil {
		ads = []Ad{}
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

	if err := h.adService.DeleteAd(c.Request.Context(), id, userID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "ad deleted successfully"})
}

func (h *AdHandler) GetApprovedMarketplaceAds(c *gin.Context) {
	diseaseTag := c.Query("disease_tag")
	category := c.Query("category")
	search := c.Query("search")

	pageStr := c.Query("page")
	limitStr := c.Query("limit")

	page, _ := strconv.Atoi(pageStr)
	limit, _ := strconv.Atoi(limitStr)

	// If no page/limit is provided, default to fetching all matching items (for legacy callers)
	if pageStr == "" && limitStr == "" {
		ads, _, err := h.adService.GetApprovedAds(c.Request.Context(), diseaseTag, category, search, 0, 0)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		if ads == nil {
			ads = []Ad{}
		}
		c.JSON(http.StatusOK, ads)
		return
	}

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}

	ads, total, err := h.adService.GetApprovedAds(c.Request.Context(), diseaseTag, category, search, page, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if ads == nil {
		ads = []Ad{}
	}

	totalPages := 0
	if total > 0 {
		totalPages = (total + limit - 1) / limit
	}

	c.JSON(http.StatusOK, gin.H{
		"data":        ads,
		"page":        page,
		"limit":       limit,
		"total":       total,
		"total_pages": totalPages,
	})
}

func (h *AdHandler) GetAdminAds(c *gin.Context) {
	status := c.Query("status")
	ads, err := h.adService.GetAllAdsForAdmin(c.Request.Context(), status)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if ads == nil {
		ads = []Ad{}
	}
	c.JSON(http.StatusOK, ads)
}

func (h *AdHandler) UpdateAdStatus(c *gin.Context) {
	id := c.Param("id")
	var req UpdateAdStatusDTO

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid status body: " + err.Error()})
		return
	}

	if req.Status != AdStatusApproved && req.Status != AdStatusRejected && req.Status != AdStatusPending {
		c.JSON(http.StatusBadRequest, gin.H{"error": "status must be pending, approved, or rejected"})
		return
	}

	if err := h.adService.UpdateAdStatus(c.Request.Context(), id, req.Status, req.RejectionReason); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "ad status updated successfully"})
}

func (h *ProductHandler) GetProducts(c *gin.Context) {
	category := c.Query("category")
	search := c.Query("search")

	products, err := h.productService.GetProducts(c.Request.Context(), category, search)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, products)
}

func (h *ProductHandler) GetProductByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid product id"})
		return
	}

	product, err := h.productService.GetProductByID(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, product)
}
