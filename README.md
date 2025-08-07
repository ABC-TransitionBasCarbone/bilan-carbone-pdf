# Bilan Carbone PDF Service

## Development

Copy env.dist to .env and fill the values and replace the API_SECRET_KEY with a generated value.

```bash
openssl rand -hex 32
```

Then copy the generated value to the .env file.

```bash
cp .env.dist .env
```

Install dependencies:

```bash
yarn install
```

### Run locally in development mode

```bash
yarn dev
```

### Run locally with Docker

```bash
docker-compose up --build
```

## Deployment to Scaleway

### 1. Login to Scaleway Container Registry

Use the Scaleway API key secrets linked to your Scaleway account.

```bash
docker login rg.fr-par.scw.cloud/namespace-playwright-express-pdf -u nologin
```

### 2. Build Docker Image

```bash
docker build --platform=linux/amd64 -t rg.fr-par.scw.cloud/namespace-playwright-express-pdf/bilan-carbone-pdf:latest .
```

### 3. Push Image to Registry

```bash
docker push rg.fr-par.scw.cloud/namespace-playwright-express-pdf/bilan-carbone-pdf:latest
```

### 4. Deploy container in Scaleway

In Scaleway Serverless compute > Container, deploy the container for this service manually or find a way to do it with CLI.
