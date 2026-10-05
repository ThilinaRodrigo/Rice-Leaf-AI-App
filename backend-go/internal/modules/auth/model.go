package auth

import (
	"time"

	"github.com/google/uuid"
)

type UserRole string

const (
	RoleFarmer    UserRole = "farmer"
	RoleShopOwner UserRole = "shop_owner"
	RoleSysAdmin  UserRole = "sys_admin"
)

type User struct {
	ID             uuid.UUID `json:"id"`
	FullName       string    `json:"full_name"`
	Email          string    `json:"email,omitempty"`
	NIC            string    `json:"nic,omitempty"`
	PasswordHash   string    `json:"-"`
	Role           UserRole  `json:"role"`
	Phone          string    `json:"phone,omitempty"`
	ShopName       string    `json:"shop_name,omitempty"`
	District       string    `json:"district,omitempty"`
	City           string    `json:"city,omitempty"`
	WhatsAppNumber string    `json:"whatsapp_number,omitempty"`
	AvatarURL      string    `json:"avatar_url,omitempty"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}
