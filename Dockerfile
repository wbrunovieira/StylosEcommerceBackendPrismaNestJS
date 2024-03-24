FROM node:20-buster

RUN apt-get update && apt-get install -y netcat

WORKDIR /app

COPY package*.json ./

RUN npm install 

COPY . .

RUN npx prisma generate

RUN npm run build

EXPOSE 3333


