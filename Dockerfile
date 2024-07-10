# Build stage for frontend
FROM node:14 AS frontend-builder
WORKDIR /usr/src/app/frontend
COPY frontend/package*.json frontend/yarn.lock ./
RUN yarn install
COPY ./frontend .
RUN yarn build

# Build stage for backend
FROM node:14 AS backend-builder
WORKDIR /usr/src/app/backend
COPY backend/package*.json backend/yarn.lock ./
RUN yarn install
COPY ./backend .
RUN yarn build

# Run stage
FROM node:14
WORKDIR /usr/src/app
# Copy built frontend to the desired directory (assuming backend serves it)
COPY --from=frontend-builder /usr/src/app/frontend/public ./frontend/public
# Copy built backend
COPY --from=backend-builder /usr/src/app/backend ./backend
EXPOSE 3000
WORKDIR /usr/src/app/backend
CMD ["yarn", "start"]