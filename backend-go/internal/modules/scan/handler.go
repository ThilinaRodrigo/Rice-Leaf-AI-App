package scan

import (
	"net/http"

	"backend-go/internal/shared/middleware"
	"backend-go/pkg/token"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type Handler struct {
	scanService Service
}

func NewHandler(scanService Service) *Handler {
	return &Handler{scanService: scanService}
}

func (h *Handler) AnalyzeImage(c *gin.Context) {
	fileHeader, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "image file is required (multipart field 'file')"})
		return
	}

	var userIDPtr *uuid.UUID
	if payload, ok := c.Get(middleware.AuthorizationPayloadKey); ok {
		claims := payload.(*token.Claims)
		userIDPtr = &claims.UserID
	}

	res, err := h.scanService.AnalyzeImage(c.Request.Context(), userIDPtr, fileHeader)
	if err != nil {
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
