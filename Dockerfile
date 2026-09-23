# =========================================================================
# SynapseSQL Enterprise Multi-Stage Cloud Production Dockerfile
# Stage 1: Build React Frontend Assets
# Stage 2: Lightweight Python 3.11 FastAPI Production Web Server
# =========================================================================

# --- Stage 1: Build Frontend ---
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

# Install dependencies
COPY frontend/package*.json ./
RUN npm install

# Copy source and build static distribution
COPY frontend/ ./
RUN npm run build

# --- Stage 2: Production Python Runner ---
FROM python:3.11-slim AS production-runner

WORKDIR /app

# Install minimal OS dependencies for healthchecks & native packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python requirements
COPY backend/requirements.txt /app/backend/requirements.txt
RUN pip install --no-cache-dir -r /app/backend/requirements.txt

# Copy Backend Source Code
COPY backend/ /app/backend/

# Copy compiled frontend from Stage 1 directly into expected location
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

# Ensure backend folder is on the Python module path
ENV PYTHONPATH=/app/backend \
    PYTHONUNBUFFERED=1

WORKDIR /app/backend

# Expose production port (Render default)
EXPOSE 10000

# Docker Healthcheck Probe — follows $PORT so it tracks the real listener
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:${PORT:-10000}/health || exit 1

# Launch production server via Uvicorn, bound to Render's $PORT
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-10000}"]
