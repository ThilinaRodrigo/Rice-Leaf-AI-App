package usecase

import (
	"context"
	"strings"
	"time"

	"backend-go/internal/domain"
	"backend-go/internal/repository"

	"github.com/google/uuid"
)

type ChatUseCase interface {
	SendMessage(ctx context.Context, userID *uuid.UUID, userMsg string) (*domain.ChatMessage, error)
	GetChatHistory(ctx context.Context, userID uuid.UUID) ([]domain.ChatMessage, error)
}

type chatUseCase struct {
	chatRepo repository.ChatRepository
}

func NewChatUseCase(chatRepo repository.ChatRepository) ChatUseCase {
	return &chatUseCase{chatRepo: chatRepo}
}

func (u *chatUseCase) SendMessage(ctx context.Context, userID *uuid.UUID, userMsg string) (*domain.ChatMessage, error) {
	// 1. Save user message
	userChatMessage := &domain.ChatMessage{
		UserID:    userID,
		Sender:    "user",
		Message:   userMsg,
		CreatedAt: time.Now(),
	}
	if userID != nil {
		_ = u.chatRepo.SaveMessage(ctx, userChatMessage)
	}

	// 2. Generate bot advice
	botReplyText := generateRiceAgronomyResponse(userMsg)

	// 3. Save bot response
	botChatMessage := &domain.ChatMessage{
		UserID:    userID,
		Sender:    "bot",
		Message:   botReplyText,
		CreatedAt: time.Now(),
	}
	if userID != nil {
		_ = u.chatRepo.SaveMessage(ctx, botChatMessage)
	}

	return botChatMessage, nil
}

func (u *chatUseCase) GetChatHistory(ctx context.Context, userID uuid.UUID) ([]domain.ChatMessage, error) {
	return u.chatRepo.GetHistoryByUserID(ctx, userID)
}

func generateRiceAgronomyResponse(input string) string {
	lower := strings.ToLower(input)

	if strings.Contains(lower, "product") || strings.Contains(lower, "recommend") || strings.Contains(lower, "medicine") {
		return "For Rice Leaf Disease management in Sri Lanka, recommended treatments include:\n\n1. Copper-based bactericides (e.g., Kocide 3000) for Bacterial Blight.\n2. Propiconazole / Mancozeb foliar spray for Fungal leaf spots & scald.\n3. Burnt Paddy Husk (250kg/acre) & Potassium fertilizer to build crop immunity.\n\nYou can purchase these items in our Agri Market section!"
	}

	if strings.Contains(lower, "schedule") || strings.Contains(lower, "when") || strings.Contains(lower, "fertilizer") {
		return "Application & Fertilization Schedule (DOA Guidelines):\n\n• Basal Application: Apply MOP & TSP during land preparation.\n• Top Dressing: Apply Urea based on Leaf Color Chart (LCC) values (3 or 4).\n• Spraying: Apply fungicides early morning (6:30 - 9:00 AM) or late afternoon. Avoid spraying right before heavy rainfall."
	}

	if strings.Contains(lower, "prevention") || strings.Contains(lower, "prevent") || strings.Contains(lower, "water") {
		return "Key Rice Disease Prevention Practices:\n\n✓ Drain excess field water immediately if bacterial blight is detected.\n✓ Maintain optimal planting distance (20cm x 20cm) for proper air circulation.\n✓ Use certified seeds (Bg 352, At 362) treated with hot water (53-54°C).\n✓ Avoid over-application of Urea nitrogen fertilizer."
	}

	return "I am your Rice Crop AI Assistant! I can help you with leaf disease diagnosis, pesticide recommendations, Department of Agriculture (DOA) fertilizer guidelines, and field management tips. What specific question do you have today?"
}
