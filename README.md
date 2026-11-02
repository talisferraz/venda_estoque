# Sistema de Controle de Estoque e Vendas API

Uma API REST completa para gerenciamento de estoque e vendas de nível comercial desenvolvida em **Node.js (ES Modules)** e **MySQL**. O sistema conta com regras rígidas de integridade de dados através de transações SQL puras, controle de estoque contra saldos negativos e autenticação e autorização robustas via **JWT**.

## Funcionalidades do Projeto

### Autenticação & Permissões (JWT)
*   **Cadastro e Login:** Criptografia de senhas com `bcrypt` e geração de tokens assinados com `jsonwebtoken`.
*   **Controle de Níveis de Acesso (RBAC):** Diferenciação de rotas entre os papéis `ADMIN` e `VENDEDOR`.

### Módulo de Produtos
*   **CRUD Completo:** Cadastro, leitura, atualização e exclusão de produtos.
*   **Atributos Profissionais:** Gerenciamento por código SKU único, preço de custo, preço de venda e limite de quantidade mínima para alertas.

### Módulo de Estoque
*   **Movimentações Manuais:** Registro detalhado de Entradas e Saídas com justificativa e motivos.
*   **Trava de Segurança:** Mecanismo que impede que o estoque de qualquer produto fique negativo.
*   **Histórico de Auditoria:** Extrato completo de todas as movimentações ocorridas no sistema.

### Módulo de Vendas (Checkout)
*   **Carrinho Multi-itens:** Venda de múltiplos produtos em uma única requisição.
*   **Garantia de Integridade (Transactions):** Uso de transações SQL com travas de linha (`FOR UPDATE`). Se um único item do carrinho falhar por falta de estoque, toda a operação sofre `ROLLBACK`.
*   **Estorno Automático:** Possibilidade de cancelamento de vendas com devolução automática das mercadorias ao estoque e registro de histórico.

### Módulo de Relatórios (Dashboard Analítico)
*   **Painel Financeiro:** Faturamento segmentado (diário, semanal e mensal) e estimativa de lucro bruto.
*   **Gestão de Patrimônio:** Valor total investido no estoque calculado com base no preço de custo.
*   **Alertas Críticos:** Relatório automático de produtos com estoque igual ou abaixo do mínimo configurado.

---

## Tecnologias Utilizadas

*   **Node.js** (v22+) com ES Modules (`import`/`export`)
*   **Express** (Framework Web)
*   **MySQL** (Banco de Dados Relacional)
*   **mysql2/promise** (Driver de conexão nativo com suporte a Async/Await)
*   **JSON Web Tokens (JWT)** (Segurança e Autenticação)
*   **Bcrypt** (Criptografia de senhas)
*   **Dotenv** (Gerenciamento de variáveis de ambiente)

---

## Como Executar o Projeto Localmente

### 1. Clonar o repositório
```bash
git clone https://github.com
cd venda_estoque
```

### 2. Instalar as dependências
```bash
npm install
```

### 3. Configurar o Banco de Dados
1. Certifique-se de ter o MySQL rodando na sua máquina.
2. Crie o banco de dados utilizando a estrutura contida na modelagem inicial do projeto.

### 4. Configurar as Variáveis de Ambiente
Copie o arquivo de exemplo e preencha com as suas credenciais locais do MySQL e chave JWT:
```bash
cp .env.example .env
```
*Abra o arquivo `.env` criado e insira seu usuário, senha do banco e uma chave secreta para o JWT.*

### 5. Iniciar o servidor
Para rodar em modo de desenvolvimento com reinicialização automática (`nodemon`):
```bash
npm run dev
```
O servidor iniciará por padrão na porta `http://localhost:3000`.
