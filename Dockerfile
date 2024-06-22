FROM node:20-buster

RUN apt-get update && apt-get install -y  netcat \
postgresql-client

WORKDIR /app

RUN mkdir -p /app/data

COPY package*.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./
COPY vitest.config*.ts ./

RUN npm install 

COPY . .

RUN npx prisma generate

RUN npm run build

EXPOSE 3333


