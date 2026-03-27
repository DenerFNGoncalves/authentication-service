FROM node:20-slim

WORKDIR /app

# Copia apenas manifests
COPY package.json package-lock.json ./

# Instala dependências
RUN npm ci

# Copia o resto do código
COPY . .

# Compila TypeScript
RUN npm run build

# Expõe a porta do serviço
EXPOSE 3001

# Comando de inicialização
CMD ["node", "dist/index.js"]
