FROM oven/bun:1-alpine

WORKDIR /app

# Copiar archivos de dependencias
COPY package.json bun.lock ./

# Instalar dependencias
RUN bun install --frozen-lockfile

# Copiar el resto del código
COPY . .

# Exponer el puerto por defecto de Hono
EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["bun", "dev"]
