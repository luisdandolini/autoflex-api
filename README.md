# Autoflex API

Sistema de controle de estoque de matérias-primas para produção industrial. A API permite gerenciar produtos, matérias-primas, suas associações e calcular sugestões de produção baseadas no estoque disponível.

## 📋 Requisitos Funcionais

- **RF001** ✅ - CRUD completo de produtos
- **RF002** ✅ - CRUD completo de matérias-primas
- **RF003** ✅ - Associação de matérias-primas aos produtos
- **RF004** ✅ - Cálculo de produção possível com estoque disponível

## 🚀 Tecnologias

- **Node.js** v22+
- **TypeScript** v5.9
- **Express** v5.2
- **PostgreSQL** v16
- **Docker** & Docker Compose
- **Yarn** v4 (Berry) com PnP

## 🏗️ Arquitetura

O projeto segue uma arquitetura em camadas com separação de responsabilidades:

```
src/
├── app/
│   ├── controllers/      # Camada HTTP (recebe requests, retorna responses)
│   ├── services/         # Camada de lógica de negócio
│   ├── repositories/     # Camada de acesso a dados
│   └── middlewares/      # Interceptadores (error handling)
├── database/             # Configuração e schema do banco
├── errors/               # Erros customizados
├── routes/               # Definição de rotas
└── utils/                # Funções auxiliares
```

### Padrão de design:

- **Repository Pattern**: Abstração do acesso a dados
- **Service Layer**: Lógica complexa de negócio isolada
- **Error Handling Middleware**: Tratamento centralizado de erros
- **Async Handler**: Wrapper para captura automática de erros em rotas assíncronas

## 📦 Instalação

### Pré-requisitos:

- Node.js v22 ou superior
- Yarn v4
- Docker e Docker Compose

### Passo a passo:

```bash
# 1. Clonar o repositório
git clone <https://github.com/luisdandolini/autoflex-api.git>
cd autoflex-api

# 2. Instalar dependências
yarn install

# 3. Configurar variáveis de ambiente
cp .env.example .env

# 4. Subir banco de dados (PostgreSQL via Docker)
yarn docker:up

# 5. Aguardar alguns segundos para o banco inicializar
# O schema será executado automaticamente na primeira vez

# 6. Rodar a aplicação em modo desenvolvimento
yarn dev
```

A API estará disponível em: `http://localhost:3000`

## 🗄️ Banco de Dados

### Schema:

O banco possui 3 tabelas principais:

**`product`** - Produtos fabricados

- `id` (UUID, PK)
- `code` (VARCHAR, UNIQUE)
- `name` (VARCHAR)
- `value` (DECIMAL)
- `created_at`, `updated_at` (TIMESTAMP)

**`raw_material`** - Matérias-primas

- `id` (UUID, PK)
- `code` (VARCHAR, UNIQUE)
- `name` (VARCHAR)
- `quantity_stock` (DECIMAL)
- `created_at`, `updated_at` (TIMESTAMP)

**`product_raw_material`** - Relacionamento N:N

- `id` (UUID, PK)
- `product_id` (UUID, FK → product)
- `raw_material_id` (UUID, FK → raw_material)
- `quantity_needed` (DECIMAL)
- `created_at` (TIMESTAMP)

### Índices:

- `idx_product_code` - Otimiza buscas por código de produto
- `idx_raw_material_code` - Otimiza buscas por código de matéria-prima
- `idx_product_raw_material_product` - Otimiza joins por produto
- `idx_product_raw_material_raw` - Otimiza joins por matéria-prima

## 🔗 Endpoints

### Products (RF001)

```http
GET    /products              # Listar produtos (opcional: ?orderBy=DESC)
POST   /products              # Criar produto
PUT    /products/:id          # Atualizar produto
DELETE /products/:id          # Deletar produto
```

**Exemplo - Criar produto:**

```bash
curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -d '{
    "code": "P001",
    "name": "Cadeira Gamer",
    "value": 1500
  }'
```

### Raw Materials (RF002)

```http
GET    /raw-materials         # Listar matérias-primas (opcional: ?orderBy=DESC)
POST   /raw-materials         # Criar matéria-prima
PUT    /raw-materials/:id     # Atualizar matéria-prima
DELETE /raw-materials/:id     # Deletar matéria-prima
```

**Exemplo - Criar matéria-prima:**

```bash
curl -X POST http://localhost:3000/raw-materials \
  -H "Content-Type: application/json" \
  -d '{
    "code": "R001",
    "name": "Ferro",
    "quantity_stock": 100
  }'
```

### Product ↔ Raw Material Association (RF003)

```http
GET    /products/:product_id/raw-materials        # Listar associações
POST   /products/:product_id/raw-materials        # Criar associação
```

**Exemplo - Associar matéria-prima ao produto:**

```bash
curl -X POST http://localhost:3000/products/{product_id}/raw-materials \
  -H "Content-Type: application/json" \
  -d '{
    "raw_material_id": "{raw_material_id}",
    "quantity_needed": 5
  }'
```

