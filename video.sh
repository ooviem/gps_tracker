DATE=$(date +"%Y-%m-%d_%H%M%SS")

raspivid -o ./home/pi/gps_tracker/web/camera/$DATE.h264 -t 10000