FROM node:latest

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

COPY .env ./

EXPOSE 5555

CMD ["node", "src/index.js"]