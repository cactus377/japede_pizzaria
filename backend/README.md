# Japede Backend API

Backend Node.js/Express para o sistema de gestão de pizzaria Japede.

## 🚀 Funcionalidades

- **Autenticação**: Login e registro de clientes
- **Gestão de Pedidos**: CRUD completo de pedidos com diferentes status
- **Gestão de Mesas**: Controle de status das mesas
- **Cardápio**: Gerenciamento de itens do menu
- **Clientes**: CRUD de clientes com estatísticas
- **Relatórios**: Relatórios de vendas e financeiro
- **Configurações**: Informações da pizzaria

## 📋 Pré-requisitos

- Node.js 18+ 
- npm ou yarn

## 🔧 Instalação

1. Clone o repositório e navegue para a pasta backend:
```bash
cd backend
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

4. Edite o arquivo `.env` com suas configurações:
```env
PORT=3001
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
```

## 🚀 Executando

### Desenvolvimento
```bash
npm run dev
```

### Produção
```bash
npm start
```

O servidor estará rodando em `http://localhost:3001`

## 📚 API Endpoints

### Autenticação
- `POST /api/auth/login` - Login de cliente
- `POST /api/auth/register` - Registro de cliente
- `GET /api/auth/verify` - Verificar token

### Pedidos
- `GET /api/pedidos` - Listar pedidos
- `GET /api/pedidos/:id` - Obter pedido por ID
- `POST /api/pedidos` - Criar novo pedido
- `PATCH /api/pedidos/:id/status` - Atualizar status do pedido
- `GET /api/pedidos/stats/summary` - Estatísticas de pedidos

### Mesas
- `GET /api/mesas` - Listar mesas
- `GET /api/mesas/:id` - Obter mesa por ID
- `PATCH /api/mesas/:id/status` - Atualizar status da mesa
- `GET /api/mesas/stats/summary` - Estatísticas de mesas

### Itens do Cardápio
- `GET /api/itens` - Listar itens
- `GET /api/itens/:id` - Obter item por ID
- `POST /api/itens` - Criar novo item
- `PUT /api/itens/:id` - Atualizar item
- `DELETE /api/itens/:id` - Excluir item
- `GET /api/itens/meta/categorias` - Listar categorias

### Clientes
- `GET /api/clientes` - Listar clientes
- `GET /api/clientes/:id` - Obter cliente por ID
- `POST /api/clientes` - Criar novo cliente
- `PUT /api/clientes/:id` - Atualizar cliente
- `DELETE /api/clientes/:id` - Excluir cliente

### Pizzaria
- `GET /api/pizzeria/info` - Obter informações da pizzaria
- `PUT /api/pizzeria/info` - Atualizar informações da pizzaria

### Relatórios
- `GET /api/reports/sales` - Relatório de vendas
- `GET /api/reports/financial` - Relatório financeiro
- `GET /api/reports/dashboard` - Estatísticas do dashboard

## 🔒 Segurança

- Rate limiting configurado
- CORS habilitado
- Helmet para headers de segurança
- JWT para autenticação
- Validação de dados de entrada

## 📊 Dados Mock

O backend utiliza dados em memória para demonstração. Em produção, você deve integrar com um banco de dados real.

## 🛠️ Tecnologias Utilizadas

- **Express.js** - Framework web
- **JWT** - Autenticação
- **CORS** - Cross-origin requests
- **Helmet** - Segurança
- **Morgan** - Logging
- **Compression** - Compressão de respostas
- **Rate Limiting** - Limitação de requisições

## 📝 Notas de Desenvolvimento

- Todos os dados são armazenados em memória (mock data)
- Para produção, implemente persistência em banco de dados
- Configure variáveis de ambiente adequadas para produção
- Implemente logs mais robustos para produção
- Configure HTTPS em produção

## 🤝 Integração com Frontend

O backend foi projetado para ser totalmente compatível com o frontend React existente, mantendo a mesma estrutura de dados e APIs esperadas.