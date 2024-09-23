FROM node:20.15-alpine

WORKDIR /app

COPY . .
RUN npm i

CMD ["npm", "run", "dev"]
# For production build
# RUN npm run build
# CMD ["npm", "run", "start"]