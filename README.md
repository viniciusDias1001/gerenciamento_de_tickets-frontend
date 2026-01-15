# 🎫 Sistema de Gerenciamento de Tickets — Front-end
**Teste Prático – Vaga Desenvolvedor Júnior | BBG Telecom**

---

## 📌 SOBRE O PROJETO

Este projeto corresponde ao **front-end** do sistema de gerenciamento de tickets de suporte, desenvolvido como **teste prático para a vaga de Desenvolvedor Júnior na BBG Telecom**.

Trata-se de uma **aplicação Web SPA (Single Page Application)** construída com **Angular**, responsável por consumir a API REST desenvolvida no backend, seguindo o conceito de **arquitetura desacoplada (front e back separados)**.

O sistema oferece uma interface simples, responsiva e funcional para:

- Autenticação de usuários
- Visualização e gerenciamento de tickets
- Controle de acesso conforme perfil do usuário
- Paginação de dados
- Consumo seguro da API via JWT

---

## 🎯 OBJETIVO DO TESTE

Demonstrar conhecimentos em:

- Desenvolvimento Front-end com Angular
- Consumo de APIs REST
- Autenticação e autorização com JWT
- Organização de código e separação de responsabilidades
- Boas práticas de UX e responsividade
- Integração com backend desacoplado

---

## 🧠 FUNCIONALIDADES IMPLEMENTADAS

- Tela de login com autenticação JWT
- Armazenamento seguro do token
- Listagem paginada de tickets
- Criação, edição e visualização de tickets
- Alteração de status conforme permissões
- Controle de acesso baseado em perfil:
  - CLIENT
  - TECH
  - ADMIN
- Feedback visual de carregamento e erros
- Proteção de rotas (Auth Guard)

---

## 🏗️ ARQUITETURA DO FRONT-END

- Arquitetura modular
- Separação por responsabilidades:
  - Pages
  - Components
  - Services
  - Guards
  - Models
- Standalone Components
- Services responsáveis pelo consumo da API
- Guards para proteção de rotas autenticadas

---

## 📄 ESTRUTURA DE PÁGINAS

A aplicação front-end está organizada por **funcionalidades (features)**, seguindo boas práticas de separação de responsabilidades e escalabilidade.

### 🔐 Autenticação (`auth/pages`)

Responsável pelo fluxo de acesso ao sistema.

- **Login**
  - Tela de autenticação do usuário
  - Envio de credenciais para a API
  - Armazenamento do token JWT
  - Redirecionamento conforme sucesso da autenticação

- **Register**
  - Tela de cadastro de novos usuários
  - Validações de formulário
  - Integração com o endpoint de registro do backend

---

### 🏠 Home (`home/page/home`)

- Página inicial da aplicação após login
- Ponto central de navegação do sistema
- Apresenta acesso rápido às funcionalidades principais
- Estrutura preparada para dashboards e indicadores futuros

---

### 🎫 Tickets (`tickets/pages`)

Conjunto de páginas responsáveis pelo gerenciamento completo dos chamados.

- **Tickets List (`tickets-list`)**
  - Listagem paginada de tickets
  - Filtros por status e prioridade
  - Ações condicionadas ao perfil do usuário

- **Ticket Details (`ticket-details`)**
  - Visualização detalhada de um ticket
  - Exibição de informações principais
  - Controle de ações conforme permissões

- **Tickets Create (`tickets-create`)**
  - Criação de novos tickets
  - Validações de campos obrigatórios
  - Envio dos dados para a API

- **Tickets Manage (`tickets-manage`)**
  - Tela administrativa para gerenciamento de tickets
  - Alteração de status
  - Atribuição de técnicos
  - Restrições aplicadas conforme regras de negócio

- **Ticket History (`ticket-history`)**
  - Exibição do histórico completo do ticket
  - Registro de todas as ações relevantes
  - Integração com o sub-recurso de histórico do backend

---

### 🧱 Camadas de Suporte (`core`)

Camada compartilhada entre todas as páginas da aplicação.

- **Guards**
  - Proteção de rotas autenticadas
  - Controle de acesso por perfil

- **Interceptors**
  - Injeção automática do token JWT nas requisições
  - Tratamento centralizado de erros HTTP

- **Services**
  - Comunicação com a API REST
  - Encapsulamento das regras de consumo do backend

- **Models**
  - Tipagens e contratos de dados
  - Alinhamento entre front-end e back-end

- **Layouts**
  - Estrutura visual comum
  - Header, sidebar e layout base da aplicação

---

Essa organização garante:

- Clareza estrutural
- Facilidade de manutenção
- Escalabilidade
- Separação clara entre páginas, regras e infraestrutura

---

## 🎨 UX & RESPONSIVIDADE

- Interface responsiva
- Layout adaptável para telas menores
- Componentes reutilizáveis
- Feedback visual para:
  - loading
  - erros
  - sucesso de operações

---

## 🛠️ FERRAMENTAS UTILIZADAS

- Visual Studio Code
- Node.js
- NPM
- Git

---

## ⚙️ TECNOLOGIAS UTILIZADAS

- Angular
- TypeScript
- HTML5
- SCSS
- RxJS
- JWT (integração com backend)

---

## 📋 PRÉ-REQUISITOS

- Node.js 18+
- NPM 9+
- Angular CLI

---
## ▶️ COMO RODAR O PROJETO

### 🔹 Rodar localmente

1️⃣ Clone o repositório:
```bash
git clone https://github.com/viniciusDias1001/gerenciamento_de_tickets-frontend.git
```

2️⃣ Acesse a pasta do projeto:

```bash
cd gerenciamento_de_tickets-frontend
```
3️⃣ Instale as dependências:

```bash
npm install
```
4️⃣ Execute a aplicação:
```bash
ng serve -o --proxy-config proxy.conf.json
``` 

📍 Aplicação disponível em:
```bash
http://localhost:4200
``` 

## 🔗 INTEGRAÇÃO COM BACK-END

O front-end consome a API REST desenvolvida no backend.

📍 **URL padrão da API:**
```bash
http://localhost:8080
```

📍 Repositório do Back-end:
```bash
https://github.com/viniciusDias1001/-ticket-management-.git

https://github.com/viniciusDias1001/-ticket-management
```

A autenticação é realizada via **JWT**, enviado no header das requisições:

```http
Authorization: Bearer <token>
```

## 🔐 USUÁRIOS DE TESTE

Os usuários de teste são os mesmos definidos no backend (via Flyway).

| Perfil | Email | Senha |
|------|------|------|
| ADMIN | admin@local.com | Admin@123 |
| REVIEWER | reviewer@bbgtelecom.com | Reviewer@123 |

---

## 📬 CONTATO

- LinkedIn: https://www.linkedin.com/in/pedro-vinicius-8472351b7/
- Email: pedrorochadias1001@gmail.com

---

### ✅ OBSERVAÇÃO FINAL

Este front-end foi desenvolvido como parte do **teste prático para a vaga de Desenvolvedor Júnior na BBG Telecom**, com foco em:

- Clareza
- Organização
- Boas práticas
- Integração eficiente com API REST
- Experiência do usuário