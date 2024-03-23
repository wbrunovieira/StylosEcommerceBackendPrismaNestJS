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

## Logs

docker-compose logs app
docker-compose logs db

## Prisma

# prisma studio

docker-compose exec app npx prisma studio

# prisma migrate

docker-compose exec app npx prisma migrate dev
