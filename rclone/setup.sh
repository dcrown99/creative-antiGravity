#!/bin/bash
# Run rclone config in a temporary container
# Config will be saved to ./config/rclone/rclone.conf

mkdir -p config/rclone

docker run -it --rm \
  -v $(pwd)/config/rclone:/config/rclone \
  rclone/rclone \
  config
