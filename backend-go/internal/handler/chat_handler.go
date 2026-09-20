package handler

import (
	"net/http"

	"backend-go/internal/domain"
	"backend-go/internal/middleware"
	"backend-go/internal/usecase"
	"backend-go/pkg/token"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type ChatHandler struct {
	chatUC usecase.ChatUseCase
}

func NewChatHandler(chatUC usecase.ChatUseCase) *ChatHandler {
	return &ChatHandler{chatUC: chatUC}
}

func (h *ChatHandler) SendMessage(c *gin.Context) {
	var req domain.SendMessageRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var userIDPtr *uuid.UUID
	if payload, ok := c.Get(middleware.AuthorizationPayloadKey); ok {
		claims := payload.(*token.Claims)
		userIDPtr = &claims.UserID
	}

	botReply, err := h.chatUC.SendMessage(c.Request.Context(), userIDPtr, req.Message)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, botReply)
}

func (h *ChatHandler) GetHistory(c *gin.Context) {
	payload, ok := c.Get(middleware.AuthorizationPayloadKey)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	claims := payload.(*token.Claims)
	history, err := h.chatUC.GetChatHistory(c.Request.Context(), claims.UserID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, history)
}
