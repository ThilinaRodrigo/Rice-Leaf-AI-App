package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Port         string
	GinMode      string
	DatabaseURL  string
	JWTSecret    string
	MLServiceURL string
	UploadsDir   string
	BaseURL      string
}

func LoadConfig() *Config {
	_ = godotenv.Load()

	cfg := &Config{
		Port:         getEnv("PORT", "8080"),
		GinMode:      getEnv("GIN_MODE", "debug"),
		DatabaseURL:  getEnv("DATABASE_URL", "postgres://postgres:postgres@localhost:5432/riceleafdb?sslmode=disable"),
		JWTSecret:    getEnv("JWT_SECRET", "super-secret-rice-leaf-key-2026"),
		MLServiceURL: getEnv("ML_SERVICE_URL", "http://localhost:8001"),
		UploadsDir:   getEnv("UPLOADS_DIR", "./uploads"),
		BaseURL:      getEnv("BASE_URL", "http://localhost:8080"),
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
