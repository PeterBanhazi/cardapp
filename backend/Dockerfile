FROM python:3.12-slim

# Rendszer függőségek
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Python függőségek telepítése (cache layer)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Forráskód másolása (venv és __pycache__ nélkül)
COPY . .

# SQLite db könyvtár létrehozása (volume mount pont)
RUN mkdir -p /app/db

# settings.py-t beállítjuk, hogy a db-t a /app/db mappába írja
# (ezt az .env-ben kezeljük: DB_PATH=/app/db/db.sqlite3)

EXPOSE 8000
