FROM python:3.12-slim

# System dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies (cache layer)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code (without venv and __pycache__)
COPY . .

# Create SQLite db directory (volume mount point)
RUN mkdir -p /app/db

# Configure settings.py so that it writes the db into /app/db
# (this is handled in .env: DB_PATH=/app/db/db.sqlite3)

EXPOSE 8000