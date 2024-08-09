proxima aula 380

### Docker

## iniciar docker

docker-compose up -d

## construir e iniciar

docker-compose up --build -d

# parar o docker

docker-compose down

# construir o docker apos a mudanca

docker-compose build

# construir sem cache

docker-compose build --no-cache

## listar portas 5432

sudo lsof -i :5432

## matar processo

sudo kill -9 176

## parar servico postgress local

brew services stop postgresql

## iniciar agente ssh

walterbrunopradovieira in stylos-back-ecommerce/src on  main ❯ eval "$(ssh-agent -s)"

Agent pid 27820
walterbrunopradovieira in stylos-back-ecommerce/src on  main ❯ ssh-add ~/.ssh/id_ed25519

Enter passphrase for /Users/walterbrunopradovieira/.ssh/id_ed25519:
Identity added: /Users/walterbrunopradovieira/.ssh/id_ed25519 (wbrunovieira77@gmail.com)
walterbrunopradovieira in stylos-back-ecommerce/src on  main took 3s ❯

## Migrations

# criar migration

docker-compose exec app npx typeorm migration:create src/migration/CreateUser

# rodar migration

docker-compose exec app npm run typeorm migration:run

# entrar no container

docker-compose exec app /bin/sh

## Logs

docker-compose logs app
docker-compose logs db

docker-compose logs -f app

## Prisma

# prisma studio

docker-compose exec app npx prisma studio

# prisma migrate

docker-compose exec app npx prisma migrate dev

## apagar, construir e iniciar tudo de uma vez

docker-compose down && docker-compose build --no-cache && docker-compose up -d

docker system prune --volumes



ngrok start --config=ngrok.yml --all


docker compose exec app npx prisma migrate reset
docker compose exec app npx prisma migrate dev --name init  
docker compose exec app npx prisma migrate deploy
docker compose exec app npx prisma generate

docker compose exec app npm run test -- src/domain/catalog/application/use-cases/create-brand.spec.ts

docker compose exec app npm run test:e2e -- src/controllers/create-colors.controller.e2e-spec.ts
docker compose exec app npm run test:e2e -- src/controllers/create-brand.controller.e2e-spec.ts


docker compose exec app npx ts-node prisma/seed.ts

psql $DATABASE_URL -f /app/scripts/triggers.sql
psql -U postgres -h db -d stylos_db_prisma -c 'SET search_path TO public;' && psql -U postgres -h db -d stylos_db_prisma -f /app/scripts/triggers.sql

ssh -vvv -R wbstylosbackend.serveo.net:80:localhost:3333 serveo.net
ssh -v -R wbstylosfrontend.serveo.net:80:localhost:3000 serveo.net
