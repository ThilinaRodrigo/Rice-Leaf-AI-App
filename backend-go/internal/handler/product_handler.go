package handler

import (
	"net/http"

	"backend-go/internal/usecase"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type ProductHandler struct {
	productUC usecase.ProductUseCase
}

func NewProductHandler(productUC usecase.ProductUseCase) *ProductHandler {
	return &ProductHandler{productUC: productUC}
}

func (h *ProductHandler) GetProducts(c *gin.Context) {
	category := c.Query("category")
	search := c.Query("search")

	products, err := h.productUC.GetProducts(c.Request.Context(), category, search)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, products)
}

func (h *ProductHandler) GetProductByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid product id"})
		return
	}

	product, err := h.productUC.GetProductByID(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, product)
}
