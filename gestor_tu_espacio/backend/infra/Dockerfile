FROM node:22-alpine AS frontend-build

WORKDIR /app

COPY frontend/package.json frontend/package-lock.json ./frontend/
RUN cd frontend && npm ci

COPY frontend ./frontend
COPY backend ./backend

RUN cd frontend && npm run build


FROM python:3.12-slim AS runtime

WORKDIR /app/backend

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

COPY backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY backend ./
COPY --from=frontend-build /app/backend/app/static/landing ./app/static/landing

EXPOSE 5000

CMD ["python", "run.py"]
