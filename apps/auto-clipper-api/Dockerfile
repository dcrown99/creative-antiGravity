# syntax=docker/dockerfile:1

FROM python:3.11-slim AS base

# -----------------------------------------------------------------------------
# System Dependencies (Cached)
# -----------------------------------------------------------------------------
# aptのキャッシュ設定により、再ビルド時のダウンロードをスキップ
RUN rm -f /etc/apt/apt.conf.d/docker-clean; echo 'Binary::apt::APT::Keep-Downloaded-Packages "true";' > /etc/apt/apt.conf.d/keep-cache

RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,target=/var/lib/apt,sharing=locked \
    apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    curl \
    fonts-noto-cjk \
    build-essential \
    pkg-config \
    libavformat-dev \
    libavcodec-dev \
    libavdevice-dev \
    libavutil-dev \
    libswscale-dev \
    libswresample-dev \
    libavfilter-dev \
    imagemagick

# ImageMagick policy fix
RUN sed -i 's/none/read,write/g' /etc/ImageMagick*/policy.xml

WORKDIR /app

# -----------------------------------------------------------------------------
# Python Dependencies (Cached)
# -----------------------------------------------------------------------------
COPY requirements.txt .

# pipキャッシュをマウントしてインストール時間を短縮
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install --no-cache-dir -r requirements.txt

# -----------------------------------------------------------------------------
# Runtime Setup
# -----------------------------------------------------------------------------
ENV LD_LIBRARY_PATH=$LD_LIBRARY_PATH:/usr/local/lib/python3.11/site-packages/nvidia/cudnn/lib

# ソースコードは頻繁に変わるため最後にコピー
COPY . .

# ディレクトリ作成
RUN mkdir -p /app/temp /app/data && chmod 777 /app/temp /app/data

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]