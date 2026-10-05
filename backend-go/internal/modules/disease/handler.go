package disease

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	diseaseService Service
}

func NewHandler(diseaseService Service) *Handler {
	return &Handler{diseaseService: diseaseService}
}

func applyDiseaseTranslation(d *Disease, lang string) Disease {
	if lang == "" || lang == "en" || len(d.Translations) == 0 {
		return *d
	}

	var translations map[string]DiseaseTranslation
	if err := json.Unmarshal(d.Translations, &translations); err == nil {
		if tr, ok := translations[lang]; ok {
			translated := *d
			if tr.Name != "" {
				translated.Name = tr.Name
			}
			if tr.Category != "" {
				translated.Category = tr.Category
			}
			if tr.Description != "" {
				translated.Description = tr.Description
			}
			if len(tr.Factors) > 0 && string(tr.Factors) != "null" {
				translated.Factors = tr.Factors
			}
			if len(tr.Actions) > 0 && string(tr.Actions) != "null" {
				translated.Actions = tr.Actions
			}
			return translated
		}
	}
	return *d
}

func (h *Handler) GetAllDiseases(c *gin.Context) {
	diseases, err := h.diseaseService.GetAllDiseases(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	lang := c.Query("lang")
	if lang != "" {
		var localized []Disease
		for _, d := range diseases {
			localized = append(localized, applyDiseaseTranslation(&d, lang))
		}
		c.JSON(http.StatusOK, localized)
		return
	}

	c.JSON(http.StatusOK, diseases)
}

func (h *Handler) GetDiseaseByClassID(c *gin.Context) {
	classIDStr := c.Param("class_id")
	classID, err := strconv.Atoi(classIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid class_id"})
		return
	}

	disease, err := h.diseaseService.GetDiseaseByClassID(c.Request.Context(), classID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	lang := c.Query("lang")
	if lang != "" {
		localized := applyDiseaseTranslation(disease, lang)
		c.JSON(http.StatusOK, localized)
		return
	}

	c.JSON(http.StatusOK, disease)
}

func (h *Handler) CreateDisease(c *gin.Context) {
	var disease Disease
	if err := c.ShouldBindJSON(&disease); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.diseaseService.CreateDisease(c.Request.Context(), &disease); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, disease)
}

func (h *Handler) UpdateDisease(c *gin.Context) {
	classIDStr := c.Param("class_id")
	classID, err := strconv.Atoi(classIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid class_id"})
		return
	}

	var disease Disease
	if err := c.ShouldBindJSON(&disease); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.diseaseService.UpdateDisease(c.Request.Context(), classID, &disease); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, disease)
}

func (h *Handler) DeleteDisease(c *gin.Context) {
	classIDStr := c.Param("class_id")
	classID, err := strconv.Atoi(classIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid class_id"})
		return
	}

	if err := h.diseaseService.DeleteDisease(c.Request.Context(), classID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Disease deleted successfully"})
}
