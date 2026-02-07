FROM node:22-bullseye

RUN apt-get update && \
    apt-get install -y ffmpeg libttspico-utils && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000
CMD ["npm", "start"]
