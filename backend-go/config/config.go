package config

import (
	"log"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type Config struct {
	Port                   string
	GinMode                string
	DatabaseURL            string
	JWTSecret              string
	MLServiceURL           string
	RiceValidatorThreshold string
	MaxImageSizeMB         int64
	UploadsDir             string
	BaseURL                string
	GeminiAPIKey           string
	GeminiModel            string
}

func LoadConfig() *Config {
	_ = godotenv.Load()

	maxSizeMB, _ := strconv.ParseInt(getEnv("MAX_IMAGE_SIZE_MB", "10"), 10, 64)
	if maxSizeMB <= 0 {
		maxSizeMB = 10
	}

	cfg := &Config{
		Port:                   getEnv("PORT", "8080"),
		GinMode:                getEnv("GIN_MODE", "debug"),
		DatabaseURL:            getEnv("DATABASE_URL", "postgres://postgres:root@localhost:5432/riceleafdb?sslmode=disable"),
		JWTSecret:              getEnv("JWT_SECRET", "super-secret-rice-leaf-key-2026"),
		MLServiceURL:           getEnv("ML_SERVICE_URL", "http://localhost:8001"),
		RiceValidatorThreshold: getEnv("RICE_VALIDATOR_THRESHOLD", "0.50"),
		MaxImageSizeMB:         maxSizeMB,
		UploadsDir:             getEnv("UPLOADS_DIR", "./uploads"),
		BaseURL:                getEnv("BASE_URL", "http://localhost:8080"),
		GeminiAPIKey:           getEnv("GEMINI_API_KEY", ""),
		GeminiModel:            getEnv("GEMINI_MODEL", "gemini-1.5-flash"),
	}

	if cfg.Port == "" {
		log.Fatal("PORT environment variable is required")
	}

	return cfg
}

func getEnv(key, fallback string) string {
	if val, ok := os.LookupEnv(key); ok && val != "" {
		return val
	}
	return fallback
}
