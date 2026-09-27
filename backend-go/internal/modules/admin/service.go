package admin

import (
	"context"

	"backend-go/internal/modules/auth"

	"github.com/google/uuid"
)

type Service interface {
	GetStats(ctx context.Context) (*AdminStats, error)
	GetAllUsers(ctx context.Context) ([]auth.User, error)
	DeleteUser(ctx context.Context, id uuid.UUID) error
	GetAllScans(ctx context.Context) ([]AdminScan, error)
}

type service struct {
	repo Repository
}

func NewService(repo Repository) Service {
	return &service{repo: repo}
}

func (s *service) GetStats(ctx context.Context) (*AdminStats, error) {
	return s.repo.GetStats(ctx)
}

func (s *service) GetAllUsers(ctx context.Context) ([]auth.User, error) {
	return s.repo.GetAllUsers(ctx)
}

func (s *service) DeleteUser(ctx context.Context, id uuid.UUID) error {
	return s.repo.DeleteUser(ctx, id)
}

func (s *service) GetAllScans(ctx context.Context) ([]AdminScan, error) {
	return s.repo.GetAllScans(ctx)
}
