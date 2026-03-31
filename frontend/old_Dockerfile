# ---- 1. stage: React build ----
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# A Vite VITE_ prefix-es env változókat build időben égeti bele
# Ezért az API URL-t build argként adjuk át
ARG VITE_API_URL
ARG VITE_WS_URL
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_WS_URL=$VITE_WS_URL

RUN npm run build

# ---- 2. stage: nginx statikus fájlszerver ----
FROM nginx:alpine

# Töröljük a default nginx config-ot
RUN rm /etc/nginx/conf.d/default.conf

# React build kimásolása
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