### Production Suggestions (RF004)

```http
GET    /production/suggestions    # Calcular produção possível
```

**Exemplo:**

```bash
curl http://localhost:3000/production/suggestions
```

**Resposta:**

```json
{
  "suggestions": [
    {
      "product_id": "uuid",
      "product_code": "P001",
      "product_name": "Cadeira Gamer",
      "quantity_possible": 2,
      "unit_value": 1500,
      "total_value": 3000
    }
  ],
  "total_production_value": 3000,
  "products_analyzed": 3
}
```

## 🧮 Algoritmo RF004

O cálculo de produção funciona da seguinte forma:

1. **Buscar produtos** ordenados por valor (maior primeiro)
2. **Criar estoque virtual** (cópia do estoque real)
3. **Para cada produto:**
   - Buscar receita (matérias-primas necessárias)
   - Calcular quantidade possível: `MIN(estoque_disponível / quantidade_necessária)`
   - "Consumir" estoque virtual (simular produção)
   - Adicionar à lista de sugestões
4. **Retornar** sugestões ordenadas por prioridade + valor total

### Exemplo prático:

**Estoque:**

- Ferro: 100kg
- Papel: 50 folhas

**Produtos:**

- Cadeira (R$1500): precisa 5kg Ferro + 10 Papel
- Mesa (R$800): precisa 8kg Ferro

**Cálculo:**

- Cadeira: MIN(100/5, 50/10) = MIN(20, 5) = **5 unidades** ✅
- Consome: 25kg Ferro + 50 Papel
- Estoque restante: 75kg Ferro, 0 Papel
- Mesa: MIN(75/8) = **9 unidades** ✅
- **Total: R$14.700** (5 Cadeiras + 9 Mesas)

## 🐳 Comandos Docker

```bash
# Subir banco de dados
yarn docker:up

# Ver logs do PostgreSQL
yarn docker:logs

# Parar banco de dados
yarn docker:down

# Resetar banco (APAGA TODOS OS DADOS)
yarn docker:reset
```

## 🛠️ Scripts

```bash
yarn dev          # Rodar em desenvolvimento (hot reload)
yarn build        # Compilar TypeScript para produção
yarn start        # Rodar versão compilada
```

## ⚙️ Variáveis de Ambiente

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=autoflex

# Server
PORT=3000
NODE_ENV=development
```

## 🎯 Decisões Técnicas

### Por que TypeScript?

- Type safety reduz bugs em produção
- Melhor autocomplete e DX
- Facilita refatoração

### Por que Docker?

- Ambiente consistente entre dev/prod
- Setup rápido para avaliadores
- Isolamento do PostgreSQL

### Por que Error Handler Middleware?

- Tratamento centralizado de erros
- Respostas consistentes
- Elimina try/catch repetitivo nos controllers

## 🧪 Testando a API

### 1. Criar dados de teste:

```bash
# Produtos
curl -X POST http://localhost:3000/products -H "Content-Type: application/json" \
  -d '{"code":"P001","name":"Cadeira Gamer","value":1500}'

curl -X POST http://localhost:3000/products -H "Content-Type: application/json" \
  -d '{"code":"P002","name":"Mesa","value":800}'

# Matérias-primas
curl -X POST http://localhost:3000/raw-materials -H "Content-Type: application/json" \
  -d '{"code":"R001","name":"Ferro","quantity_stock":100}'

curl -X POST http://localhost:3000/raw-materials -H "Content-Type: application/json" \
  -d '{"code":"R002","name":"Papel","quantity_stock":50}'
```

### 2. Pegar IDs retornados e criar associações

### 3. Testar cálculo de produção:

```bash
curl http://localhost:3000/production/suggestions
```

## 📁 Estrutura de Pastas

```
autoflex-api/
├── .vscode/                  # Configurações VS Code (Yarn PnP)
├── src/
│   ├── app/
│   │   ├── controllers/      # ProductController, RawMaterialController, etc.
│   │   ├── services/         # ProductionService (lógica RF004)
│   │   ├── repositories/     # Acesso a dados
│   │   └── middlewares/      # errorHandler
│   ├── database/
│   │   ├── index.ts          # Conexão PostgreSQL (Pool)
│   │   └── schema.sql        # DDL do banco
│   ├── errors/
│   │   └── AppError.ts       # Erro customizado
│   ├── routes/
│   │   └── index.ts          # Definição de rotas
│   └── utils/
│       └── asyncHandler.ts   # Wrapper para rotas async
├── .env.example              # Template de variáveis de ambiente
├── docker-compose.yml        # Configuração PostgreSQL
├── package.json              # Dependências e scripts
├── tsconfig.json             # Configuração TypeScript
└── README.md                 # Este arquivo
```

## 🐛 Troubleshooting

### Erro: "relation does not exist"

- O schema não foi executado
- Solução: `yarn docker:reset`

### Erro: "port 5432 already in use"

- PostgreSQL já está rodando localmente
- Solução: Parar o PostgreSQL local ou mudar a porta no `docker-compose.yml`
