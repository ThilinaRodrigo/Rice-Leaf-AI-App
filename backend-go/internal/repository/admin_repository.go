package repository

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"backend-go/internal/domain"

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
	ID         uuid.UUID `json:"id"`
	UserID     *uuid.UUID `json:"user_id,omitempty"`
	UserName   string    `json:"user_name,omitempty"`
	UserRole   string    `json:"user_role,omitempty"`
	ImageURL   string    `json:"image_url"`
	ClassID    int       `json:"class_id"`
	Label      string    `json:"label"`
	Confidence float64   `json:"confidence"`
	CreatedAt  time.Time `json:"created_at"`
}

type AdminRepository interface {
	GetStats(ctx context.Context) (*AdminStats, error)
	GetAllUsers(ctx context.Context) ([]domain.User, error)
	DeleteUser(ctx context.Context, id uuid.UUID) error
	GetAllScans(ctx context.Context) ([]AdminScan, error)
}

type adminRepository struct {
	db *sql.DB
}

func NewAdminRepository(db *sql.DB) AdminRepository {
	return &adminRepository{db: db}
}

func (r *adminRepository) GetStats(ctx context.Context) (*AdminStats, error) {
	stats := &AdminStats{
		DiseaseBreakdown: make(map[string]int),
	}

	if r.db == nil {
		return stats, nil
	}

	// Counts
	_ = r.db.QueryRowContext(ctx, "SELECT COUNT(*) FROM users WHERE role = 'farmer'").Scan(&stats.TotalFarmers)
	_ = r.db.QueryRowContext(ctx, "SELECT COUNT(*) FROM users WHERE role = 'shop_owner'").Scan(&stats.TotalShopOwners)
	_ = r.db.QueryRowContext(ctx, "SELECT COUNT(*) FROM users WHERE role = 'sys_admin'").Scan(&stats.TotalSysAdmins)
	_ = r.db.QueryRowContext(ctx, "SELECT COUNT(*) FROM scans").Scan(&stats.TotalScans)
	_ = r.db.QueryRowContext(ctx, "SELECT COUNT(*) FROM products").Scan(&stats.TotalProducts)

	// Disease breakdown
	rows, err := r.db.QueryContext(ctx, "SELECT label, COUNT(*) FROM scans GROUP BY label")
	if err == nil {
		defer rows.Close()
		for rows.Next() {
			var label string
			var count int
			if err := rows.Scan(&label, &count); err == nil {
				stats.DiseaseBreakdown[label] = count
			}
		}
	}

	return stats, nil
}

func (r *adminRepository) GetAllUsers(ctx context.Context) ([]domain.User, error) {
	if r.db == nil {
		return []domain.User{}, nil
	}

	query := `
		SELECT id, full_name, COALESCE(email, ''), COALESCE(nic, ''), COALESCE(role, 'farmer'), COALESCE(phone, ''), COALESCE(shop_name, ''), COALESCE(district, ''), COALESCE(city, ''), COALESCE(whatsapp_number, ''), COALESCE(avatar_url, ''), created_at, updated_at
		FROM users
		ORDER BY created_at DESC
	`

	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("error querying users: %w", err)
	}
	defer rows.Close()

	users := []domain.User{}
	for rows.Next() {
		var u domain.User
		if err := rows.Scan(&u.ID, &u.FullName, &u.Email, &u.NIC, &u.Role, &u.Phone, &u.ShopName, &u.District, &u.City, &u.WhatsAppNumber, &u.AvatarURL, &u.CreatedAt, &u.UpdatedAt); err != nil {
			continue
		}
		users = append(users, u)
	}

	return users, nil
}

func (r *adminRepository) DeleteUser(ctx context.Context, id uuid.UUID) error {
	if r.db == nil {
		return nil
	}
	_, err := r.db.ExecContext(ctx, "DELETE FROM users WHERE id = $1", id)
	return err
}

func (r *adminRepository) GetAllScans(ctx context.Context) ([]AdminScan, error) {
	if r.db == nil {
		return []AdminScan{}, nil
	}

	query := `
		SELECT s.id, s.user_id, COALESCE(u.full_name, 'Guest Farmer'), COALESCE(u.role, 'guest'), s.image_url, s.class_id, s.label, s.confidence, s.created_at
		FROM scans s
		LEFT JOIN users u ON s.user_id = u.id
		ORDER BY s.created_at DESC
		LIMIT 200
	`

	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	scans := []AdminScan{}
	for rows.Next() {
		var s AdminScan
		if err := rows.Scan(&s.ID, &s.UserID, &s.UserName, &s.UserRole, &s.ImageURL, &s.ClassID, &s.Label, &s.Confidence, &s.CreatedAt); err != nil {
			continue
		}
		scans = append(scans, s)
	}

	return scans, nil
}
