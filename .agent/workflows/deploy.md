---
description: Build and Run the Flash Man AI Docker Container
---

This workflow builds the multi-stage Docker image and starts the container using Docker Compose.

1. Ensure your `.env` file in `backend/` is populated with `OPENAI_API_KEY`.
2. Build the Docker image.
// turbo
```bash
docker build -t flash-man-ai .
```

3. Start the application using Docker Compose.
// turbo
```bash
docker-compose up -d
```

4. Verify the container is running.
// turbo
```bash
docker ps
```
