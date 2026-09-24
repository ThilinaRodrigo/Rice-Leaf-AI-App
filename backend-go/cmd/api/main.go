package main

import (
	"fmt"
	"log"

	"backend-go/config"
	"backend-go/internal/client"
	"backend-go/internal/handler"
	"backend-go/internal/repository"
	"backend-go/internal/usecase"
	"backend-go/pkg/storage"
)

func main() {
	// 1. Load Configuration
	cfg := config.LoadConfig()

	// 2. Connect to PostgreSQL
	db, err := repository.NewPostgresDB(cfg.DatabaseURL)
	if err != nil {
		log.Printf("Warning: Failed connecting to PostgreSQL (%v). Will proceed with server startup.", err)
	} else {
		defer db.Close()

		// Run auto schema migrations & seeding
		if err := repository.InitTablesAndSeeds(db); err != nil {
			log.Printf("Warning: Schema initialization error: %v", err)
		}
	}

	// 3. Initialize Repositories
	userRepo := repository.NewUserRepository(db)
	diseaseRepo := repository.NewDiseaseRepository(db)
	scanRepo := repository.NewScanRepository(db)
	productRepo := repository.NewProductRepository(db)
	chatRepo := repository.NewChatRepository(db)
	adminRepo := repository.NewAdminRepository(db)

	// 4. Initialize Local Storage & External Clients
	localStorage := storage.NewLocalStorage(cfg.UploadsDir, cfg.BaseURL)
	mlClient := client.NewMLClient(cfg.MLServiceURL)

	// 5. Initialize UseCases
	authUC := usecase.NewAuthUseCase(userRepo, cfg.JWTSecret)
	diseaseUC := usecase.NewDiseaseUseCase(diseaseRepo)
	scanUC := usecase.NewScanUseCase(scanRepo, diseaseRepo, mlClient, localStorage)
	productUC := usecase.NewProductUseCase(productRepo)
	chatUC := usecase.NewChatUseCase(chatRepo)
	adminUC := usecase.NewAdminUseCase(adminRepo)

	// 6. Initialize Handlers
	authHandler := handler.NewAuthHandler(authUC)
	diseaseHandler := handler.NewDiseaseHandler(diseaseUC)
	scanHandler := handler.NewScanHandler(scanUC)
	productHandler := handler.NewProductHandler(productUC)
	chatHandler := handler.NewChatHandler(chatUC)
	adminHandler := handler.NewAdminHandler(adminUC, authUC, productRepo)

	// 7. Setup Router & Start Gin Server
	r := handler.SetupRouter(handler.RouterConfig{
		Cfg:            cfg,
		AuthHandler:    authHandler,
		ScanHandler:    scanHandler,
		DiseaseHandler: diseaseHandler,
		ProductHandler: productHandler,
		ChatHandler:    chatHandler,
		AdminHandler:   adminHandler,
	})

	serverAddr := fmt.Sprintf(":%s", cfg.Port)
	log.Printf("🚀 Rice Leaf AI Go Backend (Gin) starting on http://localhost%s", serverAddr)
	if err := r.Run(serverAddr); err != nil {
		log.Fatalf("Server failed to run: %v", err)
	}
}
