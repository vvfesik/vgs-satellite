FROM node:10-slim

RUN npm i npm@latest -g

RUN mkdir /src && chown node:node /src
WORKDIR /src

USER node
COPY package.json package-lock.json* ./
RUN npm ci && npm cache clean --force
COPY . .

RUN npm run build

#override with custom `--port` in docker-compose
CMD ["npx", "static-server", "--open", "dist"]