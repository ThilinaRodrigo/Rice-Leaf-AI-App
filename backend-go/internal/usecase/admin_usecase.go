package usecase

import (
	"context"

	"backend-go/internal/domain"
	"backend-go/internal/repository"

	"github.com/google/uuid"
)

type AdminUseCase interface {
	GetStats(ctx context.Context) (*repository.AdminStats, error)
	GetAllUsers(ctx context.Context) ([]domain.User, error)
	DeleteUser(ctx context.Context, id uuid.UUID) error
	GetAllScans(ctx context.Context) ([]repository.AdminScan, error)
}

type adminUseCase struct {
	adminRepo repository.AdminRepository
}

func NewAdminUseCase(adminRepo repository.AdminRepository) AdminUseCase {
	return &adminUseCase{adminRepo: adminRepo}
}

func (u *adminUseCase) GetStats(ctx context.Context) (*repository.AdminStats, error) {
	return u.adminRepo.GetStats(ctx)
}

func (u *adminUseCase) GetAllUsers(ctx context.Context) ([]domain.User, error) {
	return u.adminRepo.GetAllUsers(ctx)
}

func (u *adminUseCase) DeleteUser(ctx context.Context, id uuid.UUID) error {
	return u.adminRepo.DeleteUser(ctx, id)
}

func (u *adminUseCase) GetAllScans(ctx context.Context) ([]repository.AdminScan, error) {
	return u.adminRepo.GetAllScans(ctx)
}
