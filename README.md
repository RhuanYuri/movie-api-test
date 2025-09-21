# Movie API - Teste Backend Jr

## Descrição

API desenvolvida para gerenciar usuários, mídias e favoritos, utilizando NestJS e TypeScript. O objetivo é demonstrar boas práticas de arquitetura, testes automatizados e documentação clara.

## Justificativas Técnicas

### Por que NestJS?

O **NestJS** foi escolhido como framework principal devido à sua **arquitetura opinativa e modular**, que promove organização, escalabilidade e boas práticas de desenvolvimento.

### Benefícios para este projeto

- **Suporte Nativo a TypeScript**: Garante um código mais seguro, legível e fácil de manter, com tipagem estática e detecção antecipada de erros.  
- **Injeção de Dependência**: Facilita a criação de componentes desacoplados, promovendo testes mais fáceis e maior manutenção.  
- **Ecossistema Robusto**: Integrações nativas com ferramentas essenciais, como **TypeORM** para acesso ao banco de dados, sistemas de configuração, módulos de testes, entre outros, agilizando o desenvolvimento.  
- **Arquitetura Modular**: Permite organizar o projeto em módulos independentes, facilitando expansões e manutenção futura.  



## Abordagem do Banco de Dados (PostgreSQL + Docker)

Optou-se por utilizar **PostgreSQL** containerizado com **Docker** para simular um ambiente realista de produção.  

### Motivações

- **Integridade dos Dados**: PostgreSQL oferece suporte nativo a relacionamentos, constraints e integridade referencial, garantindo consistência nos dados.  
- **Facilidade de Setup**: Com **docker-compose**, qualquer desenvolvedor pode levantar o ambiente completo com um único comando, sem necessidade de configurações manuais complexas.  
- **Portabilidade**: O uso de containers garante que o ambiente seja idêntico em qualquer máquina, reduzindo problemas de incompatibilidade.  
- **Escalabilidade**: PostgreSQL containerizado permite fácil integração com clusters e serviços de orquestração, preparando o sistema para crescimento futuro.  


## Configuração do ambiente

1. Clone o repositório:
   ```bash
   git clone https://github.com/RhuanYuri/movie-api-test
   cd movie-api-test
   ```
2. Variáveis de Ambiente:
   ```bash
   cp .env.example .env
   ```

## Executando o projeto

- Com Docker (recomendado):
  ```bash
  docker compose up --build
  ```
  O compose docker já ira configurar o banco de dados e a aplicação sem a necessidade de comando como pnpm `run start` para inciar o projeto

## Rodando os testes

- Testes unitários:
  ```bash
  pnpm run test
  ```

## Documentação dos Endpoints

### Usuários

Pode acessar http://localhost:3000/api para acessar o ambinete do swagger

- **Criar usuário**
  ```bash
  curl -X POST http://localhost:3000/users -H "Content-Type: application/json" -d '{"name":"João","email":"joao@email.com", "password": "123456"}'
  ```
- **Buscar usuário**
  ```bash
  curl http://localhost:3000/users/1
  ```

### Mídias

- **Criar mídia**

  ```bash
  curl -X POST http://localhost:3000/media \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Filme X",
    "type": "movie",
    "releaseYear": 2025,
    "genre": "action"
  }'

  ```

- **Buscar mídia**
  ```bash
  curl http://localhost:3000/media/1
  ```

### Favoritos

- **Adicionar favorito**
  ```bash
  curl -X POST http://localhost:3000/favorite/user-1 -H "Content-Type: application/json" -d '{"mediaId":"1"}'
  ```
- **Listar favoritos do usuário**
  ```bash
  curl http://localhost:3000/favorite/user-1
  ```

---
