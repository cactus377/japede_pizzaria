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
REPO_URL="https://github.com/cactus377/japede_pizzaria.git"  # <- altere
APP_DIR="/opt/$PROJECT_NAME"
NODE_VERSION="20"
POSTGRES_DB="supabase"
POSTGRES_USER="postgres"  # altere se necessário
POSTGRES_PASSWORD="japede"

log() { printf "\n\033[1;32m➡ %s\033[0m\n" "$*"; }

########## 1. Dependências gerais ##########
log "Atualizando pacotes APT e instalando dependências…"
sudo apt-get update -y
sudo apt-get install -y curl git build-essential postgresql postgresql-contrib

########## 1.b Banco de Dados ##########
log "Configurando Postgres (usuário, banco e extensões)…"
# Garante que o serviço esteja iniciado
sudo systemctl enable --now postgresql
# Cria usuário e banco se ainda não existirem
sudo -u postgres psql -tc "SELECT 1 FROM pg_roles WHERE rolname='${POSTGRES_USER}'" | grep -q 1 || \
  sudo -u postgres psql -c "CREATE USER ${POSTGRES_USER} WITH PASSWORD '${POSTGRES_PASSWORD}';"

sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname='${POSTGRES_DB}'" | grep -q 1 || \
  sudo -u postgres psql -c "CREATE DATABASE ${POSTGRES_DB} OWNER ${POSTGRES_USER};"

########## 1.c Arquivo .env ##########
log "Gerando arquivo .env do backend…"
# garante que o diretório existe (caso o clone ainda não tenha ocorrido)
mkdir -p "$APP_DIR/backend"
cat > "$APP_DIR/backend/.env" <<EOF
DB_DIALECT=postgres
DB_HOST=127.0.0.1
DB_PORT=5432
DB_NAME=${POSTGRES_DB}
DB_USER=${POSTGRES_USER}
DB_PASSWORD=${POSTGRES_PASSWORD}
NODE_ENV=production
EOF

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
elif [[ -d "$APP_DIR" ]]; then
  log "Diretório $APP_DIR já existe mas não contém um repositório Git válido; removendo…"
  sudo rm -rf "$APP_DIR"
  log "Clonando repositório em $APP_DIR…"
  sudo git clone "$REPO_URL" "$APP_DIR"
  sudo chown -R "$(whoami)":"$(whoami)" "$APP_DIR"
else
  log "Clonando repositório em $APP_DIR…"
  sudo git clone "$REPO_URL" "$APP_DIR"
  sudo chown -R "$(whoami)":"$(whoami)" "$APP_DIR"
fi
cd "$APP_DIR"

########## 4. Backend ##########
log "Instalando dependências do backend…"
cd "$APP_DIR/backend"

# Atualiza config.json com a senha gerada para TODOS os ambientes
log "Atualizando configurações do banco de dados…"
# Usa aspas duplas para a string JSON e escapa as aspas internas
sed -i 's/"password": null/"password": "'"${POSTGRES_PASSWORD}"'/g' "$APP_DIR/backend/config/config.json"

# Verifica se o usuário e banco foram criados corretamente
log "Verificando acesso ao banco de dados…"
if ! PGPASSWORD="$POSTGRES_PASSWORD" psql -h 127.0.0.1 -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "SELECT 1" >/dev/null 2>&1; then
  log "Erro: Falha ao conectar ao banco de dados com as credenciais fornecidas"
  log "Usuário: $POSTGRES_USER"
  log "Banco: $POSTGRES_DB"
  log "Senha: ${POSTGRES_PASSWORD:0:2}...${POSTGRES_PASSWORD: -2}"  # Mostra apenas início e fim da senha
  exit 1
fi

# Instala dependências e executa migrações/seeds
log "Instalando dependências do backend…"
pnpm install

log "Executando migrações do banco de dados…"
NODE_ENV=production npx sequelize-cli db:migrate

log "Executando seeds do banco de dados…"
NODE_ENV=production npx sequelize-cli db:seed:all

# Inicia o backend em produção
log "Iniciando o backend em modo produção…"
pnpm run build
NODE_ENV=production pm2 start dist/index.js --name "$PROJECT_NAME-backend"

# Frontend
log "Instalando dependências do frontend…"
cd "$APP_DIR/frontend"
pnpm install
pnpm run build

# Inicia o frontend em produção
log "Configurando PM2 para o frontend na porta 3001…"
cd "$APP_DIR"
npm install -g serve
pm2 start serve --name "$PROJECT_NAME-frontend" -- -s build -l 3001

# Salva a lista de processos do PM2
pm2 save

log "✅  Deploy concluído! Acesse http://localhost:3001"
