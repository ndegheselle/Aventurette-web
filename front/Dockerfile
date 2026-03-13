FROM node:alpine AS build
WORKDIR /repo

ENV VITE_API_URL=http://sagace.lubriciel.ovh/api

# Workspace manifests
COPY package.json package-lock.json ./
COPY packages/front/package.json packages/front/package.json
COPY packages/common/package.json packages/common/package.json

RUN npm install --workspace=packages/front
RUN npm install --workspace=packages/common

COPY packages/common packages/common
COPY packages/front packages/front

RUN npm run build --workspace=packages/common
RUN npm run build --workspace=packages/front

# Minimal runtime container
FROM nginx:alpine

COPY nginx/nginx.conf /etc/nginx/nginx.conf
COPY nginx/conf.d /etc/nginx/conf.d

# Copy built frontend into nginx
COPY --from=build /repo/packages/front/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]