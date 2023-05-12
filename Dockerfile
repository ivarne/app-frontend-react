FROM node:16 as build-deps
WORKDIR /app

COPY ./package.json package.json
COPY ./yarn.lock yarn.lock
COPY ./.yarn .yarn
COPY ./.yarnrc.yml .yarnrc.yml

RUN
RUN yarn --immutable
COPY . ./
RUN yarn build

FROM nginx:1.23.2-alpine
COPY --from=build-deps /app/dist /usr/share/nginx/html
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
