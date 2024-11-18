#!/bin/bash


export DATABASE_URL="postgresql://postgres:StrongPass1!@stylos-db.czc0uc626uv5.us-east-1.rds.amazonaws.com:5432/stylos-db?schema=public"



echo 'Exibindo variáveis de ambiente carregadas...'
env

until pg_isready -h stylos-db.czc0uc626uv5.us-east-1.rds.amazonaws.com -p 5432; do
    echo 'Aguardando PostgreSQL...'
    sleep 2
done

echo 'Conexão com o banco de dados estabelecida!'
npx prisma generate
npx prisma migrate deploy
npm run start:prod