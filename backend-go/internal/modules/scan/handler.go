package scan

import (
	"errors"
	"mime/multipart"
	"net/http"
	"path/filepath"
	"strings"

	"backend-go/config"
	"backend-go/internal/shared/middleware"
	"backend-go/pkg/token"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type Handler struct {
	scanService Service
	cfg         *config.Config
}

func NewHandler(scanService Service, cfg *config.Config) *Handler {
	return &Handler{
		scanService: scanService,
		cfg:         cfg,
	}
}

func isSupportedImage(header *multipart.FileHeader) bool {
	contentType := strings.ToLower(header.Header.Get("Content-Type"))
	if contentType != "" && strings.HasPrefix(contentType, "image/") {
		return true
	}
	ext := strings.ToLower(filepath.Ext(header.Filename))
	switch ext {
	case ".jpg", ".jpeg", ".png", ".webp", ".bmp", ".heic":
		return true
	}
	return false
}

func (h *Handler) AnalyzeImage(c *gin.Context) {
	fileHeader, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "image file is required (multipart field 'file')"})
		return
	}

	// Validate file size limit
	maxSizeBytes := int64(10 * 1024 * 1024)
	if h.cfg != nil && h.cfg.MaxImageSizeMB > 0 {
		maxSizeBytes = h.cfg.MaxImageSizeMB * 1024 * 1024
	}
	if fileHeader.Size > maxSizeBytes {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "FILE_TOO_LARGE",
			"message": "Uploaded file exceeds the maximum allowed size.",
		})
		return
	}

	// Validate supported image format
	if !isSupportedImage(fileHeader) {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "INVALID_IMAGE_FORMAT",
			"message": "Uploaded file is not a supported image format.",
		})
		return
	}

	var userIDPtr *uuid.UUID
	if payload, ok := c.Get(middleware.AuthorizationPayloadKey); ok {
		claims := payload.(*token.Claims)
		userIDPtr = &claims.UserID
	}

	res, err := h.scanService.AnalyzeImage(c.Request.Context(), userIDPtr, fileHeader)
	if err != nil {
		var notLeafErr *ErrNotRiceLeaf
		if errors.As(err, &notLeafErr) {
			c.JSON(http.StatusUnprocessableEntity, RejectionResponse{
				Success:    false,
				Error:      "NOT_RICE_LEAF",
				Message:    "Please upload a clear image of a rice leaf.",
				Validation: notLeafErr.Validation,
			})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, res)
}

func (h *Handler) GetHistory(c *gin.Context) {
	payload, ok := c.Get(middleware.AuthorizationPayloadKey)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	claims := payload.(*token.Claims)
	history, err := h.scanService.GetUserScanHistory(c.Request.Context(), claims.UserID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, history)
}

func (h *Handler) GetScanByID(c *gin.Context) {
	scanIDStr := c.Param("id")
	scanID, err := uuid.Parse(scanIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid scan id"})
		return
	}

	res, err := h.scanService.GetScanByID(c.Request.Context(), scanID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, res)
}
