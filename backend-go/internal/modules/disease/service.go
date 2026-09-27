package disease

import (
	"context"
)

type Service interface {
	GetAllDiseases(ctx context.Context) ([]Disease, error)
	GetDiseaseByClassID(ctx context.Context, classID int) (*Disease, error)
	CreateDisease(ctx context.Context, disease *Disease) error
	UpdateDisease(ctx context.Context, classID int, disease *Disease) error
	DeleteDisease(ctx context.Context, classID int) error
}

type service struct {
	repo Repository
}

func NewService(repo Repository) Service {
	return &service{repo: repo}
}

func (s *service) GetAllDiseases(ctx context.Context) ([]Disease, error) {
	return s.repo.GetAll(ctx)
}

func (s *service) GetDiseaseByClassID(ctx context.Context, classID int) (*Disease, error) {
	return s.repo.GetByClassID(ctx, classID)
}

func (s *service) CreateDisease(ctx context.Context, disease *Disease) error {
	return s.repo.Create(ctx, disease)
}

func (s *service) UpdateDisease(ctx context.Context, classID int, disease *Disease) error {
	return s.repo.Update(ctx, classID, disease)
}

func (s *service) DeleteDisease(ctx context.Context, classID int) error {
	return s.repo.Delete(ctx, classID)
}
