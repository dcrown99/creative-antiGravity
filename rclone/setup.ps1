# Run rclone config in a temporary container
# Config will be saved to ./config/rclone/rclone.conf

New-Item -ItemType Directory -Force -Path config/rclone | Out-Null

# Get current directory in a format Docker accepts (no backslashes for bind mounts in some contexts, but ${PWD} usually works in PS)
$currentDir = ${PWD}

docker run -it --rm `
  -v "${currentDir}/config/rclone:/config/rclone" `
  rclone/rclone `
  config
