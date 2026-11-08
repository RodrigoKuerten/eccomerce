# Ecommerce Backend

Backend REST de um ecommerce desenvolvido com Spring Boot, Spring Data JPA,
Spring Security e banco MySQL para desenvolvimento.

## Documentação

A documentação completa do projeto está no vault Obsidian
[`docs/Project Documentation/`](docs/Project%20Documentation/) — abra essa
pasta no Obsidian. As regras de manutenção estão em
[`DOCUMENTATION-RULES.md`](docs/Project%20Documentation/DOCUMENTATION-RULES.md).

## Requisitos

- Java 25
- Maven Wrapper incluso no projeto

## Executar

No Windows:

```powershell
.\mvnw.cmd spring-boot:run
```

Executar os testes:

```powershell
.\mvnw.cmd clean test
```

O banco MySQL e as credenciais devem ser configurados no `.env` da raiz
(`DB_NAME`, `DB_USERNAME`, `DB_PASSWORD`) ou por propriedades do Spring. O
schema e criado/atualizado automaticamente por `ddl-auto=update`.

## Endpoints principais

### Autenticacao

```text
POST /api/auth/register
POST /api/auth/login
```

### Produtos

```text
POST   /api/product/create
PUT    /api/product/edit
DELETE /api/product/delete
PATCH  /api/product/add-quantity
PATCH  /api/product/remove-quantity
```

### Pedidos

```text
POST   /api/order/create
GET    /api/order/user/{userId}
PATCH  /api/order/status
DELETE /api/order/delete/{id}
```

## Estrutura

```text
src/main/java/com/ecommerce/rodrigo/
|-- auth       # Registro e login
|-- config     # Seguranca e tratamento de erros
|-- order      # Pedidos e estoque
|-- product    # Produtos
|-- user       # Entidade e repositorio de usuarios
`-- utils      # Utilitarios
```

## Observacoes

- O projeto ainda precisa de autenticacao baseada em sessao ou token para uso
  em producao.
- Nao publique credenciais reais ou configuracoes sensiveis no repositorio.
