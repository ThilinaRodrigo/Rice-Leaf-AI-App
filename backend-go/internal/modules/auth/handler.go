package auth

import (
	"encoding/base64"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"backend-go/internal/shared/middleware"
	"backend-go/pkg/token"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type Handler struct {
	authService Service
}

func NewHandler(authService Service) *Handler {
	return &Handler{authService: authService}
}

func (h *Handler) Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	resp, err := h.authService.Register(c.Request.Context(), req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, resp)
}

func (h *Handler) Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	resp, err := h.authService.Login(c.Request.Context(), req)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, resp)
}

func (h *Handler) GetProfile(c *gin.Context) {
	payload, ok := c.Get(middleware.AuthorizationPayloadKey)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	claims := payload.(*token.Claims)
	user, err := h.authService.GetProfile(c.Request.Context(), claims.UserID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, user)
}

func (h *Handler) UploadAvatar(c *gin.Context) {
	avatarsDir := "./uploads/avatars"
	if err := os.MkdirAll(avatarsDir, 0755); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed creating avatars upload directory"})
		return
	}

	file, err := c.FormFile("avatar")
	if err != nil {
		file, err = c.FormFile("file")
	}

	if err == nil {
		ext := filepath.Ext(file.Filename)
		if ext == "" {
			ext = ".jpg"
		}
		newFilename := fmt.Sprintf("avatar_%d_%s%s", time.Now().UnixNano(), uuid.New().String()[:8], ext)
		dst := filepath.Join(avatarsDir, newFilename)

		if err := c.SaveUploadedFile(file, dst); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed saving avatar file"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"url": "/uploads/avatars/" + newFilename})
		return
	}

	var jsonReq struct {
		AvatarBase64 string `json:"avatar_base64"`
	}
	if err := c.ShouldBindJSON(&jsonReq); err == nil && jsonReq.AvatarBase64 != "" {
		b64Data := jsonReq.AvatarBase64
		if idx := strings.Index(b64Data, ","); idx != -1 {
			b64Data = b64Data[idx+1:]
		}
		decoded, err := base64.StdEncoding.DecodeString(b64Data)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid base64 image data"})
			return
		}

		newFilename := fmt.Sprintf("avatar_%d_%s.jpg", time.Now().UnixNano(), uuid.New().String()[:8])
		dst := filepath.Join(avatarsDir, newFilename)

		if err := os.WriteFile(dst, decoded, 0644); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed writing avatar file"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"url": "/uploads/avatars/" + newFilename})
		return
	}

	c.JSON(http.StatusBadRequest, gin.H{"error": "no image file or base64 data provided"})
}

func (h *Handler) UpdateProfile(c *gin.Context) {
	payload, ok := c.Get(middleware.AuthorizationPayloadKey)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	var req UpdateProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	claims := payload.(*token.Claims)
	updatedUser, err := h.authService.UpdateProfile(c.Request.Context(), claims.UserID, req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, updatedUser)
}

func (h *Handler) ChangePassword(c *gin.Context) {
	payload, ok := c.Get(middleware.AuthorizationPayloadKey)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	var req ChangePasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	claims := payload.(*token.Claims)
	err := h.authService.ChangePassword(c.Request.Context(), claims.UserID, req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Password changed successfully"})
}
