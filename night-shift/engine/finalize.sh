#!/usr/bin/env bash
# finalize.sh <part> <NAME>
# Muxes p<part>/out/video_noaudio.mp4 + p<part>/out/mix.wav into ../<NAME>_part<part>.mp4
# Size target: under 18 MB (jsDelivr serves GitHub files only up to 20 MB). 1080x1920, ~1.3 Mbps.
set -e
P=$1; NAME=${2:-REEL}
R="$(cd "$(dirname "$0")/.." && pwd)"
ffmpeg -v error -y -i "$R/p$P/out/video_noaudio.mp4" -i "$R/p$P/out/mix.wav" \
  -vf "noise=c0s=3:c0f=t+u,format=yuv420p" \
  -c:v libx264 -preset slow -b:v 1300k -maxrate 1800k -bufsize 3600k -profile:v high \
  -c:a aac -b:a 160k -ar 48000 -movflags +faststart -shortest "$R/${NAME}_part$P.mp4"
ls -la "$R/${NAME}_part$P.mp4"
