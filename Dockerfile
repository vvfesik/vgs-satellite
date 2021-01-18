FROM python:3.8-slim

ENV NODE_VERSION 14.15.0
ENV PIP_VERSION 20.3.3

SHELL ["/bin/bash", "--login", "-c"]

RUN apt-get update && \
    apt-get install -y git curl && \
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.37.2/install.sh | bash && \
    source ~/.nvm/nvm.sh \
    nvm alias default $NODE_VERSION && \
    nvm use default && \
    npm install -g --no-package-lock --no-save serve@"^11.3.2"  start-server-and-test@"^1.11.7" && \
    pip install -U pip==${PIP_VERSION}

WORKDIR /build

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY package.json package-lock.json ./
RUN npm ci --unsafe-perm --ignore-scripts

COPY manual manual
COPY tsconfig.json .babelrc .lessrc ./
COPY static static
COPY src src
RUN npm run build && \
    mkdir /app && \
    mv /build/dist /app && \
    rm -rf /build ~/.cache ~/.npm/_cacache

WORKDIR /app

COPY satellite satellite
COPY package.json app.py ./

EXPOSE 8089 9098 9099 1234

VOLUME /data

ENV SATELLITE_DIR=/data
ENV SATELLITE_WEB_PORT=1234
ENV SATELLITE_API_PORT=8089
ENV SATELLITE_REVERSE_PROXY_PORT=9098
ENV SATELLITE_FORWARD_PROXY_PORT=9099

ENTRYPOINT npm run start:docker
