#!/usr/bin/env sh
# Renders ajil.svg into every icon the apps ship: the back office's favicon, and the mobile app's
# web, Android and Windows icons. The copies are committed, so only whoever changes the icon needs
# ImageMagick 7 (`magick`). Run from anywhere.
set -eu

here=$(cd "$(dirname "$0")" && pwd)
source="$here/ajil.svg"
mobile="$here/../frontend/mobile"

# Rasterised large then scaled down, so small sizes stay sharp.
png() { magick -background none -density 1200 "$source" -resize "$1x$1" "$2"; }

cp "$source" "$here/../frontend/admin/public/icon.svg"

png 32 "$mobile/web/favicon.png"
for size in 192 512; do
    png "$size" "$mobile/web/icons/Icon-$size.png"
    # The glyph sits inside the maskable safe zone, so the same image serves.
    png "$size" "$mobile/web/icons/Icon-maskable-$size.png"
done

res="$mobile/android/app/src/main/res"
png 48 "$res/mipmap-mdpi/ic_launcher.png"
png 72 "$res/mipmap-hdpi/ic_launcher.png"
png 96 "$res/mipmap-xhdpi/ic_launcher.png"
png 144 "$res/mipmap-xxhdpi/ic_launcher.png"
png 192 "$res/mipmap-xxxhdpi/ic_launcher.png"

magick -background none -density 1200 "$source" -define icon:auto-resize=256,48,32,16 \
    "$mobile/windows/runner/resources/app_icon.ico"
