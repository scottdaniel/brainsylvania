// Minimal image loader. Drawing code checks `.ready` and falls back to a
// vector placeholder until the image has actually decoded.
export function loadImage(url) {
  const img = new Image();
  img.ready = false;
  img.onload = () => { img.ready = true; };
  img.src = url;
  return img;
}

// Draw `img` scaled to `height` (aspect-ratio preserved), anchored by its
// bottom-center at (anchorX, anchorBottomY). Optionally mirrored horizontally.
export function drawAnchored(ctx, img, { x, bottomY, height, flip = false }) {
  const scale = height / img.naturalHeight;
  const w = img.naturalWidth * scale;
  ctx.save();
  ctx.translate(x, bottomY - height);
  if (flip) ctx.scale(-1, 1);
  ctx.drawImage(img, -w / 2, 0, w, height);
  ctx.restore();
}
