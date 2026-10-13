package admin

import (
	"encoding/base64"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"backend-go/config"
	"backend-go/internal/modules/auth"
	"backend-go/internal/modules/shop"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type Handler struct {
	adminService Service
	authService  auth.Service
	productRepo  shop.ProductRepository
	cfg          *config.Config
}

func NewHandler(adminService Service, authService auth.Service, productRepo shop.ProductRepository, cfg *config.Config) *Handler {
	return &Handler{
		adminService: adminService,
		authService:  authService,
		productRepo:  productRepo,
		cfg:          cfg,
	}
}

func (h *Handler) GetStats(c *gin.Context) {
	stats, err := h.adminService.GetStats(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, stats)
}

func (h *Handler) GetAllUsers(c *gin.Context) {
	users, err := h.adminService.GetAllUsers(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, users)
}

func (h *Handler) CreateSysAdmin(c *gin.Context) {
	var req auth.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	req.Role = auth.RoleSysAdmin
	resp, err := h.authService.Register(c.Request.Context(), req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, resp)
}

func (h *Handler) DeleteUser(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user id"})
		return
	}

	if err := h.adminService.DeleteUser(c.Request.Context(), id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "user deleted successfully"})
}

func (h *Handler) GetAllScans(c *gin.Context) {
	scans, err := h.adminService.GetAllScans(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if scans == nil {
		scans = []AdminScan{}
	}
	c.JSON(http.StatusOK, scans)
}

func (h *Handler) CreateProduct(c *gin.Context) {
	var p shop.Product
	if err := c.ShouldBindJSON(&p); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if p.Name == "" || p.Category == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "name and category are required"})
		return
	}

	if err := h.productRepo.CreateProduct(c.Request.Context(), &p); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, p)
}

func (h *Handler) UpdateProduct(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid product id"})
		return
	}

	var p shop.Product
	if err := c.ShouldBindJSON(&p); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	p.ID = id

	if err := h.productRepo.UpdateProduct(c.Request.Context(), &p); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, p)
}

func (h *Handler) DeleteProduct(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid product id"})
		return
	}

	if err := h.productRepo.DeleteProduct(c.Request.Context(), id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "product deleted successfully"})
}

func (h *Handler) UploadProductImage(c *gin.Context) {
	productsDir := filepath.Join(h.cfg.UploadsDir, "products")
	if err := os.MkdirAll(productsDir, 0755); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed creating upload directory"})
		return
	}

	file, err := c.FormFile("image")
	if err != nil {
		file, err = c.FormFile("file")
	}

	if err == nil {
		ext := strings.ToLower(filepath.Ext(file.Filename))
		if ext == "" || (ext != ".jpg" && ext != ".jpeg" && ext != ".png" && ext != ".webp") {
			ext = ".jpg"
		}
		newFilename := fmt.Sprintf("prod_%d_%s%s", time.Now().UnixNano(), uuid.New().String()[:8], ext)
		dst := filepath.Join(productsDir, newFilename)

		if err := c.SaveUploadedFile(file, dst); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed saving image file"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"image_url": fmt.Sprintf("/uploads/products/%s", newFilename),
			"filename":  newFilename,
			"full_url":  fmt.Sprintf("%s/uploads/products/%s", h.cfg.BaseURL, newFilename),
		})
		return
	}

	var jsonReq struct {
		ImageBase64 string `json:"image_base64"`
		Filename    string `json:"filename"`
	}
	if err := c.ShouldBindJSON(&jsonReq); err == nil && jsonReq.ImageBase64 != "" {
		b64Data := jsonReq.ImageBase64
		if idx := strings.Index(b64Data, ","); idx != -1 {
			b64Data = b64Data[idx+1:]
		}
		data, decodeErr := base64.StdEncoding.DecodeString(b64Data)
		if decodeErr != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid base64 image data"})
			return
		}

		ext := ".jpg"
		if jsonReq.Filename != "" {
			if e := strings.ToLower(filepath.Ext(jsonReq.Filename)); e != "" {
				ext = e
			}
		}
		newFilename := fmt.Sprintf("prod_%d_%s%s", time.Now().UnixNano(), uuid.New().String()[:8], ext)
		dst := filepath.Join(productsDir, newFilename)

		if err := os.WriteFile(dst, data, 0644); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed saving base64 image file"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"image_url": fmt.Sprintf("/uploads/products/%s", newFilename),
			"filename":  newFilename,
			"full_url":  fmt.Sprintf("%s/uploads/products/%s", h.cfg.BaseURL, newFilename),
		})
		return
	}

	c.JSON(http.StatusBadRequest, gin.H{"error": "image file or image_base64 is required"})
}
