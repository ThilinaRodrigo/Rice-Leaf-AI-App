package main

import (
	"fmt"
	"log"

	"backend-go/config"
	"backend-go/internal/modules/admin"
	"backend-go/internal/modules/auth"
	"backend-go/internal/modules/chat"
	"backend-go/internal/modules/community"
	"backend-go/internal/modules/disease"
	"backend-go/internal/modules/scan"
	"backend-go/internal/modules/shop"
	"backend-go/internal/shared/database"
	"backend-go/internal/shared/router"
	"backend-go/pkg/mlclient"
	"backend-go/pkg/storage"
)

func main() {
	// 1. Load Configuration
	cfg := config.LoadConfig()

	// 2. Connect to PostgreSQL
	db, err := database.NewPostgresDB(cfg.DatabaseURL)
	if err != nil {
		log.Printf("Warning: Failed connecting to PostgreSQL (%v). Will proceed with server startup.", err)
	} else {
		defer db.Close()

		// Run auto schema migrations & seeding
		if err := database.InitTablesAndSeeds(db); err != nil {
			log.Printf("Warning: Schema initialization error: %v", err)
		}
	}

	// 3. Initialize Repositories per Module
	userRepo := auth.NewRepository(db)
	diseaseRepo := disease.NewRepository(db)
	scanRepo := scan.NewRepository(db)
	productRepo := shop.NewProductRepository(db)
	chatRepo := chat.NewRepository(db)
	adminRepo := admin.NewRepository(db)
	adRepo := shop.NewAdRepository(db)
	postRepo := community.NewRepository(db)

	// 4. Initialize Local Storage & External Clients
	localStorage := storage.NewLocalStorage(cfg.UploadsDir, cfg.BaseURL)
	mlClient := mlclient.NewMLClient(cfg.MLServiceURL)

	// 5. Initialize Services (Business Logic)
	authService := auth.NewService(userRepo, cfg.JWTSecret)
	diseaseService := disease.NewService(diseaseRepo)
	scanService := scan.NewService(scanRepo, diseaseRepo, mlClient, localStorage)
	productService := shop.NewProductService(productRepo)
	chatService := chat.NewService(chatRepo)
	adminService := admin.NewService(adminRepo)
	adService := shop.NewAdService(adRepo)
	postService := community.NewService(postRepo)

	// 6. Initialize Handlers per Module
	authHandler := auth.NewHandler(authService)
	diseaseHandler := disease.NewHandler(diseaseService)
	scanHandler := scan.NewHandler(scanService)
	productHandler := shop.NewProductHandler(productService)
	chatHandler := chat.NewHandler(chatService)
	adminHandler := admin.NewHandler(adminService, authService, productRepo)
	adHandler := shop.NewAdHandler(adService, cfg)
	postHandler := community.NewHandler(postService, cfg)

	// 7. Setup Router & Start Gin Server
	r := router.SetupRouter(router.RouterConfig{
		Cfg:            cfg,
		AuthHandler:    authHandler,
		ScanHandler:    scanHandler,
		DiseaseHandler: diseaseHandler,
		ProductHandler: productHandler,
		ChatHandler:    chatHandler,
		AdminHandler:   adminHandler,
		AdHandler:      adHandler,
		PostHandler:    postHandler,
	})

	serverAddr := fmt.Sprintf(":%s", cfg.Port)
	log.Printf("🚀 Rice Leaf AI Go Backend (Modular Monolith) starting on http://localhost%s", serverAddr)
	if err := r.Run(serverAddr); err != nil {
		log.Fatalf("Server failed to run: %v", err)
	}
}
