# Multi-stage Dockerfile untuk build Go binary yang ringan dan cepat
FROM golang:1.24-alpine AS builder

WORKDIR /app

# Download dependencies
COPY go.mod go.sum ./
RUN go mod download

# Copy source code dan build binary statis
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o server .

# Production runner image (ringan ~15MB)
FROM alpine:3.19

WORKDIR /app
RUN apk --no-cache add ca-certificates tzdata

COPY --from=builder /app/server .

# Expose port (default 8080)
EXPOSE 8080

CMD ["./server"]
