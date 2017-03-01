DATE=$(date +"%Y-%m-%d_%H%M%SS")

raspivid -o ./web/camera/$DATE.h264 -t 10000