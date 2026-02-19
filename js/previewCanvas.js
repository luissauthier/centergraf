// js/previewCanvas.js
// Responsável apenas pela prévia em canvas

const PREVIEW = (() => {

  const PT_TO_PX = 3.528;

  const SIZE = {
    P: { w: 400, h: 100, imgMaxW: 60, imgMaxH: 80, pt: 12 },
    G: { w: 750, h: 400, imgMaxW: 230, imgMaxH: 300, pt: 21 }
  };

  function layoutText(ctx, text, fontFamily, targetPt, maxWidth, maxLines) {
    let sizePx = Math.round(targetPt * PT_TO_PX);

    for (let tries = 0; tries < 40; tries++) {
      ctx.font = `700 ${sizePx}px "${fontFamily}", "Segoe UI", Arial, sans-serif`;

      const lines = [];
      const words = (text || '').trim().split(/\s+/);
      let line = '';

      for (const w of words) {
        const test = line ? line + ' ' + w : w;
        if (ctx.measureText(test).width <= maxWidth) {
          line = test;
        } else {
          if (line) lines.push(line);
          line = w;
        }
      }

      if (line) lines.push(line);

      const widest = Math.max(...lines.map(l => ctx.measureText(l).width));

      if (lines.length <= maxLines && widest <= maxWidth)
        return { sizePx, lines };

      sizePx = Math.max(sizePx - 2, 10);
    }

    return { sizePx: 10, lines: [text] };
  }

  function roundRectPath(ctx, x, y, w, h, r) {
    const rr = Math.min(r, Math.min(w, h) / 2);
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
  }

  function desenhar(canvas, opts) {
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // fundo
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, w, h);

    const radius = Math.round(h * 0.25);
    ctx.lineWidth = Math.max(4, Math.round(h * 0.06));
    ctx.strokeStyle = opts.color;

    ctx.beginPath();
    roundRectPath(ctx, 6, 6, w - 12, h - 12, radius);
    ctx.stroke();

    let img = opts.image;
    const hasImg = !!img;

    let imgW = 0, imgH = 0, ix = 0, iy = 0;

    if (hasImg) {
      const ratio = Math.min(
        opts.imgMaxW / img.width,
        opts.imgMaxH / img.height
      );

      imgW = Math.round(img.width * ratio);
      imgH = Math.round(img.height * ratio);
      ix = Math.round(w * 0.05);
      iy = Math.round((h - imgH) / 2);

      ctx.drawImage(img, ix, iy, imgW, imgH);
    }

    ctx.fillStyle = opts.color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const paddingLeft = hasImg ? (ix + imgW + w * 0.05) : (w * 0.08);
    const maxTextWidth = hasImg ? (w - paddingLeft - w * 0.05) : (w - w * 0.16);

    const { sizePx, lines } =
      layoutText(ctx, opts.text, opts.fontFamily, opts.pt, maxTextWidth, opts.maxLines);

    ctx.font = `700 ${sizePx}px "${opts.fontFamily}", "Segoe UI", Arial, sans-serif`;

    const lineHeight = sizePx * 1.1;
    const totalH = lineHeight * lines.length;
    const tx = hasImg ? paddingLeft + maxTextWidth / 2 : w / 2;
    const ty = h / 2;

    lines.forEach((ln, i) => {
      ctx.fillText(
        ln,
        tx,
        ty - totalH / 2 + i * lineHeight + lineHeight / 2
      );
    });
  }

  return {
    SIZE,
    desenhar
  };

})();
