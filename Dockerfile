FROM docker.io/library/node:22-alpine

ENV APP_ROOT="app"
ENV CONFIG_DIR="/config"
ENV NODE_ENV="production"

# ================= DO NOT EDIT BEYOND THIS LINE =================

RUN mkdir -p /${APP_ROOT}

WORKDIR /${APP_ROOT}

COPY packages.txt /tmp/

RUN apk update && cat /tmp/packages.txt | xargs apk add --no-cache

RUN rm /tmp/packages.txt

COPY package*.json /${APP_ROOT}/

RUN npm install --omit=dev

COPY --chmod=0755 entrypoint.sh /

COPY .eleventy.js /${APP_ROOT}/

COPY scripts/ /${APP_ROOT}/scripts

COPY src/data/*.js src/data/*.json /${APP_ROOT}/src/data/

COPY src/assets/ /${APP_ROOT}/src/assets

COPY src/includes/ /${APP_ROOT}/src/includes

COPY src/views/ /${APP_ROOT}/src/views

EXPOSE 80

ENTRYPOINT [ "/entrypoint.sh" ]
