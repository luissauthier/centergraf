document.addEventListener("DOMContentLoaded", () => {

    /* ====== CONFIG ====== */
    let WHATSAPP_NUMBER = '555137821165';  // (55 + DDD + número)
    const CATALOG_URL = '/lhdigital-etiquetas/catalogo.html';

    /* Lista de personagens — padrão "Nenhum" (sem imagem) */
    const CHAR_LIST = [
        { id: "nenhum", nome: "Nenhum", arquivo: null },
        { id: "upload", nome: "Minha imagem", arquivo: null, isUpload: true },
        { id: "moana", nome: "Moana", arquivo: "moana.png" },
        { id: "guerreiraskpop", nome: "Guerreiras do KPop", arquivo: "guerreiraskpop.png" },
        { id: "frozen", nome: "Frozen (Elsa)", arquivo: "frozen.png" },
        { id: "barbie", nome: "Barbie", arquivo: "barbie.png" },
        { id: "ladybug", nome: "Ladybug", arquivo: "ladybug.png" },
        { id: "mcqueen", nome: "McQueen", arquivo: "mcqueen.png" },
        { id: "eevee", nome: "Eevee", arquivo: "eevee.png" },
        { id: "bulbasaur", nome: "Bulbasaur", arquivo: "bulbasaur.png" },
        { id: "squirtle", nome: "Squirtle", arquivo: "squirtle.png" },
        { id: "charmander", nome: "Charmander", arquivo: "charmander.png" },
        { id: "pikachu", nome: "Pikachu", arquivo: "pikachu.png" },
        { id: "minecraft", nome: "Minecraft", arquivo: "minecraft.png" },
        { id: "luigi", nome: "Luigi", arquivo: "luigi.png" },
        { id: "mario", nome: "Super Mario", arquivo: "mario.png" },
        { id: "sonic", nome: "Sonic", arquivo: "sonic2.png" },
        { id: "sonic2", nome: "Sonic (variante)", arquivo: "sonic.png" },
        { id: "hulk", nome: "Hulk", arquivo: "hulk.png" },
        { id: "capitao-america", nome: "Capitão América", arquivo: "capitao-america.png" },
        { id: "homem-ferro", nome: "Homem de Ferro", arquivo: "homem-ferro.png" },
        { id: "homem-aranha", nome: "Homem-Aranha", arquivo: "homem-aranha.png" },
        { id: "galinha-pintadinha", nome: "Galinha Pintadinha", arquivo: "galinha-pintadinha.png" },
        { id: "baby-shark", nome: "Baby Shark", arquivo: "baby-shark.png" },
        { id: "gabbys", nome: "Gabby’s Dollhouse", arquivo: "gabbys.png" },
        { id: "hello-kitty", nome: "Hello Kitty", arquivo: "hello-kitty.png" },
        { id: "mickey-rosto", nome: "Mickey (rosto)", arquivo: "mickey-rosto.png" },
        { id: "minnie-rosto", nome: "Minnie (rosto)", arquivo: "minnie-rosto.png" },
        { id: "mickey", nome: "Mickey", arquivo: "mickey.png" },
        { id: "minnie", nome: "Minnie", arquivo: "minnie.png" },
        { id: "peppa", nome: "Peppa", arquivo: "peppa.png" },
        { id: "chase", nome: "Chase (Patrulha Canina)", arquivo: "chase.png" },
        { id: "marshal", nome: "Marshall (Patrulha Canina)", arquivo: "marshal.png" },
        { id: "skye", nome: "Skye (Patrulha Canina)", arquivo: "skye.png" },
        { id: "skye2", nome: "Skye (variante) (Patrulha Canina)", arquivo: "skye2.png" },
        { id: "bluey", nome: "Bluey", arquivo: "bluey.png" },
        { id: "stitch", nome: "Stitch", arquivo: "stitch.png" },
        { id: "capivara", nome: "Capivara", arquivo: "capivara.png" },
        { id: "unicornio", nome: "Unicórnio", arquivo: "unicornio.png" },
        { id: "unicornio2", nome: "Unicórnio 2", arquivo: "unicornio2.png" },
        { id: "stitch-angel", nome: "Stitch e Angel", arquivo: "stitch-angel.png" },
        { id: "homem-aranha2", nome: "Homem-Aranha (variante)", arquivo: "homem-aranha2.png" },
        { id: "hulk-baby", nome: "Hulk Baby", arquivo: "hulk-baby.png" },
        { id: "carro-azul", nome: "Carro Azul", arquivo: "carro-azul.png" },
        { id: "carro-laranja", nome: "Carro Laranja", arquivo: "carro-laranja.png" },
        { id: "princesa-sofia", nome: "Princesa Sofia", arquivo: "princesa-sofia.png" },
        { id: "gremio", nome: "Grêmio", arquivo: "gremio.png" },
        { id: "inter", nome: "Inter", arquivo: "inter.png" },
        { id: "cowboy", nome: "Cowboy", arquivo: "cowboy.png" },
        { id: "roblox", nome: "Roblox", arquivo: "roblox.png" },
        { id: "dino", nome: "Dino", arquivo: "dino.png" },
        { id: "dinossauro", nome: "Dinossauro", arquivo: "dinossauro.png" }
    ];

    // Cores sugeridas por personagem (mesmas do catálogo)
    const COLOR_MAP = {
        bluey: '#92C6EB',
        chase: '#1B2B4E',
        skye: '#EC5986',
        skye2: '#EC5986',
        marshal: '#E5050F',
        peppa: '#FFB0DF',
        gabbys: '#A600E2',
        guerreiraskpop: '#EC268F',
        frozen: '#6ED3E0',
        moana: '#D63A2E',
        barbie: '#E240A3',
        ladybug: '#E5050F',
        stitch: '#4A7BB5',
        'stitch-angel': '#E39EC7',

        'homem-aranha': '#E5050F',
        'homem-aranha2': '#CF2A20',
        'homem-ferro': '#E5050F',
        hulk: '#5C8F4C',
        'capitao-america': '#0D80BF',

        minecraft: '#4DAC22',
        roblox: '#E5050F',
        sonic: '#14489F',
        sonic2: '#3C6DFB',
        mario: '#E5050F',
        luigi: '#4DAC22',

        pikachu: '#FAD61E',
        bulbasaur: '#79A75B',
        squirtle: '#52A3A9',
        charmander: '#F47932',
        eevee: '#BD8946',

        gremio: '#0D80BF',
        inter: '#E5050F',

        mcqueen: '#E5050F',
        'carro-azul': '#2A7CD3',
        'carro-laranja': '#F58634',

        minnie: '#E5050F',
        mickey: '#E5050F',
        'hello-kitty': '#EE3E41',

        unicornio: '#DFAFF6',
        unicornio2: '#EC268F',
        capivara: '#F58634',
        cowboy: '#A96A23',
        dino: '#4DAC22',
        dinossauro: '#4DAC22'
    };

    // Injeta a cor sugerida no CHAR_LIST sem precisar duplicar manualmente
    CHAR_LIST.forEach(c => {
        if (!c.cor && COLOR_MAP[c.id]) c.cor = COLOR_MAP[c.id];
    });

    /* tamanhos em px (10 px/mm) */
    const SIZE = {
        P: { w: 400, h: 100, imgMaxW: 60, imgMaxH: 80, pt: 12 }, // 40×10 mm
        G: { w: 750, h: 400, imgMaxW: 230, imgMaxH: 300, pt: 21 }  // 75×40 mm
    };

    const el = id => document.getElementById(id);
    const nome = el('nome');
    const corUnica = el('corUnica');
    const chkTextos = el('chkTextos');
    const wrapNomeG = el('wrapNomeG');
    const nomeG = el('nomeG');
    const chkFixarCor = el('chkFixarCor');

    const cartela = el('cartela');
    const canvasP = el('canvasP');
    const canvasG = el('canvasG');
    const btnWhats = el('btnWhats');
    const btnDownload = el('btnDownload');
    const btnReset = el('btnReset');
    const galeria = el('galeria');

    const imgUpload = el('imgUpload');

    let uploadImg = null;       // Image carregada do arquivo do usuário
    let uploadInfo = null;      // { name, size, type, w, h }

    // --- NOVO: controles via URL para parceiros ---
    const qs = new URLSearchParams(location.search);
    const personaId = qs.get('personagem');
    const corParam = qs.get('cor');

    // esconder botão do Whats quando for uso em papelaria
    const modoPapelaria = qs.has('papelaria') || qs.get('hidewhats') === '1';
    if (modoPapelaria) {
        // some visualmente (mantém no DOM para não quebrar listeners abaixo)
        btnWhats.style.display = 'none';
    }

    // Propaga parâmetros entre telas (?papelaria, ?hidewhats=1, ?zap)
    const passParams = new URLSearchParams();
    ['papelaria', 'hidewhats', 'zap'].forEach(k => {
        if (qs.has(k)) passParams.set(k, qs.get(k) || '');
    });

    // Ajusta o link "Ver catálogo" para levar os mesmos parâmetros
    const toCatalog = document.getElementById('toCatalog');
    if (toCatalog) {
        const base = (typeof CATALOG_URL !== 'undefined' && CATALOG_URL) ? CATALOG_URL : 'catalogo.html';
        toCatalog.href = base + (passParams.toString() ? `?${passParams}` : '');
    }

    // (opcional) permitir sobrescrever o número do Whats por parâmetro: ?zap=55DDDNXXXXXXXX
    // mude "const WHATSAPP_NUMBER" para "let WHATSAPP_NUMBER" lá no topo do arquivo!
    if (qs.has('zap')) {
        WHATSAPP_NUMBER = qs.get('zap').replace(/[^\d]/g, '');
    }

    let personagemAtual = CHAR_LIST[0]; // começa em "Nenhum"
    let imgCache = {};

    const toggle = document.getElementById('menuToggle');
    const menu = document.getElementById('mobileMenu');
    const overlay = document.getElementById('menuOverlay');

    toggle.addEventListener('click', () => {
        menu.classList.toggle('open');
        overlay.classList.toggle('show');
        document.body.style.overflow = menu.classList.contains('open') ? 'hidden' : '';
    });

    overlay.addEventListener('click', () => {
        menu.classList.remove('open');
        overlay.classList.remove('show');
        document.body.style.overflow = '';
    });

    function hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    function extrairSlotsDoSVG(svgText) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(svgText, "image/svg+xml");

        const rects = [...doc.querySelectorAll("rect")];

        return rects.map(r => {
            const w = parseFloat(r.getAttribute("width"));
            const h = parseFloat(r.getAttribute("height"));

            const mmW = w / 2.83465;

            let tipo = mmW < 50 ? "P" : "G";

            return {
                x: parseFloat(r.getAttribute("x")),
                y: parseFloat(r.getAttribute("y")),
                w,
                h,
                tipo
            };
        });
    }

    function montarGaleria() {
        galeria.innerHTML = '';
        CHAR_LIST.forEach((c, i) => {
            const wrap = document.createElement('button');
            wrap.type = 'button';
            wrap.className = 'card-img';
            wrap.setAttribute('data-id', c.id);
            wrap.setAttribute('aria-pressed', i === 0 ? 'true' : 'false');
            const imgTag = c.isUpload
                ? `<img alt="Minha imagem" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='120'%3E%3Crect width='100%25' height='100%25' rx='16' ry='16' fill='%230c0f1c' stroke='%235dd4b5' stroke-dasharray='0'/%3E%3Ctext x='50%25' y='52%25' fill='%23e8eaf6' font-size='28' font-family='Arial' text-anchor='middle'%3E%2B%3C/text%3E%3C/svg%3E">`
                : c.arquivo
                    ? `<img alt="${c.nome}" src="assets/personagens/${c.arquivo}" loading="lazy">`
                    : `<img alt="Nenhum" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='120'%3E%3Crect width='100%25' height='100%25' rx='16' ry='16' fill='%230c0f1c' stroke='%23aab1d1' stroke-dasharray='6%2C6'/%3E%3Cpath d='M20 100 L140 20' stroke='%23aab1d1' stroke-width='10'/%3E%3C/svg%3E">`;
            wrap.innerHTML = `${imgTag}<span>${c.nome}</span>`;
            wrap.addEventListener('click', () => {
                document.querySelectorAll('.card-img').forEach(b => {
                    b.classList.remove('active');
                    b.setAttribute('aria-pressed', 'false');
                });
                wrap.classList.add('active');
                wrap.setAttribute('aria-pressed', 'true');
                personagemAtual = c;
                if (c.isUpload) {
                    if (imgUpload) imgUpload.click();
                    return; // não chama render aqui; vai renderizar quando a imagem carregar
                }
                // Se clicou em qualquer outro, limpa upload
                limparUpload();
                aplicarCorDoPersonagem(c);
                if (c.arquivo) carregarImagem(c).then(renderAll); else renderAll();
            });
            galeria.appendChild(wrap);
            if (i === 0) { wrap.classList.add('active'); } // "Nenhum" marcado
        });
    }

    function carregarImagem(c) {
        if (!c.arquivo) return Promise.resolve(null);
        if (imgCache[c.id]) return Promise.resolve(imgCache[c.id]);
        return new Promise((res, rej) => {
            const im = new Image();
            im.onload = () => { imgCache[c.id] = im; res(im); };
            im.onerror = rej;
            im.src = `assets/personagens/${c.arquivo}`;
        });
    }

    function carregarImagemUpload(file) {
        return new Promise((resolve, reject) => {
            const url = URL.createObjectURL(file);
            const im = new Image();
            im.onload = () => {
                resolve({ im, url });
            };
            im.onerror = () => {
                URL.revokeObjectURL(url);
                reject(new Error('Falha ao carregar imagem.'));
            };
            im.src = url;
        });
    }

    function limparUpload() {
        uploadImg = null;
        uploadInfo = null;
        if (imgUpload) imgUpload.value = '';
    }

    function aplicarCorSePermitido(hex) {
        if (!hex) return;
        if (chkFixarCor && chkFixarCor.checked) return;

        let v = String(hex).trim();
        if (/^[0-9A-Fa-f]{6}$/.test(v)) v = '#' + v; // aceita sem #
        if (/^#[0-9A-Fa-f]{6}$/.test(v)) {
            corUnica.value = v;
        }
    }

    function atualizarModoTextos() {
        const ativo = chkTextos.checked;

        wrapNomeG.style.display = ativo ? '' : 'none';

        if (!ativo) {
            // quando desativado, mantém G igual ao P
            nomeG.value = nome.value;
        }

        renderAll();
    }

    chkTextos.addEventListener('change', atualizarModoTextos);

    // se o usuário digitar no nome P e o modo estiver desativado, replica pro nomeG
    nome.addEventListener('input', () => {
        if (!chkTextos.checked) nomeG.value = nome.value;
    });

    function aplicarCorDoPersonagem(c) {
        // se estiver fixado, não mexe
        if (chkFixarCor && chkFixarCor.checked) return;

        // se o personagem tiver cor sugerida, aplica
        if (c && c.cor) {
            corUnica.value = c.cor;
        }
    }

    function renderAll() {
        const color = corUnica.value;
        const nomeTxtP = (nome.value || 'Seu Nome').trim();
        const nomeTxtG = (chkTextos.checked ? (nomeG.value || nomeTxtP) : nomeTxtP).trim();
        const fontFamily = 'Calibri';

        let img = null;
        if (personagemAtual && personagemAtual.isUpload) {
            img = uploadImg;
        } else {
            img = (personagemAtual && personagemAtual.arquivo) ? imgCache[personagemAtual.id] : null;
        }

        PREVIEW.desenhar(canvasP, { color, text: nomeTxtP, image: img, fontFamily, imgMaxW: PREVIEW.SIZE.P.imgMaxW, imgMaxH: PREVIEW.SIZE.P.imgMaxH, pt: PREVIEW.SIZE.P.pt, maxLines: 2 });
        PREVIEW.desenhar(canvasG, { color, text: nomeTxtG, image: img, fontFamily, imgMaxW: PREVIEW.SIZE.G.imgMaxW, imgMaxH: PREVIEW.SIZE.G.imgMaxH, pt: PREVIEW.SIZE.G.pt, maxLines: 3 });
    }

    /* WhatsApp — template com preço, entrada e prazo */
    /* const TEMPLATE = (data) =>
    `📃 *Pedido de etiquetas escolares — lhdigital* %0A%0A` +
    `Olá! Gostaria de fazer um pedido de etiquetas personalizadas:%0A%0A` +
    `• *Cartela:* ${encodeURIComponent(data.cartela)}%0A` +
    `• *Nome na etiqueta:* ${encodeURIComponent(data.nome)}%0A` +
    `• *Tema/Personagem:* ${encodeURIComponent(data.personagem)}%0A` +
    `• *Cor (texto + borda):* ${encodeURIComponent(data.cor)}%0A%0A` +
    `(Prévia gerada no simulador lhdigital — via Site)`;
    */

    // btnWhats.addEventListener('click', ()=>{
    //   const personagem = personagemAtual ? personagemAtual.nome : 'Nenhum';
    //   const text = TEMPLATE({ cartela: cartela.value, nome: nome.value || '—', personagem, cor: corUnica.value });
    //   window.open(`https://wa.me/${WHATSAPP_NUMBER}?type=phone_number&text=${text}`,'_blank');
    // });

    btnWhats.addEventListener('click', async () => {
        const originalText = btnWhats.innerText;
        try {
            btnWhats.innerText = "Gerando arte...";
            btnWhats.disabled = true;

            const tipo = cartela.value.includes("MIX")
                ? "MIX"
                : cartela.value.includes("P")
                    ? "P"
                    : "G";

            // personagem escolhido
            const personagemNome = (personagemAtual && personagemAtual.isUpload)
                ? `Minha imagem (upload)${uploadInfo?.name ? ` — ${uploadInfo.name}` : ''}`
                : (personagemAtual ? personagemAtual.nome : 'Nenhum');

            // URL da imagem (se não for upload)
            let personagemUrl = null;
            if (personagemAtual?.arquivo) {
                personagemUrl = `assets/personagens/${personagemAtual.arquivo}`;
            } else if (personagemAtual?.isUpload && uploadImg) {
                // embed do upload: transforma o arquivo em dataURL
                const file = imgUpload.files && imgUpload.files[0];
                if (file) {
                    personagemUrl = await new Promise((resolve) => {
                        const fr = new FileReader();
                        fr.onload = () => resolve(fr.result);
                        fr.readAsDataURL(file);
                    });
                }
            }

            const nomeP = (nome.value || '—').trim();
            const nomeGtxt = chkTextos.checked ? (nomeG.value || '—').trim() : nomeP;

            // gera SVGs (ARTE + FACA)
            const { arteSvgText, facaSvgText } = await SVG_GEN.gerarSvgsCartela({
                tipoCartela: tipo,
                textoP: nomeP,
                textoG: nomeGtxt,
                corHex: corUnica.value,
                personagemUrl,
                fixarImagem: true,
                fontUrl: 'assets/fonts/calibri-bold.ttf'
            });

            // baixa os 2 arquivos
            const base = `A3_${tipo}_${(nomeP || 'etiquetas').toLowerCase()
                .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-z0-9]+/g, '-')}`;

            await SVG_GEN.downloadSvgAsPdf(arteSvgText, `${base}_ARTE.pdf`);

            // abre Whats com texto (cliente anexa os 2 SVGs)
            const msgLinhas = [
                "🧾 *Pedido de etiquetas escolares — CenterGraf*",
                "",
                "Olá! Segue o arquivo em anexo pronto para impressão:",
                "",
                `• *Cartela:* ${cartela.value}`,
                chkTextos.checked ? `• *Texto P:* ${nomeP}` : `• *Nome na etiqueta:* ${nomeP}`,
                chkTextos.checked ? `• *Texto G:* ${nomeGtxt}` : null,
                `• *Tema/Personagem:* ${personagemNome}`,
                `• *Cor (texto + borda):* ${corUnica.value}`,
                "",
                "📎 Anexar: *_ARTE.pdf*"
            ].filter(Boolean);

            const params = new URLSearchParams();
            params.set("phone", WHATSAPP_NUMBER);
            params.set("text", msgLinhas.join("\n"));

            // iOS Safari bloqueia window.open após await. Usamos location.href para garantir.
            const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
            const url = `https://api.whatsapp.com/send?${params.toString()}`;

            if (isMobile) {
                window.location.href = url;
            } else {
                window.open(url, "_blank");
            }
        } catch (err) {
            console.error(err);
            alert(`Houve um erro ao gerar o pedido: ${err.message || 'Erro desconhecido'}. Por favor, tente novamente.`);
        } finally {
            btnWhats.innerText = originalText;
            btnWhats.disabled = false;
        }
    });

    btnDownload.addEventListener('click', () => {
        const w = Math.max(canvasP.width, canvasG.width);
        const gap = 40;
        const out = document.createElement('canvas');
        out.width = w;
        out.height = canvasP.height + gap + canvasG.height;
        const ctx = out.getContext('2d');
        ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, out.width, out.height);
        ctx.drawImage(canvasP, (w - canvasP.width) / 2, 0);
        ctx.fillStyle = '#e5e7eb'; ctx.fillRect(0, canvasP.height + gap / 2 - 1, w, 2);
        ctx.drawImage(canvasG, (w - canvasG.width) / 2, canvasP.height + gap);
        const a = document.createElement('a');
        a.download = `previa_${(nome.value || 'etiquetas').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-')}.png`;
        a.href = out.toDataURL('image/png');
        a.click();
    });

    btnReset.addEventListener('click', () => {
        limparUpload();
        nome.value = 'João Medeiros da Silva';
        corUnica.value = '#0000FF';
        cartela.value = 'A3 MIX';

        chkTextos.checked = false;
        chkFixarCor.checked = false;

        nomeG.value = nome.value;
        wrapNomeG.style.display = 'none';

        document.querySelector('.card-img[data-id="nenhum"]')?.click();
        renderAll();
    });

    imgUpload.addEventListener('change', async () => {
        const file = imgUpload.files && imgUpload.files[0];
        if (!file) return;

        // limite de tamanho (5MB)
        const MAX_MB = 5;
        if (file.size > MAX_MB * 1024 * 1024) {
            alert(`Arquivo muito grande. Envie até ${MAX_MB} MB.`);
            limparUpload();
            // volta pro "Nenhum"
            document.querySelector('.card-img[data-id="nenhum"]')?.click();
            return;
        }

        try {
            const { im, url } = await carregarImagemUpload(file);

            // guarda info
            uploadImg = im;
            uploadInfo = { name: file.name, size: file.size, type: file.type, w: im.width, h: im.height };

            // dica rápida de qualidade (sem bloquear)
            if (im.width < 400 || im.height < 400) {
                // só avisa; não impede
                console.log('Imagem pequena; pode ficar pixelada.');
            }

            // garante que o "card upload" fique ativo (caso o user tenha cancelado e voltado etc.)
            const btn = document.querySelector(`.card-img[data-id="upload"]`);
            if (btn) {
                document.querySelectorAll('.card-img').forEach(b => {
                    b.classList.remove('active');
                    b.setAttribute('aria-pressed', 'false');
                });
                btn.classList.add('active');
                btn.setAttribute('aria-pressed', 'true');
            }

            // renderiza usando upload
            renderAll();

            // libera URL quando não precisar mais (se quiser manter a imagem viva, pode não revogar aqui)
            // URL.revokeObjectURL(url);
        } catch (e) {
            alert('Não foi possível carregar a imagem. Tente outro arquivo.');
            limparUpload();
            document.querySelector('.card-img[data-id="nenhum"]')?.click();
        }
    });

    /* eventos */
    [nome, nomeG, corUnica, cartela].forEach(i => {
        i.addEventListener('input', renderAll);
        i.addEventListener('change', renderAll);
    });

    /* init */
    montarGaleria();

    if (personaId) {
        const btn = document.querySelector(`.card-img[data-id="${CSS.escape(personaId)}"]`);
        if (btn) btn.click();
    }

    // por último, aplica cor do parâmetro (se veio) e respeita "Fixar cor"
    aplicarCorSePermitido(corParam);

    if (!personaId) renderAll();
});
