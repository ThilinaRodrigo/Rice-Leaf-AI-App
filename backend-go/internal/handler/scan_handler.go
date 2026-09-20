package handler

import (
	"net/http"

	"backend-go/internal/middleware"
	"backend-go/internal/usecase"
	"backend-go/pkg/token"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type ScanHandler struct {
	scanUC usecase.ScanUseCase
}

func NewScanHandler(scanUC usecase.ScanUseCase) *ScanHandler {
	return &ScanHandler{scanUC: scanUC}
}

func (h *ScanHandler) AnalyzeImage(c *gin.Context) {
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

	res, err := h.scanUC.AnalyzeImage(c.Request.Context(), userIDPtr, fileHeader)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, res)
}

func (h *ScanHandler) GetHistory(c *gin.Context) {
	payload, ok := c.Get(middleware.AuthorizationPayloadKey)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	claims := payload.(*token.Claims)
	history, err := h.scanUC.GetUserScanHistory(c.Request.Context(), claims.UserID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, history)
}

func (h *ScanHandler) GetScanByID(c *gin.Context) {
	scanIDStr := c.Param("id")
	scanID, err := uuid.Parse(scanIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid scan id"})
		return
	}

	res, err := h.scanUC.GetScanByID(c.Request.Context(), scanID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, res)
}
