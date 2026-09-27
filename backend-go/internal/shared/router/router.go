package router

import (
	"backend-go/config"
	"backend-go/internal/modules/admin"
	"backend-go/internal/modules/auth"
	"backend-go/internal/modules/chat"
	"backend-go/internal/modules/community"
	"backend-go/internal/modules/disease"
	"backend-go/internal/modules/scan"
	"backend-go/internal/modules/shop"
	"backend-go/internal/shared/middleware"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

type RouterConfig struct {
	Cfg            *config.Config
	AuthHandler    *auth.Handler
	ScanHandler    *scan.Handler
	DiseaseHandler *disease.Handler
	ProductHandler *shop.ProductHandler
	ChatHandler    *chat.Handler
	AdminHandler   *admin.Handler
	AdHandler      *shop.AdHandler
	PostHandler    *community.Handler
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

	// API Root v1
	v1 := r.Group("/api/v1")
	{
		// Auth Routes
		authGroup := v1.Group("/auth")
		{
			authGroup.POST("/register", rc.AuthHandler.Register)
			authGroup.POST("/login", rc.AuthHandler.Login)
			authGroup.GET("/me", middleware.AuthMiddleware(rc.Cfg.JWTSecret), rc.AuthHandler.GetProfile)
			authGroup.PUT("/change-password", middleware.AuthMiddleware(rc.Cfg.JWTSecret), rc.AuthHandler.ChangePassword)
		}

		// Scans & Diagnosis Routes
		scansGroup := v1.Group("/scans")
		{
			scansGroup.POST("/analyze", middleware.OptionalAuthMiddleware(rc.Cfg.JWTSecret), rc.ScanHandler.AnalyzeImage)
			scansGroup.GET("/history", middleware.AuthMiddleware(rc.Cfg.JWTSecret), rc.ScanHandler.GetHistory)
			scansGroup.GET("/:id", rc.ScanHandler.GetScanByID)
		}

		// Disease Remedies Knowledge Base
		diseasesGroup := v1.Group("/diseases")
		{
			diseasesGroup.GET("", rc.DiseaseHandler.GetAllDiseases)
			diseasesGroup.GET("/:class_id", rc.DiseaseHandler.GetDiseaseByClassID)
		}

		// Marketplace Products & Ads
		productsGroup := v1.Group("/products")
		{
			productsGroup.GET("", rc.ProductHandler.GetProducts)
			productsGroup.GET("/:id", rc.ProductHandler.GetProductByID)
		}

		if rc.AdHandler != nil {
			v1.GET("/marketplace/ads", rc.AdHandler.GetApprovedMarketplaceAds)

			shopGroup := v1.Group("/shop/ads")
			shopGroup.Use(middleware.AuthMiddleware(rc.Cfg.JWTSecret))
			{
				shopGroup.POST("/upload", rc.AdHandler.UploadAdImage)
				shopGroup.POST("", rc.AdHandler.CreateAd)
				shopGroup.GET("/my-ads", rc.AdHandler.GetMyAds)
				shopGroup.PUT("/:id", rc.AdHandler.UpdateAd)
				shopGroup.DELETE("/:id", rc.AdHandler.DeleteAd)
			}
		}

		// AI Chat Assistant
		chatGroup := v1.Group("/chat")
		{
			chatGroup.POST("/message", middleware.OptionalAuthMiddleware(rc.Cfg.JWTSecret), rc.ChatHandler.SendMessage)
			chatGroup.GET("/history", middleware.AuthMiddleware(rc.Cfg.JWTSecret), rc.ChatHandler.GetHistory)
		}

		// Community Posts & Knowledge Base
		if rc.PostHandler != nil {
			v1.GET("/posts/suggested", rc.PostHandler.GetSuggestedPosts)
			v1.GET("/posts", middleware.OptionalAuthMiddleware(rc.Cfg.JWTSecret), rc.PostHandler.GetPosts)
			v1.GET("/posts/:id", middleware.OptionalAuthMiddleware(rc.Cfg.JWTSecret), rc.PostHandler.GetPostByID)
			v1.GET("/posts/:id/comments", rc.PostHandler.GetComments)

			postsGroup := v1.Group("/posts")
			postsGroup.Use(middleware.AuthMiddleware(rc.Cfg.JWTSecret))
			{
				postsGroup.POST("/upload", rc.PostHandler.UploadPostImage)
				postsGroup.POST("", rc.PostHandler.CreatePost)
				postsGroup.POST("/:id/vote", rc.PostHandler.VotePost)
				postsGroup.POST("/:id/comments", rc.PostHandler.AddComment)
				postsGroup.DELETE("/:id", rc.PostHandler.DeletePost)
				postsGroup.DELETE("/comments/:comment_id", rc.PostHandler.DeleteComment)
			}
		}

		// Sys Admin Routes
		if rc.AdminHandler != nil {
			adminGroup := v1.Group("/admin")
			adminGroup.Use(middleware.AuthMiddleware(rc.Cfg.JWTSecret))
			adminGroup.Use(middleware.RequireSysAdmin())
			{
				adminGroup.GET("/stats", rc.AdminHandler.GetStats)
				adminGroup.GET("/users", rc.AdminHandler.GetAllUsers)
				adminGroup.POST("/users/admin", rc.AdminHandler.CreateSysAdmin)
				adminGroup.DELETE("/users/:id", rc.AdminHandler.DeleteUser)
				adminGroup.GET("/scans", rc.AdminHandler.GetAllScans)
				adminGroup.POST("/products", rc.AdminHandler.CreateProduct)
				adminGroup.PUT("/products/:id", rc.AdminHandler.UpdateProduct)
				adminGroup.DELETE("/products/:id", rc.AdminHandler.DeleteProduct)
				adminGroup.POST("/diseases", rc.DiseaseHandler.CreateDisease)
				adminGroup.PUT("/diseases/:class_id", rc.DiseaseHandler.UpdateDisease)
				adminGroup.DELETE("/diseases/:class_id", rc.DiseaseHandler.DeleteDisease)

				if rc.AdHandler != nil {
					adminGroup.GET("/ads", rc.AdHandler.GetAdminAds)
					adminGroup.PUT("/ads/:id/status", rc.AdHandler.UpdateAdStatus)
				}
			}
		}
	}

	return r
}
