package repository

import (
	"context"
	"database/sql"
	"fmt"

	"backend-go/internal/domain"

	"github.com/google/uuid"
)

type ChatRepository interface {
	SaveMessage(ctx context.Context, msg *domain.ChatMessage) error
	GetHistoryByUserID(ctx context.Context, userID uuid.UUID) ([]domain.ChatMessage, error)
}

type chatRepository struct {
	db *sql.DB
}

func NewChatRepository(db *sql.DB) ChatRepository {
	return &chatRepository{db: db}
}

func (r *chatRepository) SaveMessage(ctx context.Context, msg *domain.ChatMessage) error {
	if r.db == nil {
		msg.ID = uuid.New()
		return nil
	}
	query := `
		INSERT INTO chat_messages (user_id, sender, message)
		VALUES ($1, $2, $3)
		RETURNING id, created_at
	`
	err := r.db.QueryRowContext(ctx, query, msg.UserID, msg.Sender, msg.Message).
		Scan(&msg.ID, &msg.CreatedAt)
	if err != nil {
		return fmt.Errorf("error saving chat message: %w", err)
	}
	return nil
}

func (r *chatRepository) GetHistoryByUserID(ctx context.Context, userID uuid.UUID) ([]domain.ChatMessage, error) {
	if r.db == nil {
		return []domain.ChatMessage{}, nil
	}
	query := `
		SELECT id, user_id, sender, message, created_at
		FROM chat_messages
		WHERE user_id = $1
		ORDER BY created_at ASC
	`
	rows, err := r.db.QueryContext(ctx, query, userID)
	if err != nil {
		return nil, fmt.Errorf("error querying chat history: %w", err)
	}
	defer rows.Close()

	var messages []domain.ChatMessage
	for rows.Next() {
		var m domain.ChatMessage
		if err := rows.Scan(&m.ID, &m.UserID, &m.Sender, &m.Message, &m.CreatedAt); err != nil {
			return nil, err
		}
		messages = append(messages, m)
	}

	return messages, nil
}
