FROM node:10.16-alpine
WORKDIR /opt/mre

COPY public ./public/

COPY package*.json ./
RUN ["npm", "install", "--unsafe-perm"]

COPY tsconfig.json ./
COPY src ./src/
RUN ["npm", "run", "build"]

EXPOSE 3901/tcp
CMD ["npm", "start"]