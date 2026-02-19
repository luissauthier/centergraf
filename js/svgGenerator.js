// js/svgGenerator.js
// Gerador A3 em SVG (ARTE + FACA) baseado nas facas SVG.
// Requisitos:
// - /assets/facas/faca_p.svg, faca_g.svg, faca_mix.svg
// - /assets/fonts/Inter-Bold.ttf (ou outra fonte) para texto em curva (path)
// - rodar em servidor (http://localhost), não em file://

const SVG_GEN = (() => {
  const MM_PER_PT = 0.3527777778;

  // Medidas reais (faca e arte segura)
  const SAFE = {
    P: { wMm: 37.5, hMm: 8.5 },
    G: { wMm: 72.0, hMm: 37.0 },
  };

  // Para classificar slots (pela largura da faca em mm)
  const CUT = {
    P: { wMm: 39.0, hMm: 10.0 },
    G: { wMm: 75.0, hMm: 40.0 },
  };

  // Cache
  const cache = {
    font: null,
    facaText: new Map(),     // tipo -> string
    slots: new Map(),        // tipo -> {page, slots[]}
    imgDataUrl: new Map(),   // url -> dataURL
  };

  function parseLength(str) {
    // retorna {value, unit} onde unit pode ser 'mm','pt','px','' etc.
    const m = String(str || '').trim().match(/^([0-9.+-eE]+)\s*([a-z%]*)$/);
    if (!m) return { value: NaN, unit: '' };
    return { value: parseFloat(m[1]), unit: (m[2] || '').toLowerCase() };
  }

  function lengthToMm(lenStr, pxToMm = null) {
    const { value, unit } = parseLength(lenStr);
    if (!isFinite(value)) return NaN;
    if (unit === 'mm') return value;
    if (unit === 'cm') return value * 10;
    if (unit === 'in') return value * 25.4;
    if (unit === 'pt') return value * MM_PER_PT;
    if (unit === 'px' || unit === '') {
      // px depende do SVG; se pxToMm foi calculado, usa. Se não, assume 96dpi (~0.264583mm)
      const fallback = 25.4 / 96;
      return value * (pxToMm ?? fallback);
    }
    // outros: usa fallback
    const fallback = 25.4 / 96;
    return value * fallback;
  }

  function mmToDocUnits(mm, unitPerMm) {
    return mm * unitPerMm;
  }

  async function loadFont(fontUrl = 'assets/fonts/Inter-Bold.ttf') {
    if (cache.font) return cache.font;
    cache.font = await new Promise((resolve, reject) => {
      opentype.load(fontUrl, (err, font) => (err ? reject(err) : resolve(font)));
    });
    return cache.font;
  }

  async function fetchText(url) {
    if (cache.facaText.has(url)) return cache.facaText.get(url);
    const t = await fetch(url).then(r => {
      if (!r.ok) throw new Error(`Falha ao carregar: ${url} (${r.status})`);
      return r.text();
    });
    cache.facaText.set(url, t);
    return t;
  }

  async function fetchAsDataURL(url) {
    if (!url) return null;
    if (cache.imgDataUrl.has(url)) return cache.imgDataUrl.get(url);

    const res = await fetch(url);
    if (!res.ok) throw new Error(`Falha ao carregar imagem: ${url} (${res.status})`);
    const blob = await res.blob();

    const dataUrl = await new Promise((resolve) => {
      const fr = new FileReader();
      fr.onload = () => resolve(fr.result);
      fr.readAsDataURL(blob);
    });

    cache.imgDataUrl.set(url, dataUrl);
    return dataUrl;
  }

  function createHiddenSvgContainer(svgText) {
    // Injeta SVG no DOM para poder usar getBBox()
    const wrap = document.createElement('div');
    wrap.style.position = 'fixed';
    wrap.style.left = '-10000px';
    wrap.style.top = '-10000px';
    wrap.style.width = '1px';
    wrap.style.height = '1px';
    wrap.style.overflow = 'hidden';
    wrap.style.opacity = '0';
    wrap.innerHTML = svgText;
    document.body.appendChild(wrap);

    const svgEl = wrap.querySelector('svg');
    if (!svgEl) {
      wrap.remove();
      throw new Error('SVG inválido: não encontrei <svg>.');
    }
    return { wrap, svgEl };
  }

  function getSvgPageInfo(svgEl) {
    // Tenta deduzir escala e unidades
    const vb = (svgEl.getAttribute('viewBox') || '').trim();
    const wAttr = svgEl.getAttribute('width') || '';
    const hAttr = svgEl.getAttribute('height') || '';

    const vbParts = vb ? vb.split(/\s+|,/).map(Number) : null;
    const viewBox = (vbParts && vbParts.length === 4 && vbParts.every(n => isFinite(n)))
      ? { x: vbParts[0], y: vbParts[1], w: vbParts[2], h: vbParts[3] }
      : null;

    // Se width/height tem unidade (pt/mm/px), convertemos para mm e deduzimos unitPerMm
    const widthMm = wAttr ? lengthToMm(wAttr) : NaN;
    const heightMm = hAttr ? lengthToMm(hAttr) : NaN;

    // “document units” = unidade do viewBox (geralmente coincide com pt quando convertido de PDF)
    // unitPerMm = (viewBoxWidthUnits / widthMm)
    let unitPerMm = null;
    let pageUnitsW = null;
    let pageUnitsH = null;

    if (viewBox && isFinite(widthMm) && widthMm > 0) {
      unitPerMm = viewBox.w / widthMm;
      pageUnitsW = viewBox.w;
      pageUnitsH = viewBox.h;
    } else if (viewBox) {
      // fallback: assume que unidades do viewBox são pt
      unitPerMm = 1 / MM_PER_PT; // pt por mm
      pageUnitsW = viewBox.w;
      pageUnitsH = viewBox.h;
    } else {
      // Sem viewBox: usa getBBox do próprio svg (último recurso)
      const bb = svgEl.getBBox();
      unitPerMm = 1 / MM_PER_PT;
      pageUnitsW = bb.width;
      pageUnitsH = bb.height;
    }

    return {
      viewBox,
      unitPerMm,
      pageUnitsW,
      pageUnitsH,
      widthAttr: wAttr,
      heightAttr: hAttr
    };
  }

  function extractSlotsFromFaca(svgEl, unitPerMm) {
    // Pega todos os shapes “prováveis” (rect e path) e usa getBBox()
    const shapes = [
      ...svgEl.querySelectorAll('rect, path, polygon, polyline')
    ];

    // Filtra:
    // - ignora shapes gigantes (bordas da página)
    // - ignora elementos com display none
    // - ignora preenchidos sólidos (normalmente faca é stroke e fill none)
    const candidates = [];
    for (const el of shapes) {
      const style = window.getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden') continue;

      let bb;
      try { bb = el.getBBox(); } catch { continue; }

      if (!bb || bb.width <= 0 || bb.height <= 0) continue;

      // ignora muito grande (provável moldura geral)
      if (bb.width > 0.95 * svgEl.viewBox.baseVal.width && bb.height > 0.2 * svgEl.viewBox.baseVal.height) {
        continue;
      }

      // pega mm aproximado pra classificar
      const wMm = bb.width / unitPerMm;
      const hMm = bb.height / unitPerMm;

      // Mantém só o que parece etiqueta (perto das medidas)
      const near = (a, b, tol) => Math.abs(a - b) <= tol;

      const isP = near(wMm, CUT.P.wMm, 2.0) && near(hMm, CUT.P.hMm, 2.0);
      const isG = near(wMm, CUT.G.wMm, 3.0) && near(hMm, CUT.G.hMm, 3.0);

      if (!isP && !isG) continue;

      candidates.push({
        x: bb.x,
        y: bb.y,
        w: bb.width,
        h: bb.height,
        tipo: isP ? 'P' : 'G'
      });
    }

    // Ordena por linha/coluna para estabilidade
    candidates.sort((a, b) => (a.y - b.y) || (a.x - b.x));

    // Remove duplicatas (às vezes SVG tem stroke duplicado)
    const out = [];
    const key = (s) => `${Math.round(s.x)}_${Math.round(s.y)}_${Math.round(s.w)}_${Math.round(s.h)}_${s.tipo}`;
    const seen = new Set();
    for (const s of candidates) {
      const k = key(s);
      if (seen.has(k)) continue;
      seen.add(k);
      out.push(s);
    }

    return out;
  }

  function buildSvgHeader({ viewBox }) {
    // A3 em mm
    const A3_W_MM = 310;
    const A3_H_MM = 430;

    const vb = viewBox
      ? `${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`
      : `0 0 ${A3_W_MM} ${A3_H_MM}`;

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg"
     xmlns:xlink="http://www.w3.org/1999/xlink"
     width="${A3_W_MM}mm"
     height="${A3_H_MM}mm"
     viewBox="${vb}">
`;
  }

  function escapeXml(s) {
    return String(s ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&apos;');
  }

  function wrapTextLines(font, text, maxWidthUnits, fontSize, letterSpacing = 0) {
    // Quebra por palavras e limita por largura usando advanceWidth
    const words = String(text || '').trim().split(/\s+/).filter(Boolean);
    if (!words.length) return [''];

    const lines = [];
    let line = '';

    const measure = (t) => {
      const adv = font.getAdvanceWidth(t, fontSize);
      // Ajuste simples de letterSpacing (aproximado): (n-1)*ls
      const extra = letterSpacing ? Math.max(0, t.length - 1) * letterSpacing : 0;
      return adv + extra;
    };

    for (const w of words) {
      const test = line ? `${line} ${w}` : w;
      if (measure(test) <= maxWidthUnits) {
        line = test;
      } else {
        if (line) lines.push(line);
        line = w;
      }
    }
    if (line) lines.push(line);
    return lines;
  }

  function fitTextToBox(font, text, maxWidthUnits, maxLines, startSize, minSize) {
    let size = startSize;
    for (let i = 0; i < 60; i++) {
      const lines = wrapTextLines(font, text, maxWidthUnits, size);
      const widest = Math.max(...lines.map(l => font.getAdvanceWidth(l, size)));
      if (lines.length <= maxLines && widest <= maxWidthUnits) {
        return { size, lines };
      }
      size = Math.max(minSize, size - 1);
      if (size === minSize) {
        const lines2 = wrapTextLines(font, text, maxWidthUnits, size).slice(0, maxLines);
        return { size, lines: lines2 };
      }
    }
    return { size: minSize, lines: [String(text || '')] };
  }

  function textLinesToPathSvg(font, lines, centerX, centerY, fontSize, color, lineHeight = 1.15) {
    // Converte cada linha em path usando opentype
    const paths = [];
    const lh = fontSize * lineHeight;
    const totalH = lh * lines.length;
    const topY = centerY - totalH / 2 + lh * 0.8; // baseline approx

    lines.forEach((ln, i) => {
      const adv = font.getAdvanceWidth(ln, fontSize);
      const x = centerX - adv / 2;
      const y = topY + i * lh;

      const p = font.getPath(ln, x, y, fontSize);
      const d = p.toPathData(2);
      paths.push(`<path d="${d}" fill="${color}" />`);
    });

    return paths.join('\n');
  }

  async function getSlots(tipoCartela) {
    if (cache.slots.has(tipoCartela)) return cache.slots.get(tipoCartela);

    const facaUrl = `assets/facas/faca_${tipoCartela.toLowerCase()}.svg`;
    const svgText = await fetchText(facaUrl);

    const { wrap, svgEl } = createHiddenSvgContainer(svgText);
    try {
      // Garante que exista viewBox para getBBox ficar coerente
      if (!svgEl.getAttribute('viewBox')) {
        // tenta inferir pelo bbox
        const bb = svgEl.getBBox();
        svgEl.setAttribute('viewBox', `0 0 ${bb.width} ${bb.height}`);
      }

      const page = getSvgPageInfo(svgEl);
      const slots = extractSlotsFromFaca(svgEl, page.unitPerMm);

      const result = { page, slots, facaUrl, facaText: svgText };
      cache.slots.set(tipoCartela, result);
      return result;
    } finally {
      wrap.remove();
    }
  }

  async function gerarSvgsCartela({
    tipoCartela,          // "P" | "G" | "MIX"
    textoP,
    textoG,
    corHex,               // "#RRGGBB"
    personagemId,         // id do personagem selecionado (opcional)
    personagemUrl,        // caminho da imagem (opcional) ex: "assets/personagens/sonic.png"
    fixarImagem = true,   // embed base64
    fontUrl = 'assets/fonts/Inter-Bold.ttf',
  }) {
    const { page, slots, facaText } = await getSlots(tipoCartela);
    const font = await loadFont(fontUrl);

    const unitPerMm = page.unitPerMm;

    // Cabeçalho com tamanho exatamente igual à faca (escala 1:1)
    let svgArte = buildSvgHeader(page);

    // Fundo A3 inteiro (sangria) = cor
    svgArte += `<rect x="0" y="0" width="${page.pageUnitsW}" height="${page.pageUnitsH}" fill="${escapeXml(corHex)}" />\n`;

    // Imagem do personagem (embed)
    let imgDataUrl = null;
    if (personagemUrl) {
      imgDataUrl = fixarImagem ? await fetchAsDataURL(personagemUrl) : personagemUrl;
    }

    // Desenha cada etiqueta (área segura dentro da faca)
    for (const s of slots) {
      const safe = SAFE[s.tipo];

      const safeW = mmToDocUnits(safe.wMm, unitPerMm);
      const safeH = mmToDocUnits(safe.hMm, unitPerMm);

      const x = s.x + (s.w - safeW) / 2;
      const y = s.y + (s.h - safeH) / 2;

      // Retângulo branco (arte)
      // const rx = Math.min(safeH * 0.25, safeW * 0.15); // arredondamento agradável
      const radiusMm = (s.tipo === 'P') ? 1.8 : 4.0;
      const rx = mmToDocUnits(radiusMm, unitPerMm);
      svgArte += `<rect x="${x}" y="${y}" width="${safeW}" height="${safeH}" rx="${rx}" ry="${rx}" fill="#ffffff" />\n`;

      // Layout interno: reserva área para imagem + texto
      const padding = Math.min(safeW, safeH) * 0.10;
      const innerX = x + padding;
      const innerY = y + padding;
      const innerW = safeW - padding * 2;
      const innerH = safeH - padding * 2;

      const hasImg = !!imgDataUrl;

      // Tamanhos de imagem por tipo
      const imgBoxW = hasImg ? (s.tipo === 'P' ? innerH * 1.2 : innerH * 1.0) : 0;
      const imgBoxH = hasImg ? innerH : 0;

      // Área do texto
      const textBoxX = innerX + (hasImg ? (imgBoxW + padding * 0.8) : 0);
      const textBoxW = innerW - (hasImg ? (imgBoxW + padding * 0.8) : 0);
      const textCenterX = textBoxX + textBoxW / 2;
      const textCenterY = innerY + innerH / 2;

      // Desenha imagem (à esquerda)
      if (hasImg) {
        const imgX = innerX;
        const imgY = innerY;
        svgArte += `<image x="${imgX}" y="${imgY}" width="${imgBoxW}" height="${imgBoxH}" preserveAspectRatio="xMidYMid meet" href="${imgDataUrl}" />\n`;
      }

      // Texto em curva (path)
      const txt = (s.tipo === 'P') ? (textoP || '') : (textoG || textoP || '');

      // Tamanho inicial em “doc units”: converte mm aproximado pra fonte
      const startSize = s.tipo === 'P'
        ? mmToDocUnits(2.9, unitPerMm)   // ~2.9mm
        : mmToDocUnits(5.0, unitPerMm);  // ~5mm

      const minSize = s.tipo === 'P'
        ? mmToDocUnits(2.0, unitPerMm)
        : mmToDocUnits(3.2, unitPerMm);

      const maxLines = s.tipo === 'P' ? 2 : 3;

      const { size, lines } = fitTextToBox(font, txt, textBoxW, maxLines, startSize, minSize);
      svgArte += textLinesToPathSvg(font, lines, textCenterX, textCenterY, size, escapeXml(corHex), 1.12) + '\n';
    }

    svgArte += `</svg>`;

    // SVG da faca (somente magenta) — simples: força stroke magenta e fill none
    const svgFaca = forceFacaMagenta(facaText);

    return {
      arteSvgText: svgArte,
      facaSvgText: svgFaca
    };
  }

  function forceFacaMagenta(svgText) {
    // Força estilos “de faca”: stroke magenta, fill none
    // (não é perfeito para 100% dos SVGs, mas cobre a maioria)
    let out = svgText;

    // remove fills sólidos
    out = out.replaceAll(/fill="[^"]*"/g, 'fill="none"');
    out = out.replaceAll(/fill:\s*[^;"]+/g, 'fill:none');

    // força stroke magenta
    out = out.replaceAll(/stroke="[^"]*"/g, 'stroke="#FF00FF"');
    out = out.replaceAll(/stroke:\s*[^;"]+/g, 'stroke:#FF00FF');

    // se não houver stroke definido, injeta um style global
    if (!/stroke=/.test(out) && !/stroke:/.test(out)) {
      out = out.replace('<svg', '<svg style="stroke:#FF00FF; fill:none"');
    }

    return out;
  }

  function downloadText(filename, text, mime = 'image/svg+xml') {
    const blob = new Blob([text], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function downloadSvgAsPdf(svgText, filename) {
    if (!window.jspdf || !window.svg2pdf) {
      alert("As bibliotecas de PDF ainda estão carregando. Por favor, aguarde um segundo e tente novamente.");
      return;
    }
    const { jsPDF } = window.jspdf;

    const parser = new DOMParser();
    const svgEl = parser.parseFromString(svgText, "image/svg+xml").querySelector("svg");

    // Converte largura/altura de mm para o formato PDF
    const wMm = parseFloat(svgEl.getAttribute("width")) || 310;
    const hMm = parseFloat(svgEl.getAttribute("height")) || 430;

    const pdf = new jsPDF({
      orientation: wMm > hMm ? "landscape" : "portrait",
      unit: "mm",
      format: [wMm, hMm]
    });

    await window.svg2pdf.svg2pdf(svgEl, pdf, {
      xOffset: 0,
      yOffset: 0,
      scale: 1
    });

    pdf.save(filename);
  }

  return {
    gerarSvgsCartela,
    downloadText,
    downloadSvgAsPdf
  };
})();
