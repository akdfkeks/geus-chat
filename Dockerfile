FROM node:20 AS builder

# Make working dir
WORKDIR /app

#
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN yarn install

COPY . .
# COPY *.env ./

RUN yarn run build

FROM node:20

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
# COPY --from=builder /app/*.env ./

EXPOSE 3000
CMD ["yarn", "run", "start:prod"]