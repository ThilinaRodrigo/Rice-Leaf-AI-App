package chat

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

const defaultSystemInstruction = `You are "RiceDoc AI", an expert agricultural advisor and Rice Agronomist integrated into the Rice Leaf AI mobile app.

YOUR PURPOSE:
Assist paddy farmers, agricultural officers, and researchers in diagnosing and managing rice crop diseases, pest infestations, and crop nutrition.

YOUR KNOWLEDGE SCOPE:
1. Rice Diseases: Bacterial Leaf Blight, Brown Spot, Leaf Blast, Tungro Virus, Sheath Blight, Leaf Smut, Narrow Brown Spot, Grain Discoloration.
2. Treatments: Recommended fungicides, bactericides (e.g., Copper Hydroxide, Mancozeb, Hexaconazole, Propiconazole), organic alternatives (Neem oil, Burnt paddy husk ash), and biological control agents (Bacillus subtilis).
3. Agronomy Practices: Department of Agriculture (DOA) fertilizer guidelines, Leaf Color Chart (LCC) urea management, water management (alternate wetting & drying), field hygiene, and disease prevention.

RESPONSE GUIDELINES:
- Keep answers concise, empathetic, clear, and easy to read on mobile app screens.
- Use clean Markdown styling: bullet points (•), bold text (**product names/chemical names**), and numbered step-by-step instructions.
- If a user asks non-agricultural questions (e.g. programming, entertainment, general topics), politely state that you are a specialized Rice Agronomist and redirect them back to paddy farming and crop care.
- Always include safety warnings when recommending chemical pesticide sprays (e.g., wearing protective masks/gloves, spraying early morning/late afternoon, avoiding spraying prior to rain).`

type GeminiClient interface {
	GenerateAgronomyResponse(ctx context.Context, history []ChatMessage, userPrompt string) (string, error)
}

type geminiClient struct {
	apiKey     string
	modelName  string
	httpClient *http.Client
}

func NewGeminiClient(apiKey, modelName string) GeminiClient {
	if modelName == "" {
		modelName = "gemini-1.5-flash"
	}
	return &geminiClient{
		apiKey:    apiKey,
		modelName: modelName,
		httpClient: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

type geminiPart struct {
	Text string `json:"text"`
}

type geminiContent struct {
	Role  string       `json:"role"`
	Parts []geminiPart `json:"parts"`
}

type geminiSystemInstruction struct {
	Parts []geminiPart `json:"parts"`
}

type geminiGenerationConfig struct {
	Temperature     float64 `json:"temperature"`
	MaxOutputTokens int     `json:"maxOutputTokens"`
}

type geminiRequestPayload struct {
	SystemInstruction *geminiSystemInstruction `json:"system_instruction,omitempty"`
	Contents          []geminiContent          `json:"contents"`
	GenerationConfig  *geminiGenerationConfig `json:"generationConfig,omitempty"`
}

type geminiResponsePayload struct {
	Candidates []struct {
		Content struct {
			Parts []struct {
				Text string `json:"text"`
			} `json:"parts"`
			Role string `json:"role"`
		} `json:"content"`
		FinishReason string `json:"finishReason"`
	} `json:"candidates"`
	Error *struct {
		Code    int    `json:"code"`
		Message string `json:"message"`
		Status  string `json:"status"`
	} `json:"error,omitempty"`
}

func (g *geminiClient) GenerateAgronomyResponse(ctx context.Context, history []ChatMessage, userPrompt string) (string, error) {
	if g.apiKey == "" {
		return "", fmt.Errorf("gemini api key is not configured")
	}

	contents := make([]geminiContent, 0, len(history)+1)

	// Format past history into Gemini role format (user / model)
	for _, msg := range history {
		role := "user"
		if msg.Sender == "bot" {
			role = "model"
		}
		if msg.Message != "" {
			contents = append(contents, geminiContent{
				Role: role,
				Parts: []geminiPart{
					{Text: msg.Message},
				},
			})
		}
	}

	// Append current user prompt
	contents = append(contents, geminiContent{
		Role: "user",
		Parts: []geminiPart{
			{Text: userPrompt},
		},
	})

	payload := geminiRequestPayload{
		SystemInstruction: &geminiSystemInstruction{
			Parts: []geminiPart{
				{Text: defaultSystemInstruction},
			},
		},
		Contents: contents,
		GenerationConfig: &geminiGenerationConfig{
			Temperature:     0.7,
			MaxOutputTokens: 1200,
		},
	}

	bodyBytes, err := json.Marshal(payload)
	if err != nil {
		return "", fmt.Errorf("failed to encode gemini request: %w", err)
	}

	url := fmt.Sprintf("https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s", g.modelName, g.apiKey)

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewBuffer(bodyBytes))
	if err != nil {
		return "", fmt.Errorf("failed creating gemini request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := g.httpClient.Do(req)
	if err != nil {
		return "", fmt.Errorf("gemini http request failed: %w", err)
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("failed to read gemini response: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("gemini api error (HTTP %d): %s", resp.StatusCode, string(respBody))
	}

	var res geminiResponsePayload
	if err := json.Unmarshal(respBody, &res); err != nil {
		return "", fmt.Errorf("failed decoding gemini json response: %w", err)
	}

	if res.Error != nil {
		return "", fmt.Errorf("gemini error: %s", res.Error.Message)
	}

	if len(res.Candidates) > 0 && len(res.Candidates[0].Content.Parts) > 0 {
		return res.Candidates[0].Content.Parts[0].Text, nil
	}

	return "", fmt.Errorf("empty response from gemini model")
}
