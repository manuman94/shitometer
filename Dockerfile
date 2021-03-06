FROM node:14-alpine

RUN apk update && apk upgrade && \
    apk add --no-cache git
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY ./package.json /usr/src/app/
RUN npm install && npm cache clean --force
COPY ./ /usr/src/app
ENV NODE_ENV production

RUN [ "npm", "run", "build" ]
ENTRYPOINT [ "npm", "run", "start:dist" ]