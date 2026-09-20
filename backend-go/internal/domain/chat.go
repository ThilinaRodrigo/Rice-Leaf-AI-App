package domain

import (
	"time"

	"github.com/google/uuid"
)

type ChatMessage struct {
	ID        uuid.UUID  `json:"id"`
	UserID    *uuid.UUID `json:"user_id,omitempty"`
	Sender    string     `json:"sender"` // "user" or "bot"
	Message   string     `json:"text"`
	CreatedAt time.Time  `json:"timestamp"`
}

type SendMessageRequest struct {
	Message string `json:"message" binding:"required"`
}
