package client

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"path/filepath"
	"time"
)

type MLPrediction struct {
	ClassID    int     `json:"class_id"`
	Label      string  `json:"label"`
	Confidence float64 `json:"confidence"`
}

type MLClient interface {
	PredictImage(fileHeader *multipart.FileHeader) (*MLPrediction, error)
}

type mlClient struct {
	baseURL    string
	httpClient *http.Client
}

func NewMLClient(baseURL string) MLClient {
	return &mlClient{
		baseURL: baseURL,
		httpClient: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

func (c *mlClient) PredictImage(fileHeader *multipart.FileHeader) (*MLPrediction, error) {
	file, err := fileHeader.Open()
	if err != nil {
		return nil, fmt.Errorf("unable to open file for ML prediction: %w", err)
	}
	defer file.Close()

	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)

	part, err := writer.CreateFormFile("file", filepath.Base(fileHeader.Filename))
	if err != nil {
		return nil, fmt.Errorf("unable to create form file: %w", err)
	}

	if _, err = io.Copy(part, file); err != nil {
		return nil, fmt.Errorf("unable to copy image content to form: %w", err)
	}

	if err := writer.Close(); err != nil {
		return nil, fmt.Errorf("unable to close multipart writer: %w", err)
	}

	reqURL := fmt.Sprintf("%s/predict", c.baseURL)
	req, err := http.NewRequest("POST", reqURL, body)
	if err != nil {
		return nil, fmt.Errorf("unable to create HTTP request to ML service: %w", err)
	}

	req.Header.Set("Content-Type", writer.FormDataContentType())

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed sending request to ML service (%s): %w", reqURL, err)
	}
	defer resp.Body.Close()

	respBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed reading ML response: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("ML service returned status %d: %s", resp.StatusCode, string(respBytes))
	}

	var pred MLPrediction
	if err := json.Unmarshal(respBytes, &pred); err != nil {
		return nil, fmt.Errorf("failed unmarshaling ML prediction: %w", err)
	}

	return &pred, nil
}
