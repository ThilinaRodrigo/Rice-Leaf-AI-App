package auth

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"strings"
	"sync"
	"time"

	"github.com/google/uuid"
)

type Repository interface {
	CreateUser(ctx context.Context, user *User) error
	GetByEmail(ctx context.Context, email string) (*User, error)
	GetByNIC(ctx context.Context, nic string) (*User, error)
	GetByIdentifier(ctx context.Context, identifier string) (*User, error)
	GetByID(ctx context.Context, id uuid.UUID) (*User, error)
	UpdatePassword(ctx context.Context, id uuid.UUID, newPasswordHash string) error
	GetAllUsers(ctx context.Context) ([]User, error)
	DeleteUser(ctx context.Context, id uuid.UUID) error
}

type repository struct {
	db       *sql.DB
	memUsers map[string]*User
	mu       sync.RWMutex
}

func NewRepository(db *sql.DB) Repository {
	repo := &repository{
		db:       db,
		memUsers: make(map[string]*User),
	}

	adminID := uuid.MustParse("00000000-0000-0000-0000-000000000001")
	adminUser := &User{
		ID:           adminID,
		FullName:     "System Administrator",
		Email:        "admin@riceleaf.lk",
		PasswordHash: "$2a$10$cVyhfPbv/olF8fVJ4yI4YujbWOQqlEu7iSJT0p3VP4QagY6HSztLO",
		Role:         RoleSysAdmin,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}

	repo.memUsers[adminID.String()] = adminUser
	repo.memUsers["admin@riceleaf.lk"] = adminUser

	return repo
}

func (r *repository) saveMemUser(u *User) {
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

func (r *repository) getMemUser(identifier string) *User {
	r.mu.RLock()
	defer r.mu.RUnlock()
	return r.memUsers[strings.ToLower(identifier)]
}

func (r *repository) CreateUser(ctx context.Context, u *User) error {
	if u.Role == "" {
		u.Role = RoleFarmer
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

func (r *repository) GetByEmail(ctx context.Context, email string) (*User, error) {
	if email == "" {
		return nil, errors.New("user not found")
	}

	if r.db != nil {
		query := `
			SELECT id, full_name, COALESCE(email, ''), COALESCE(nic, ''), password_hash, COALESCE(role, 'farmer'), COALESCE(phone, ''), COALESCE(shop_name, ''), COALESCE(district, ''), COALESCE(city, ''), COALESCE(whatsapp_number, ''), COALESCE(avatar_url, ''), created_at, updated_at
			FROM users
			WHERE email IS NOT NULL AND LOWER(email) = LOWER($1)
		`
		u := &User{}
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

func (r *repository) GetByNIC(ctx context.Context, nic string) (*User, error) {
	if nic == "" {
		return nil, errors.New("user not found")
	}

	if r.db != nil {
		query := `
			SELECT id, full_name, COALESCE(email, ''), COALESCE(nic, ''), password_hash, COALESCE(role, 'farmer'), COALESCE(phone, ''), COALESCE(shop_name, ''), COALESCE(district, ''), COALESCE(city, ''), COALESCE(whatsapp_number, ''), COALESCE(avatar_url, ''), created_at, updated_at
			FROM users
			WHERE nic IS NOT NULL AND LOWER(nic) = LOWER($1)
		`
		u := &User{}
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

func (r *repository) GetByIdentifier(ctx context.Context, identifier string) (*User, error) {
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
		u := &User{}
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

func (r *repository) GetByID(ctx context.Context, id uuid.UUID) (*User, error) {
	if r.db != nil {
		query := `
			SELECT id, full_name, COALESCE(email, ''), COALESCE(nic, ''), password_hash, COALESCE(role, 'farmer'), COALESCE(phone, ''), COALESCE(shop_name, ''), COALESCE(district, ''), COALESCE(city, ''), COALESCE(whatsapp_number, ''), COALESCE(avatar_url, ''), created_at, updated_at
			FROM users
			WHERE id = $1
		`
		u := &User{}
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

func (r *repository) UpdatePassword(ctx context.Context, id uuid.UUID, newPasswordHash string) error {
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

func (r *repository) GetAllUsers(ctx context.Context) ([]User, error) {
	if r.db != nil {
		query := `
			SELECT id, full_name, COALESCE(email, ''), COALESCE(nic, ''), password_hash, COALESCE(role, 'farmer'), COALESCE(phone, ''), COALESCE(shop_name, ''), COALESCE(district, ''), COALESCE(city, ''), COALESCE(whatsapp_number, ''), COALESCE(avatar_url, ''), created_at, updated_at
			FROM users ORDER BY created_at DESC
		`
		rows, err := r.db.QueryContext(ctx, query)
		if err == nil {
			defer rows.Close()
			var users []User
			for rows.Next() {
				var u User
				if err := rows.Scan(&u.ID, &u.FullName, &u.Email, &u.NIC, &u.PasswordHash, &u.Role, &u.Phone, &u.ShopName, &u.District, &u.City, &u.WhatsAppNumber, &u.AvatarURL, &u.CreatedAt, &u.UpdatedAt); err == nil {
					users = append(users, u)
				}
			}
			return users, nil
		}
	}

	r.mu.RLock()
	defer r.mu.RUnlock()
	var list []User
	seen := make(map[string]bool)
	for _, u := range r.memUsers {
		if !seen[u.ID.String()] {
			seen[u.ID.String()] = true
			list = append(list, *u)
		}
	}
	return list, nil
}

func (r *repository) DeleteUser(ctx context.Context, id uuid.UUID) error {
	if r.db != nil {
		_, err := r.db.ExecContext(ctx, `DELETE FROM users WHERE id = $1`, id)
		if err != nil {
			return err
		}
	}
	r.mu.Lock()
	defer r.mu.Unlock()
	delete(r.memUsers, id.String())
	return nil
}
