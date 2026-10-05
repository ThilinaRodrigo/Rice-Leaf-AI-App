package chat

type SendMessageRequest struct {
	Message string `json:"message" binding:"required"`
}
