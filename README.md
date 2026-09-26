# Ecommerce Backend

Backend REST de um ecommerce desenvolvido com Spring Boot, Spring Data JPA,
Spring Security e banco H2 para desenvolvimento.

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

O banco H2 em memoria e criado automaticamente durante a execucao. As
configuracoes de banco e ambiente devem ser fornecidas por propriedades do
Spring ou variaveis de ambiente antes de usar um banco persistente.

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
