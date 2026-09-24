package repository

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"strings"
	"sync"
	"time"

	"backend-go/internal/domain"

	"github.com/google/uuid"
)

type UserRepository interface {
	CreateUser(ctx context.Context, user *domain.User) error
	GetByEmail(ctx context.Context, email string) (*domain.User, error)
	GetByNIC(ctx context.Context, nic string) (*domain.User, error)
	GetByIdentifier(ctx context.Context, identifier string) (*domain.User, error)
	GetByID(ctx context.Context, id uuid.UUID) (*domain.User, error)
	UpdatePassword(ctx context.Context, id uuid.UUID, newPasswordHash string) error
}

type userRepository struct {
	db       *sql.DB
	memUsers map[string]*domain.User
	mu       sync.RWMutex
}

func NewUserRepository(db *sql.DB) UserRepository {
	repo := &userRepository{
		db:       db,
		memUsers: make(map[string]*domain.User),
	}

	// Seed default System Administrator: admin@riceleaf.lk / admin123
	adminID := uuid.MustParse("00000000-0000-0000-0000-000000000001")
	adminUser := &domain.User{
		ID:           adminID,
		FullName:     "System Administrator",
		Email:        "admin@riceleaf.lk",
		PasswordHash: "$2a$10$ZM3/PPhkiCzQN9GInT0K..VfvZBvexgeoCMZZOFTZi2VjOu.wNK1K",
		Role:         domain.RoleSysAdmin,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}

	repo.memUsers[adminID.String()] = adminUser
	repo.memUsers["admin@riceleaf.lk"] = adminUser

	return repo
}

func (r *userRepository) saveMemUser(u *domain.User) {
	r.mu.Lock()
	defer r.mu.Unlock()
	if u.ID != uuid.Nil {
		r.memUsers[u.ID.String()] = u
	}
	if u.Email != "" {
		r.memUsers[strings.ToLower(u.Email)] = u
	}
	if u.NIC != "" {
		r.memUsers[strings.ToLower(u.NIC)] = u
	}
}

func (r *userRepository) getMemUser(identifier string) *domain.User {
	r.mu.RLock()
	defer r.mu.RUnlock()
	return r.memUsers[strings.ToLower(identifier)]
}

func (r *userRepository) CreateUser(ctx context.Context, u *domain.User) error {
	if u.Role == "" {
		u.Role = domain.RoleFarmer
	}

	if r.db != nil {
		query := `
			INSERT INTO users (full_name, email, nic, password_hash, role, phone, shop_name, district, city, whatsapp_number, avatar_url)
			VALUES ($1, NULLIF($2, ''), NULLIF($3, ''), $4, $5, $6, $7, $8, $9, $10, $11)
			RETURNING id, created_at, updated_at
		`
		err := r.db.QueryRowContext(ctx, query, u.FullName, u.Email, u.NIC, u.PasswordHash, u.Role, u.Phone, u.ShopName, u.District, u.City, u.WhatsAppNumber, u.AvatarURL).
			Scan(&u.ID, &u.CreatedAt, &u.UpdatedAt)
		if err != nil {
			return fmt.Errorf("error inserting user: %w", err)
		}
	} else {
		u.ID = uuid.New()
		u.CreatedAt = time.Now()
		u.UpdatedAt = time.Now()
	}

	r.saveMemUser(u)
	return nil
}

func (r *userRepository) GetByEmail(ctx context.Context, email string) (*domain.User, error) {
	if email == "" {
		return nil, errors.New("user not found")
	}

	if r.db != nil {
		query := `
			SELECT id, full_name, COALESCE(email, ''), COALESCE(nic, ''), password_hash, COALESCE(role, 'farmer'), COALESCE(phone, ''), COALESCE(shop_name, ''), COALESCE(district, ''), COALESCE(city, ''), COALESCE(whatsapp_number, ''), COALESCE(avatar_url, ''), created_at, updated_at
			FROM users
			WHERE email IS NOT NULL AND LOWER(email) = LOWER($1)
		`
		u := &domain.User{}
		err := r.db.QueryRowContext(ctx, query, email).
			Scan(&u.ID, &u.FullName, &u.Email, &u.NIC, &u.PasswordHash, &u.Role, &u.Phone, &u.ShopName, &u.District, &u.City, &u.WhatsAppNumber, &u.AvatarURL, &u.CreatedAt, &u.UpdatedAt)
		if err == nil {
			return u, nil
		}
	}

	if mem := r.getMemUser(email); mem != nil {
		return mem, nil
	}

	return nil, errors.New("user not found")
}

