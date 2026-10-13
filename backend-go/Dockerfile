# Multi-stage build for Go Backend Service
FROM golang:1.24-alpine AS builder

WORKDIR /app

# Install git for dependency resolution if needed
RUN apk add --no-cache git

# Cache Go dependencies
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Build static Linux binary
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o /app/server ./cmd/api/main.go

# Minimal production runtime image
FROM alpine:3.19

WORKDIR /app

# Install CA certificates for external HTTPS requests
RUN apk --no-cache add ca-certificates tzdata

COPY --from=builder /app/server .
COPY --from=builder /app/config ./config

EXPOSE 8080

CMD ["./server"]
