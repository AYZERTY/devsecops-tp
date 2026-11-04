FROM node:22.23.4-alpine3.24 AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

FROM node:22.23.4-alpine3.24 AS runtime
# npm et Yarn ne servent qu'à la construction, pas à lancer l'API.
RUN rm -rf /usr/local/lib/node_modules/npm /opt/yarn-* \
    /usr/local/bin/npm /usr/local/bin/npx /usr/local/bin/yarn /usr/local/bin/yarnpkg
ENV NODE_ENV=production
WORKDIR /app
COPY --from=deps --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node package*.json ./
COPY --chown=node:node src ./src
USER node
EXPOSE 3000
CMD ["node", "src/index.js"]
