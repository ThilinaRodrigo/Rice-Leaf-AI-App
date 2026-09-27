package admin

import (
	"time"

	"github.com/google/uuid"
)

type AdminStats struct {
	TotalFarmers     int            `json:"total_farmers"`
	TotalShopOwners  int            `json:"total_shop_owners"`
	TotalSysAdmins   int            `json:"total_sys_admins"`
	TotalScans       int            `json:"total_scans"`
	TotalProducts    int            `json:"total_products"`
	DiseaseBreakdown map[string]int `json:"disease_breakdown"`
}

type AdminScan struct {
	ID         uuid.UUID  `json:"id"`
	UserID     *uuid.UUID `json:"user_id,omitempty"`
	UserName   string     `json:"user_name,omitempty"`
	UserRole   string     `json:"user_role,omitempty"`
	ImageURL   string     `json:"image_url"`
	ClassID    int        `json:"class_id"`
	Label      string     `json:"label"`
	Confidence float64    `json:"confidence"`
	CreatedAt  time.Time  `json:"created_at"`
}
