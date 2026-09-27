package auth

import (
	"context"
	"errors"
	"fmt"
	"time"

	"backend-go/pkg/hasher"
	"backend-go/pkg/token"

	"github.com/google/uuid"
)

type Service interface {
	Register(ctx context.Context, req RegisterRequest) (*AuthResponse, error)
	Login(ctx context.Context, req LoginRequest) (*AuthResponse, error)
	GetProfile(ctx context.Context, userID uuid.UUID) (*User, error)
	ChangePassword(ctx context.Context, userID uuid.UUID, req ChangePasswordRequest) error
}

type service struct {
	repo      Repository
	jwtSecret string
}

func NewService(repo Repository, jwtSecret string) Service {
	return &service{
		repo:      repo,
		jwtSecret: jwtSecret,
	}
}

func (s *service) Register(ctx context.Context, req RegisterRequest) (*AuthResponse, error) {
	role := req.Role
	if role == "" {
		role = RoleFarmer
	}

	switch role {
	case RoleFarmer:
		if req.NIC == "" {
			return nil, errors.New("NIC number is required for farmers")
		}
	case RoleShopOwner:
		if req.Email == "" && req.NIC == "" {
			return nil, errors.New("either Email or NIC number is required for shop owners")
		}
	case RoleSysAdmin:
		if req.Email == "" {
			return nil, errors.New("email address is required for system administrators")
		}
	}

	if req.Email != "" {
		existing, _ := s.repo.GetByEmail(ctx, req.Email)
		if existing != nil {
			return nil, errors.New("user with this email already exists")
		}
	}

	if req.NIC != "" {
		existing, _ := s.repo.GetByNIC(ctx, req.NIC)
		if existing != nil {
			return nil, errors.New("user with this NIC number already exists")
		}
	}

	hashedPassword, err := hasher.HashPassword(req.Password)
	if err != nil {
		return nil, fmt.Errorf("failed hashing password: %w", err)
	}

	user := &User{
		FullName:       req.FullName,
		Email:          req.Email,
		NIC:            req.NIC,
		PasswordHash:   hashedPassword,
		Role:           role,
		Phone:          req.Phone,
		ShopName:       req.ShopName,
		District:       req.District,
		City:           req.City,
		WhatsAppNumber: req.WhatsAppNumber,
	}

	if err := s.repo.CreateUser(ctx, user); err != nil {
		return nil, err
	}

	tokenSub := user.Email
	if tokenSub == "" {
		tokenSub = user.NIC
	}

	t, err := token.GenerateToken(user.ID, tokenSub, string(user.Role), s.jwtSecret, 7*24*time.Hour)
	if err != nil {
		return nil, fmt.Errorf("failed generating token: %w", err)
	}

	return &AuthResponse{
		Token: t,
		User:  *user,
	}, nil
}

func (s *service) Login(ctx context.Context, req LoginRequest) (*AuthResponse, error) {
	identifier := req.Identifier
	if identifier == "" {
		identifier = req.Email
	}

	if identifier == "" {
		return nil, errors.New("email or NIC number is required")
	}

	user, err := s.repo.GetByIdentifier(ctx, identifier)
	if err != nil {
		return nil, errors.New("invalid email/NIC or password")
	}

	if !hasher.CheckPassword(req.Password, user.PasswordHash) {
		return nil, errors.New("invalid email/NIC or password")
	}

	tokenSub := user.Email
	if tokenSub == "" {
		tokenSub = user.NIC
	}

	t, err := token.GenerateToken(user.ID, tokenSub, string(user.Role), s.jwtSecret, 7*24*time.Hour)
	if err != nil {
		return nil, fmt.Errorf("failed generating token: %w", err)
	}

	return &AuthResponse{
		Token: t,
		User:  *user,
	}, nil
}

func (s *service) GetProfile(ctx context.Context, userID uuid.UUID) (*User, error) {
	return s.repo.GetByID(ctx, userID)
}

func (s *service) ChangePassword(ctx context.Context, userID uuid.UUID, req ChangePasswordRequest) error {
	if req.CurrentPassword == "" || req.NewPassword == "" {
		return errors.New("current password and new password are required")
	}

	if len(req.NewPassword) < 6 {
		return errors.New("new password must be at least 6 characters long")
	}

	user, err := s.repo.GetByID(ctx, userID)
	if err != nil {
		return errors.New("user not found")
	}

	if !hasher.CheckPassword(req.CurrentPassword, user.PasswordHash) {
		return errors.New("current password is incorrect")
	}

	newHash, err := hasher.HashPassword(req.NewPassword)
	if err != nil {
		return fmt.Errorf("failed hashing new password: %w", err)
	}

	return s.repo.UpdatePassword(ctx, userID, newHash)
}
