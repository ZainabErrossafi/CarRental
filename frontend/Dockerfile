FROM node:22-alpine
WORKDIR /app

RUN apk add --no-cache nginx

COPY package*.json ./
RUN npm ci

COPY . .
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build \
    && mkdir -p /usr/share/nginx/html \
    && cp -a dist/. /usr/share/nginx/html/ \
    && rm -rf /app/* /app/.[!.]* /app/..?*

RUN printf '%s\n' \
    'server {' \
    '    listen 80;' \
    '    server_name _;' \
    '    root /usr/share/nginx/html;' \
    '    index index.html;' \
    '    location / {' \
    '        try_files $uri $uri/ /index.html;' \
    '    }' \
    '    location /assets/ {' \
    '        expires 1y;' \
    '        add_header Cache-Control "public, immutable";' \
    '    }' \
    '    error_page 404 /index.html;' \
    '}' > /etc/nginx/http.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
