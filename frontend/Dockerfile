# no build - a dist/ directory is already made 
FROM nginx:alpine

RUN rm /etc/nginx/conf.d/default.conf

# ony copy to nginx
COPY dist/ /usr/share/nginx/html/

EXPOSE 80