package repository

import (
	"context"
	"database/sql"
	"errors"
	"fmt"

	"backend-go/internal/domain"

	"github.com/google/uuid"
)

type UserRepository interface {
	CreateUser(ctx context.Context, user *domain.User) error
	GetByEmail(ctx context.Context, email string) (*domain.User, error)
	GetByNIC(ctx context.Context, nic string) (*domain.User, error)
	GetByIdentifier(ctx context.Context, identifier string) (*domain.User, error)
	GetByID(ctx context.Context, id uuid.UUID) (*domain.User, error)
}

type userRepository struct {
	db *sql.DB
}

func NewUserRepository(db *sql.DB) UserRepository {
	return &userRepository{db: db}
}

func (r *userRepository) CreateUser(ctx context.Context, u *domain.User) error {
	if r.db == nil {
		u.ID = uuid.New()
		return nil
	}
	if u.Role == "" {
		u.Role = domain.RoleFarmer
	}
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
	return nil
}

func (r *userRepository) GetByEmail(ctx context.Context, email string) (*domain.User, error) {
	if r.db == nil || email == "" {
		return nil, errors.New("user not found")
	}
	query := `
		SELECT id, full_name, COALESCE(email, ''), COALESCE(nic, ''), password_hash, COALESCE(role, 'farmer'), COALESCE(phone, ''), COALESCE(shop_name, ''), COALESCE(district, ''), COALESCE(city, ''), COALESCE(whatsapp_number, ''), COALESCE(avatar_url, ''), created_at, updated_at
		FROM users
		WHERE email IS NOT NULL AND LOWER(email) = LOWER($1)
	`
	u := &domain.User{}
	err := r.db.QueryRowContext(ctx, query, email).
		Scan(&u.ID, &u.FullName, &u.Email, &u.NIC, &u.PasswordHash, &u.Role, &u.Phone, &u.ShopName, &u.District, &u.City, &u.WhatsAppNumber, &u.AvatarURL, &u.CreatedAt, &u.UpdatedAt)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, errors.New("user not found")
		}
		return nil, err
	}
	return u, nil
}

func (r *userRepository) GetByNIC(ctx context.Context, nic string) (*domain.User, error) {
	if r.db == nil || nic == "" {
		return nil, errors.New("user not found")
	}
	query := `
		SELECT id, full_name, COALESCE(email, ''), COALESCE(nic, ''), password_hash, COALESCE(role, 'farmer'), COALESCE(phone, ''), COALESCE(shop_name, ''), COALESCE(district, ''), COALESCE(city, ''), COALESCE(whatsapp_number, ''), COALESCE(avatar_url, ''), created_at, updated_at
		FROM users
		WHERE nic IS NOT NULL AND LOWER(nic) = LOWER($1)
	`
	u := &domain.User{}
	err := r.db.QueryRowContext(ctx, query, nic).
		Scan(&u.ID, &u.FullName, &u.Email, &u.NIC, &u.PasswordHash, &u.Role, &u.Phone, &u.ShopName, &u.District, &u.City, &u.WhatsAppNumber, &u.AvatarURL, &u.CreatedAt, &u.UpdatedAt)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, errors.New("user not found")
		}
		return nil, err
	}
	return u, nil
}

func (r *userRepository) GetByIdentifier(ctx context.Context, identifier string) (*domain.User, error) {
	if r.db == nil || identifier == "" {
		return nil, errors.New("user not found")
	}
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
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, errors.New("user not found")
		}
		return nil, err
	}
	return u, nil
}

func (r *userRepository) GetByID(ctx context.Context, id uuid.UUID) (*domain.User, error) {
	if r.db == nil {
		return nil, errors.New("database not connected")
	}
	query := `
		SELECT id, full_name, COALESCE(email, ''), COALESCE(nic, ''), password_hash, COALESCE(role, 'farmer'), COALESCE(phone, ''), COALESCE(shop_name, ''), COALESCE(district, ''), COALESCE(city, ''), COALESCE(whatsapp_number, ''), COALESCE(avatar_url, ''), created_at, updated_at
		FROM users
		WHERE id = $1
	`
	u := &domain.User{}
	err := r.db.QueryRowContext(ctx, query, id).
		Scan(&u.ID, &u.FullName, &u.Email, &u.NIC, &u.PasswordHash, &u.Role, &u.Phone, &u.ShopName, &u.District, &u.City, &u.WhatsAppNumber, &u.AvatarURL, &u.CreatedAt, &u.UpdatedAt)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, errors.New("user not found")
		}
		return nil, err
	}
	return u, nil
}
