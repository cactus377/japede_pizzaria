{{ ... }}
NODE_VERSION="20"
+BACKEND_PORT=4001  # porta interna para evitar conflito com EasyPanel
 POSTGRES_DB="pizzaria_db"
{{ ... }}
 cd backend
-pnpm install --prod
+pnpm install --prod
+export PORT=$BACKEND_PORT
 cd ..
{{ ... }}
-pm2 start backend/server.js --name japede-backend --update-env --cwd "$APP_DIR"
+pm2 start backend/server.js --name japede-backend --update-env --cwd "$APP_DIR" --env production
{{ ... }}
-if curl -sf http://localhost:3001/health >/dev/null; then
+if curl -sf http://localhost:$BACKEND_PORT/health >/dev/null; then
{{ ... }}
+########## 9. Nginx ##########
+log "Configurando Nginx…"
+NGINX_CONF="/etc/nginx/sites-available/$PROJECT_NAME.conf"
+sudo tee "$NGINX_CONF" >/dev/null <<EOF
+server {
+    listen 80;
+    server_name _;
+
+    root $APP_DIR/frontend/dist;
+    index index.html;
+
+    location /api/ {
+        proxy_pass http://127.0.0.1:$BACKEND_PORT/;
+        proxy_set_header Host $host;
+        proxy_set_header X-Real-IP $remote_addr;
+        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
+        proxy_set_header X-Forwarded-Proto $scheme;
+    }
+
+    # Single Page App fallback
+    location / {
+        try_files $uri $uri/ /index.html;
+    }
+}
+EOF
+sudo ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/
+sudo nginx -t && sudo systemctl reload nginx
+log "Nginx configurado para servir frontend e proxy para /api/"
{{ ... }}
