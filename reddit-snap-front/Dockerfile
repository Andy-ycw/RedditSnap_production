FROM node:20.15-alpine

WORKDIR /app

COPY package.json ./

RUN npm i

COPY . .

CMD ["npm", "run", "dev"]