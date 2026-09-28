FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY . .

# Render sets $PORT itself; server.js already reads it (defaults to 3000).
EXPOSE 3000

CMD ["node", "server.js"]
