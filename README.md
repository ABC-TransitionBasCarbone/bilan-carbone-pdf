# Bilan Carbone PDF Service

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
