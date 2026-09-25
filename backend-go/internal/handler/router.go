package handler

import (
	"backend-go/config"
	"backend-go/internal/middleware"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

type RouterConfig struct {
	Cfg            *config.Config
	AuthHandler    *AuthHandler
	ScanHandler    *ScanHandler
	DiseaseHandler *DiseaseHandler
	ProductHandler *ProductHandler
	ChatHandler    *ChatHandler
	AdminHandler   *AdminHandler
	AdHandler      *AdHandler
}

func SetupRouter(rc RouterConfig) *gin.Engine {
	if rc.Cfg.GinMode == "release" {
		gin.SetMode(gin.ReleaseMode)
	}

	r := gin.Default()

	// CORS Setup
	corsConfig := cors.DefaultConfig()
	corsConfig.AllowAllOrigins = true
	corsConfig.AllowHeaders = []string{"Origin", "Content-Length", "Content-Type", "Authorization"}
	corsConfig.AllowMethods = []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"}
	r.Use(cors.New(corsConfig))

	// Static File Server for uploaded scan & ad images
	r.Static("/uploads", rc.Cfg.UploadsDir)

	// API Root
	v1 := r.Group("/api/v1")
	{
		// Auth Routes
		auth := v1.Group("/auth")
		{
			auth.POST("/register", rc.AuthHandler.Register)
			auth.POST("/login", rc.AuthHandler.Login)
			auth.GET("/me", middleware.AuthMiddleware(rc.Cfg.JWTSecret), rc.AuthHandler.GetProfile)
			auth.PUT("/change-password", middleware.AuthMiddleware(rc.Cfg.JWTSecret), rc.AuthHandler.ChangePassword)
		}

		// Scans & Diagnosis Routes
		scans := v1.Group("/scans")
		{
			scans.POST("/analyze", middleware.OptionalAuthMiddleware(rc.Cfg.JWTSecret), rc.ScanHandler.AnalyzeImage)
			scans.GET("/history", middleware.AuthMiddleware(rc.Cfg.JWTSecret), rc.ScanHandler.GetHistory)
			scans.GET("/:id", rc.ScanHandler.GetScanByID)
		}

		// Disease Remedies Knowledge Base
		diseases := v1.Group("/diseases")
		{
			diseases.GET("", rc.DiseaseHandler.GetAllDiseases)
			diseases.GET("/:class_id", rc.DiseaseHandler.GetDiseaseByClassID)
		}

		// Marketplace Products & Ads
		products := v1.Group("/products")
		{
			products.GET("", rc.ProductHandler.GetProducts)
			products.GET("/:id", rc.ProductHandler.GetProductByID)
		}

		if rc.AdHandler != nil {
			v1.GET("/marketplace/ads", rc.AdHandler.GetApprovedMarketplaceAds)

			shop := v1.Group("/shop/ads")
			shop.Use(middleware.AuthMiddleware(rc.Cfg.JWTSecret))
			{
				shop.POST("/upload", rc.AdHandler.UploadAdImage)
				shop.POST("", rc.AdHandler.CreateAd)
				shop.GET("/my-ads", rc.AdHandler.GetMyAds)
				shop.DELETE("/:id", rc.AdHandler.DeleteAd)
			}
		}

		// AI Chat Assistant
		chat := v1.Group("/chat")
		{
			chat.POST("/message", middleware.OptionalAuthMiddleware(rc.Cfg.JWTSecret), rc.ChatHandler.SendMessage)
			chat.GET("/history", middleware.AuthMiddleware(rc.Cfg.JWTSecret), rc.ChatHandler.GetHistory)
		}

		// Sys Admin Routes
		if rc.AdminHandler != nil {
			admin := v1.Group("/admin")
			admin.Use(middleware.AuthMiddleware(rc.Cfg.JWTSecret))
			admin.Use(middleware.RequireSysAdmin())
			{
				admin.GET("/stats", rc.AdminHandler.GetStats)
				admin.GET("/users", rc.AdminHandler.GetAllUsers)
				admin.POST("/users/admin", rc.AdminHandler.CreateSysAdmin)
				admin.DELETE("/users/:id", rc.AdminHandler.DeleteUser)
				admin.GET("/scans", rc.AdminHandler.GetAllScans)
				admin.POST("/products", rc.AdminHandler.CreateProduct)
				admin.PUT("/products/:id", rc.AdminHandler.UpdateProduct)
				admin.DELETE("/products/:id", rc.AdminHandler.DeleteProduct)
				admin.POST("/diseases", rc.DiseaseHandler.CreateDisease)
				admin.PUT("/diseases/:class_id", rc.DiseaseHandler.UpdateDisease)
				admin.DELETE("/diseases/:class_id", rc.DiseaseHandler.DeleteDisease)

				if rc.AdHandler != nil {
					admin.GET("/ads", rc.AdHandler.GetAdminAds)
					admin.PUT("/ads/:id/status", rc.AdHandler.UpdateAdStatus)
				}
			}
		}
	}

	return r
}
