package usecase

import (
	"context"
	"errors"
	"fmt"
	"time"

	"backend-go/internal/domain"
	"backend-go/internal/repository"
	"backend-go/pkg/hasher"
	"backend-go/pkg/token"

	"github.com/google/uuid"
)

type AuthUseCase interface {
	Register(ctx context.Context, req domain.RegisterRequest) (*domain.AuthResponse, error)
	Login(ctx context.Context, req domain.LoginRequest) (*domain.AuthResponse, error)
	GetProfile(ctx context.Context, userID uuid.UUID) (*domain.User, error)
}

type authUseCase struct {
	userRepo  repository.UserRepository
	jwtSecret string
}

func NewAuthUseCase(userRepo repository.UserRepository, jwtSecret string) AuthUseCase {
	return &authUseCase{
		userRepo:  userRepo,
		jwtSecret: jwtSecret,
	}
}

func (u *authUseCase) Register(ctx context.Context, req domain.RegisterRequest) (*domain.AuthResponse, error) {
	role := req.Role
	if role == "" {
		role = domain.RoleFarmer
	}

	// Role-specific validation
	switch role {
	case domain.RoleFarmer:
		if req.NIC == "" {
			return nil, errors.New("NIC number is required for farmers")
		}
	case domain.RoleShopOwner:
		if req.Email == "" && req.NIC == "" {
			return nil, errors.New("either Email or NIC number is required for shop owners")
		}
	case domain.RoleSysAdmin:
		if req.Email == "" {
			return nil, errors.New("email address is required for system administrators")
		}
	}

	// Check existing by Email if provided
	if req.Email != "" {
		existing, _ := u.userRepo.GetByEmail(ctx, req.Email)
		if existing != nil {
			return nil, errors.New("user with this email already exists")
		}
	}

	// Check existing by NIC if provided
	if req.NIC != "" {
		existing, _ := u.userRepo.GetByNIC(ctx, req.NIC)
		if existing != nil {
			return nil, errors.New("user with this NIC number already exists")
		}
	}

	hashedPassword, err := hasher.HashPassword(req.Password)
	if err != nil {
		return nil, fmt.Errorf("failed hashing password: %w", err)
	}

	user := &domain.User{
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

	if err := u.userRepo.CreateUser(ctx, user); err != nil {
		return nil, err
	}

	tokenSub := user.Email
	if tokenSub == "" {
		tokenSub = user.NIC
	}

	t, err := token.GenerateToken(user.ID, tokenSub, u.jwtSecret, 7*24*time.Hour)
	if err != nil {
		return nil, fmt.Errorf("failed generating token: %w", err)
	}

	return &domain.AuthResponse{
		Token: t,
		User:  *user,
	}, nil
}

func (u *authUseCase) Login(ctx context.Context, req domain.LoginRequest) (*domain.AuthResponse, error) {
	identifier := req.Identifier
	if identifier == "" {
		identifier = req.Email
	}

	if identifier == "" {
		return nil, errors.New("email or NIC number is required")
	}

	user, err := u.userRepo.GetByIdentifier(ctx, identifier)
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

	t, err := token.GenerateToken(user.ID, tokenSub, u.jwtSecret, 7*24*time.Hour)
	if err != nil {
		return nil, fmt.Errorf("failed generating token: %w", err)
	}

	return &domain.AuthResponse{
		Token: t,
		User:  *user,
	}, nil
}

func (u *authUseCase) GetProfile(ctx context.Context, userID uuid.UUID) (*domain.User, error) {
	return u.userRepo.GetByID(ctx, userID)
}
