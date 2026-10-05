package scan

import (
	"context"
	"fmt"
	"mime/multipart"

	"backend-go/internal/modules/disease"
	"backend-go/pkg/mlclient"
	"backend-go/pkg/storage"

	"github.com/google/uuid"
)

type Service interface {
	AnalyzeImage(ctx context.Context, userID *uuid.UUID, fileHeader *multipart.FileHeader) (*ScanResultResponse, error)
	GetUserScanHistory(ctx context.Context, userID uuid.UUID) ([]Scan, error)
	GetScanByID(ctx context.Context, scanID uuid.UUID) (*ScanResultResponse, error)
}

type service struct {
	scanRepo     Repository
	diseaseRepo  disease.Repository
	mlClient     mlclient.MLClient
	localStorage *storage.LocalStorage
}

func NewService(
	scanRepo Repository,
	diseaseRepo disease.Repository,
	mlClient mlclient.MLClient,
	localStorage *storage.LocalStorage,
) Service {
	return &service{
		scanRepo:     scanRepo,
		diseaseRepo:  diseaseRepo,
		mlClient:     mlClient,
		localStorage: localStorage,
	}
}

func (s *service) AnalyzeImage(ctx context.Context, userID *uuid.UUID, fileHeader *multipart.FileHeader) (*ScanResultResponse, error) {
	_, publicURL, err := s.localStorage.SaveScanImage(fileHeader)
	if err != nil {
		return nil, fmt.Errorf("failed saving upload image: %w", err)
	}

	pred, err := s.mlClient.PredictImage(fileHeader)
	if err != nil {
		return nil, fmt.Errorf("failed calling ML prediction: %w", err)
	}

	dis, err := s.diseaseRepo.GetByClassID(ctx, pred.ClassID)
	if err != nil {
		dis = nil
	}

	scanRecord := &Scan{
		UserID:     userID,
		ImageURL:   publicURL,
		ClassID:    pred.ClassID,
		Label:      pred.Label,
		Confidence: pred.Confidence,
	}

	if err := s.scanRepo.SaveScan(ctx, scanRecord); err != nil {
		return nil, fmt.Errorf("failed saving scan record: %w", err)
	}

	return &ScanResultResponse{
		Scan:    *scanRecord,
		Disease: dis,
	}, nil
}

func (s *service) GetUserScanHistory(ctx context.Context, userID uuid.UUID) ([]Scan, error) {
	return s.scanRepo.GetHistoryByUserID(ctx, userID)
}

func (s *service) GetScanByID(ctx context.Context, scanID uuid.UUID) (*ScanResultResponse, error) {
	scanRecord, err := s.scanRepo.GetScanByID(ctx, scanID)
	if err != nil {
		return nil, err
	}

	dis, _ := s.diseaseRepo.GetByClassID(ctx, scanRecord.ClassID)

	return &ScanResultResponse{
		Scan:    *scanRecord,
		Disease: dis,
	}, nil
}
