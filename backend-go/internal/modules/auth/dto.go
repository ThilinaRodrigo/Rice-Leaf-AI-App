package auth

type RegisterRequest struct {
	FullName       string   `json:"full_name" binding:"required"`
	Email          string   `json:"email"`
	NIC            string   `json:"nic"`
	Password       string   `json:"password" binding:"required,min=6"`
	Role           UserRole `json:"role"`
	Phone          string   `json:"phone"`
	ShopName       string   `json:"shop_name"`
	District       string   `json:"district"`
	City           string   `json:"city"`
	WhatsAppNumber string   `json:"whatsapp_number"`
}

type LoginRequest struct {
	Identifier string `json:"identifier"`
	Email      string `json:"email"`
	Password   string `json:"password" binding:"required"`
}

type AuthResponse struct {
	Token string `json:"token"`
	User  User   `json:"user"`
}

type ChangePasswordRequest struct {
	CurrentPassword string `json:"current_password" binding:"required"`
	NewPassword     string `json:"new_password" binding:"required,min=6"`
}
