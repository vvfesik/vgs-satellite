FROM node:13.8.0-buster-slim

ARG satellite_port

ADD . /src
WORKDIR /src

RUN npm run clean && npm run build

CMD ["npx", "static-server", "--port", "$satellite_port", "--open", "dist"]

