package mlclient

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"net/textproto"
	"path/filepath"
	"strings"
	"time"
)

type MLPrediction struct {
	ClassID    int     `json:"class_id"`
	Label      string  `json:"label"`
	Confidence float64 `json:"confidence"`
}

type ValidationResult struct {
	IsRiceLeaf          bool    `json:"is_rice_leaf"`
	RiceLeafProbability float64 `json:"rice_leaf_probability"`
}

type MLClient interface {
	ValidateImage(fileHeader *multipart.FileHeader) (*ValidationResult, error)
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

func (c *mlClient) postImage(endpoint string, fileHeader *multipart.FileHeader) ([]byte, error) {
	file, err := fileHeader.Open()
	if err != nil {
		return nil, fmt.Errorf("unable to open file: %w", err)
	}
	defer file.Close()

	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)

	h := make(textproto.MIMEHeader)
	h.Set("Content-Disposition", fmt.Sprintf(`form-data; name="file"; filename="%s"`, filepath.Base(fileHeader.Filename)))

	contentType := fileHeader.Header.Get("Content-Type")
	if contentType == "" || !strings.HasPrefix(contentType, "image/") {
		contentType = "image/jpeg"
	}
	h.Set("Content-Type", contentType)

	part, err := writer.CreatePart(h)
	if err != nil {
		return nil, fmt.Errorf("unable to create form file: %w", err)
	}

	if _, err = io.Copy(part, file); err != nil {
		return nil, fmt.Errorf("unable to copy image content to form: %w", err)
	}

	if err := writer.Close(); err != nil {
		return nil, fmt.Errorf("unable to close multipart writer: %w", err)
	}

	reqURL := fmt.Sprintf("%s%s", c.baseURL, endpoint)
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

	return respBytes, nil
}

func (c *mlClient) ValidateImage(fileHeader *multipart.FileHeader) (*ValidationResult, error) {
	respBytes, err := c.postImage("/validate", fileHeader)
	if err != nil {
		return nil, fmt.Errorf("rice leaf validation error: %w", err)
	}

	var res ValidationResult
	if err := json.Unmarshal(respBytes, &res); err != nil {
		return nil, fmt.Errorf("failed unmarshaling validation result: %w", err)
	}

	return &res, nil
}

func (c *mlClient) PredictImage(fileHeader *multipart.FileHeader) (*MLPrediction, error) {
	respBytes, err := c.postImage("/predict", fileHeader)
	if err != nil {
		return nil, fmt.Errorf("disease prediction error: %w", err)
	}

	var pred MLPrediction
	if err := json.Unmarshal(respBytes, &pred); err != nil {
		return nil, fmt.Errorf("failed unmarshaling ML prediction: %w", err)
	}

	return &pred, nil
}
