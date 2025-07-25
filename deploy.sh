#!/usr/bin/env bash
set -euo pipefail

#############################################
# Japede Pizzaria – Script de Deploy        #
#############################################
# Requisitos da VPS: Ubuntu ≥ 22.04, acesso sudo
# Como usar:
# 1. Ajuste REPO_URL e variáveis .env se necessário
# 2. Copie este arquivo para a VPS:  scp deploy.sh user@vps:/tmp
# 3. Conecte-se e execute:  sudo bash /tmp/deploy.sh
# 4. O script cuidará de tudo (Node, pnpm, PM2, clone/pull, build, seed DB)

PROJECT_NAME="japede-pizzaria"
REPO_URL="https://github.com/SEU_USER/$PROJECT_NAME.git"  # <- altere
APP_DIR="/opt/$PROJECT_NAME"
NODE_VERSION="20"
POSTGRES_DB="pizzaria_db"
POSTGRES_USER="postgres"  # altere se necessário

log() { printf "\n\033[1;32m➡ %s\033[0m\n" "$*"; }

########## 1. Dependências gerais ##########
log "Atualizando pacotes APT e instalando dependências…"
sudo apt-get update -y
sudo apt-get install -y curl git build-essential postgresql postgresql-contrib

########## 2. Node LTS, pnpm, PM2 ##########
if ! command -v node >/dev/null || [[ "$(node -v)" != v$NODE_VERSION* ]]; then
  log "Instalando Node.js $NODE_VERSION…"
  curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi

command -v pnpm >/dev/null || { log "Instalando pnpm…"; npm i -g pnpm; }
command -v pm2  >/dev/null || { log "Instalando PM2…";  npm i -g pm2;  }

########## 3. Clonar ou atualizar repositório ##########
if [[ -d "$APP_DIR/.git" ]]; then
  log "Repositório encontrado, executando git pull…"
  git -C "$APP_DIR" pull --ff-only
else
  log "Clonando repositório em $APP_DIR…"
  sudo git clone "$REPO_URL" "$APP_DIR"
  sudo chown -R "$(whoami)":"$(whoami)" "$APP_DIR"
fi
cd "$APP_DIR"

########## 4. Backend ##########
log "Instalando dependências do backend…"
cd backend
pnpm install --prod
cd ..

########## 5. Frontend ##########
log "Instalando dependências e build do frontend…"
cd frontend
pnpm install
pnpm run build
cd ..

########## 6. Banco de Dados ##########
log "Criando banco ($POSTGRES_DB) e populando dados iniciais…"
sudo -u postgres psql <<SQL
CREATE DATABASE $POSTGRES_DB OWNER $POSTGRES_USER;\n\c $POSTGRES_DB
CREATE TABLE IF NOT EXISTS mesas (
  id SERIAL PRIMARY KEY,
  numero INT UNIQUE NOT NULL,
  capacidade INT NOT NULL
);
INSERT INTO mesas (numero, capacidade)
  VALUES (1,4),(2,4),(3,6)
  ON CONFLICT DO NOTHING;
SQL

########## 7. Backend via PM2 ##########
log "Subindo backend com PM2…"
pm2 start backend/server.js --name japede-backend --update-env --cwd "$APP_DIR"
pm2 save

########## 8. Health-check ##########
log "Aguardando backend iniciar…"
sleep 5
if curl -sf http://localhost:3001/health >/dev/null; then
  log "✅ Deploy concluído com sucesso!";
else
  echo "❌ Backend não respondeu ao health-check." && exit 1;
fi