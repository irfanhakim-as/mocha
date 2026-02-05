FROM docker.io/library/node:22-alpine AS base

ENV APP_ROOT="app"
ENV NODE_ENV="production"
ENV SKIP_BUILD="true"

RUN mkdir -p /${APP_ROOT}

WORKDIR /${APP_ROOT}

COPY packages.txt /tmp/

RUN apk update && cat /tmp/packages.txt | xargs apk add --no-cache

RUN rm /tmp/packages.txt

# ================= DO NOT EDIT BEYOND THIS LINE =================

FROM base AS build

COPY package*.json /${APP_ROOT}/

RUN npm install --omit=dev

COPY .eleventy.js /${APP_ROOT}/

COPY scripts/ /${APP_ROOT}/scripts

COPY src/data/*.js src/data/*.json /${APP_ROOT}/src/data/

COPY src/assets/ /${APP_ROOT}/src/assets

COPY src/includes/ /${APP_ROOT}/src/includes

COPY src/views/ /${APP_ROOT}/src/views

RUN npm run build:docker

# ================= DO NOT EDIT BEYOND THIS LINE =================

FROM base AS runtime

COPY --chmod=0755 entrypoint.sh /

COPY --from=build /${APP_ROOT}/dist /${APP_ROOT}/dist

EXPOSE 80

ENTRYPOINT [ "/entrypoint.sh" ]