func (r *userRepository) GetByNIC(ctx context.Context, nic string) (*domain.User, error) {
	if nic == "" {
		return nil, errors.New("user not found")
	}

	if r.db != nil {
		query := `
			SELECT id, full_name, COALESCE(email, ''), COALESCE(nic, ''), password_hash, COALESCE(role, 'farmer'), COALESCE(phone, ''), COALESCE(shop_name, ''), COALESCE(district, ''), COALESCE(city, ''), COALESCE(whatsapp_number, ''), COALESCE(avatar_url, ''), created_at, updated_at
			FROM users
			WHERE nic IS NOT NULL AND LOWER(nic) = LOWER($1)
		`
		u := &domain.User{}
		err := r.db.QueryRowContext(ctx, query, nic).
			Scan(&u.ID, &u.FullName, &u.Email, &u.NIC, &u.PasswordHash, &u.Role, &u.Phone, &u.ShopName, &u.District, &u.City, &u.WhatsAppNumber, &u.AvatarURL, &u.CreatedAt, &u.UpdatedAt)
		if err == nil {
			return u, nil
		}
	}

	if mem := r.getMemUser(nic); mem != nil {
		return mem, nil
	}

	return nil, errors.New("user not found")
}

func (r *userRepository) GetByIdentifier(ctx context.Context, identifier string) (*domain.User, error) {
	if identifier == "" {
		return nil, errors.New("user not found")
	}

	if r.db != nil {
		query := `
			SELECT id, full_name, COALESCE(email, ''), COALESCE(nic, ''), password_hash, COALESCE(role, 'farmer'), COALESCE(phone, ''), COALESCE(shop_name, ''), COALESCE(district, ''), COALESCE(city, ''), COALESCE(whatsapp_number, ''), COALESCE(avatar_url, ''), created_at, updated_at
			FROM users
			WHERE (email IS NOT NULL AND LOWER(email) = LOWER($1))
			   OR (nic IS NOT NULL AND LOWER(nic) = LOWER($1))
			LIMIT 1
		`
		u := &domain.User{}
		err := r.db.QueryRowContext(ctx, query, identifier).
			Scan(&u.ID, &u.FullName, &u.Email, &u.NIC, &u.PasswordHash, &u.Role, &u.Phone, &u.ShopName, &u.District, &u.City, &u.WhatsAppNumber, &u.AvatarURL, &u.CreatedAt, &u.UpdatedAt)
		if err == nil {
			return u, nil
		}
	}

	if mem := r.getMemUser(identifier); mem != nil {
		return mem, nil
	}

	return nil, errors.New("user not found")
}

func (r *userRepository) GetByID(ctx context.Context, id uuid.UUID) (*domain.User, error) {
	if r.db != nil {
		query := `
			SELECT id, full_name, COALESCE(email, ''), COALESCE(nic, ''), password_hash, COALESCE(role, 'farmer'), COALESCE(phone, ''), COALESCE(shop_name, ''), COALESCE(district, ''), COALESCE(city, ''), COALESCE(whatsapp_number, ''), COALESCE(avatar_url, ''), created_at, updated_at
			FROM users
			WHERE id = $1
		`
		u := &domain.User{}
		err := r.db.QueryRowContext(ctx, query, id).
			Scan(&u.ID, &u.FullName, &u.Email, &u.NIC, &u.PasswordHash, &u.Role, &u.Phone, &u.ShopName, &u.District, &u.City, &u.WhatsAppNumber, &u.AvatarURL, &u.CreatedAt, &u.UpdatedAt)
		if err == nil {
			return u, nil
		}
	}

	if mem := r.getMemUser(id.String()); mem != nil {
		return mem, nil
	}

	return nil, errors.New("user not found")
}

func (r *userRepository) UpdatePassword(ctx context.Context, id uuid.UUID, newPasswordHash string) error {
	if r.db != nil {
		query := `UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2`
		_, err := r.db.ExecContext(ctx, query, newPasswordHash, id)
		if err != nil {
			return fmt.Errorf("failed updating password in db: %w", err)
		}
	}

	r.mu.Lock()
	defer r.mu.Unlock()
	if mem, ok := r.memUsers[id.String()]; ok {
		mem.PasswordHash = newPasswordHash
		mem.UpdatedAt = time.Now()
	}
	return nil
}
