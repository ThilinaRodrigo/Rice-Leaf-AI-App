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
	GetByID(ctx context.Context, id uuid.UUID) (*domain.User, error)
}

type userRepository struct {
	db *sql.DB
}

func NewUserRepository(db *sql.DB) UserRepository {
	return &userRepository{db: db}
}

func (r *userRepository) CreateUser(ctx context.Context, u *domain.User) error {
	query := `
		INSERT INTO users (full_name, email, password_hash, phone, avatar_url)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id, created_at, updated_at
	`
	err := r.db.QueryRowContext(ctx, query, u.FullName, u.Email, u.PasswordHash, u.Phone, u.AvatarURL).
		Scan(&u.ID, &u.CreatedAt, &u.UpdatedAt)
	if err != nil {
		return fmt.Errorf("error inserting user: %w", err)
	}
	return nil
}

func (r *userRepository) GetByEmail(ctx context.Context, email string) (*domain.User, error) {
	query := `
		SELECT id, full_name, email, password_hash, COALESCE(phone, ''), COALESCE(avatar_url, ''), created_at, updated_at
		FROM users
		WHERE email = $1
	`
	u := &domain.User{}
	err := r.db.QueryRowContext(ctx, query, email).
		Scan(&u.ID, &u.FullName, &u.Email, &u.PasswordHash, &u.Phone, &u.AvatarURL, &u.CreatedAt, &u.UpdatedAt)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, errors.New("user not found")
		}
		return nil, err
	}
	return u, nil
}

func (r *userRepository) GetByID(ctx context.Context, id uuid.UUID) (*domain.User, error) {
	query := `
		SELECT id, full_name, email, password_hash, COALESCE(phone, ''), COALESCE(avatar_url, ''), created_at, updated_at
		FROM users
		WHERE id = $1
	`
	u := &domain.User{}
	err := r.db.QueryRowContext(ctx, query, id).
		Scan(&u.ID, &u.FullName, &u.Email, &u.PasswordHash, &u.Phone, &u.AvatarURL, &u.CreatedAt, &u.UpdatedAt)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, errors.New("user not found")
		}
		return nil, err
	}
	return u, nil
}
