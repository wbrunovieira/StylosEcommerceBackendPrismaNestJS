FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci 

COPY . .

RUN npm run build

EXPOSE 3333

CMD ["npm", "run", "start:dev"]
