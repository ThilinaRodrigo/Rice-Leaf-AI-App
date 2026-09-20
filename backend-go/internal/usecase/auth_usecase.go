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
	existing, _ := u.userRepo.GetByEmail(ctx, req.Email)
	if existing != nil {
		return nil, errors.New("user with this email already exists")
	}

	hashedPassword, err := hasher.HashPassword(req.Password)
	if err != nil {
		return nil, fmt.Errorf("failed hashing password: %w", err)
	}

	user := &domain.User{
		FullName:     req.FullName,
		Email:        req.Email,
		PasswordHash: hashedPassword,
		Phone:        req.Phone,
	}

	if err := u.userRepo.CreateUser(ctx, user); err != nil {
		return nil, err
	}

	t, err := token.GenerateToken(user.ID, user.Email, u.jwtSecret, 7*24*time.Hour)
	if err != nil {
		return nil, fmt.Errorf("failed generating token: %w", err)
	}

	return &domain.AuthResponse{
		Token: t,
		User:  *user,
	}, nil
}

func (u *authUseCase) Login(ctx context.Context, req domain.LoginRequest) (*domain.AuthResponse, error) {
	user, err := u.userRepo.GetByEmail(ctx, req.Email)
	if err != nil {
		return nil, errors.New("invalid email or password")
	}

	if !hasher.CheckPassword(req.Password, user.PasswordHash) {
		return nil, errors.New("invalid email or password")
	}

	t, err := token.GenerateToken(user.ID, user.Email, u.jwtSecret, 7*24*time.Hour)
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
