package storage

import (
	"fmt"
	"io"
	"mime/multipart"
	"os"
	"path/filepath"
	"time"

	"github.com/google/uuid"
)

type LocalStorage struct {
	BaseDir string
	BaseURL string
}

func NewLocalStorage(baseDir, baseURL string) *LocalStorage {
	_ = os.MkdirAll(filepath.Join(baseDir, "scans"), os.ModePerm)
	return &LocalStorage{
		BaseDir: baseDir,
		BaseURL: baseURL,
	}
}

func (s *LocalStorage) SaveScanImage(file *multipart.FileHeader) (string, string, error) {
	src, err := file.Open()
	if err != nil {
		return "", "", fmt.Errorf("failed to open uploaded file: %w", err)
	}
	defer src.Close()

	ext := filepath.Ext(file.Filename)
	if ext == "" {
		ext = ".jpg"
	}

	fileName := fmt.Sprintf("%d_%s%s", time.Now().UnixNano(), uuid.New().String()[:8], ext)
	relPath := filepath.Join("scans", fileName)
	fullPath := filepath.Join(s.BaseDir, relPath)

	dst, err := os.Create(fullPath)
	if err != nil {
		return "", "", fmt.Errorf("failed to create target file: %w", err)
	}
	defer dst.Close()

	if _, err = io.Copy(dst, src); err != nil {
		return "", "", fmt.Errorf("failed to write file content: %w", err)
	}

	// URL format: http://localhost:8080/uploads/scans/filename.jpg
	publicURL := fmt.Sprintf("%s/uploads/scans/%s", s.BaseURL, fileName)
	return fullPath, publicURL, nil
}
