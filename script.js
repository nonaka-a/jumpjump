// --- script.js 全コード ---
// --- システム・セーブデータ管理 ---
const SAVE_KEY = 'lineball_savedata_v3';
let saveData = {
    language: 'en',
    gp: 0,
    highScore: 0,
    soundEnabled: true,
    upgrades: {
        jump: 0,
        booster: 0,
        aura: 0,
        pierce: 0,
        sheet: 0,
        yellowGiant: 0,
        multiplier: 0
    }
};

function updateLanguageUI() {
    const lang = saveData.language;
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (I18N[key] && I18N[key][lang]) {
            el.textContent = I18N[key][lang];
        }
    });

    const titleEl = document.getElementById('resultTitle');
    if (maxHeight >= 10000) {
        titleEl.textContent = I18N.goal[lang];
    } else {
        titleEl.textContent = I18N.gameOver[lang];
    }
}

function toggleLanguage() {
    saveData.language = saveData.language === 'en' ? 'ja' : 'en';
    saveGameData();
    updateLanguageUI();
    updateSettingsUI();
    updateShopUI();
    playSound('energy');
}

function loadData() {
    const saved = localStorage.getItem(SAVE_KEY);
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            saveData.language = parsed.language || 'en';
            saveData.gp = parsed.gp || 0;
            saveData.highScore = parsed.highScore || 0;
            saveData.soundEnabled = parsed.soundEnabled !== undefined ? parsed.soundEnabled : true;
            if (parsed.upgrades) {
                for (let key in UPGRADE_DATA) {
                    if (parsed.upgrades[key] !== undefined) {
                        saveData.upgrades[key] = parsed.upgrades[key];
                    }
                }
            }
        } catch (e) { console.error("Load Error", e); }
    }
}
function saveGameData() { localStorage.setItem(SAVE_KEY, JSON.stringify(saveData)); }

// --- UI・画面遷移 ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

function changeState(state) {
    document.getElementById('titleScreen').style.display = 'none';
    document.getElementById('shopScreen').style.display = 'none';
    document.getElementById('settingsScreen').style.display = 'none';
    document.getElementById('resultScreen').style.display = 'none';
    document.getElementById('gameUI').style.display = 'none';
    gameActive = false;

    if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    if (state === 'title') {
        stopBGM();
        document.getElementById('titleScreen').style.display = 'flex';
        document.getElementById('titleHigh').textContent = saveData.highScore;
        document.getElementById('titleGp').textContent = Math.floor(saveData.gp);
        updateSettingsUI();
    } else if (state === 'shop') {
        stopBGM();
        document.getElementById('shopScreen').style.display = 'flex';
        updateShopUI();
    } else if (state === 'settings') {
        stopBGM();
        document.getElementById('settingsScreen').style.display = 'flex';
        updateSettingsUI();
    } else if (state === 'play') {
        playBGM('bgm');
        document.getElementById('gameUI').style.display = 'block';
        initGame();
    } else if (state === 'result') {
        document.getElementById('resultScreen').style.display = 'flex';
        const mult = saveData.upgrades.multiplier === 2 ? 2.0 : (saveData.upgrades.multiplier === 1 ? 1.5 : 1.0);
        const earned = Math.floor(maxHeight * mult);
        saveData.gp += earned;
        if (maxHeight > saveData.highScore) saveData.highScore = maxHeight;
        saveGameData();

        const titleEl = document.getElementById('resultTitle');
        const lang = saveData.language || 'en';
        if (maxHeight >= 10000) {
            titleEl.textContent = I18N.goal[lang];
            titleEl.style.color = "#ffff00";
        } else {
            titleEl.textContent = I18N.gameOver[lang];
            titleEl.style.color = "#00ccff";
        }

        document.getElementById('resultHeight').textContent = maxHeight;
        document.getElementById('resultEarned').textContent = earned;
    }
}

function updateShopUI() {
    document.getElementById('shopGp').textContent = Math.floor(saveData.gp);
    const container = document.getElementById('shopList');
    container.innerHTML = "";
    const lang = saveData.language;
    for (let key in UPGRADE_DATA) {
        const info = UPGRADE_DATA[key];
        const lv = saveData.upgrades[key] || 0;
        const isMax = lv >= info.max;
        const cost = isMax ? 0 : info.costs[lv];

        const name = lang === 'ja' ? (info.nameJa || info.name) : info.name;
        const buyText = lang === 'ja' ? '購入: ' : 'Buy: ';
        const maxText = lang === 'ja' ? '最大' : 'MAX';

        const itemEl = document.createElement('div');
        itemEl.className = 'shop-item';
        itemEl.innerHTML = `
            <div class="shop-info">
                <div class="shop-title">${name} [Lv ${lv}]</div>
                <div class="shop-desc">${info.descs[lv]}</div>
            </div>
            <button class="shop-btn" ${isMax || saveData.gp < cost ? 'disabled' : ''} onclick="buyUpgrade('${key}')">
                ${isMax ? maxText : buyText + cost}
            </button>`;
        container.appendChild(itemEl);
    }
}

function buyUpgrade(key) {
    const lv = saveData.upgrades[key];
    const cost = UPGRADE_DATA[key].costs[lv];
    if (saveData.gp >= cost) {
        saveData.gp -= cost;
        saveData.upgrades[key]++;
        saveGameData();
        playSound('energy');
        updateShopUI();
    }
}

function updateSettingsUI() {
    const langBtn = document.getElementById('langToggleBtn');
    if (langBtn) {
        langBtn.textContent = saveData.language === 'ja' ? '言語設定: 日本語' : 'LANGUAGE: ENGLISH';
    }

    const btn = document.getElementById('soundToggleBtn');
    if (btn) {
        let soundState = saveData.soundEnabled ? 'ON' : 'OFF';
        if (saveData.language === 'ja') soundState = saveData.soundEnabled ? 'オン' : 'オフ';
        btn.textContent = saveData.language === 'ja' ? `サウンド: ${soundState}` : `SOUND: ${soundState}`;
        if (saveData.soundEnabled) {
            btn.classList.remove('btn-gray');
        } else {
            btn.classList.add('btn-gray');
        }
        btn.style.background = ""; // 万が一残っていたインラインスタイルをリセット
    }
}

function toggleSound() {
    saveData.soundEnabled = !saveData.soundEnabled;
    saveGameData();
    updateSettingsUI();
    if (saveData.soundEnabled) {
        playSound('energy');
        if (gameActive) {
            const targetBgm = maxHeight >= 5000 ? 'bgm2' : 'bgm';
            playBGM(targetBgm);
        }
    } else {
        stopBGM();
    }
}

function confirmReset() {
    const msg = saveData.language === 'ja' ? "本当にデータをリセットしますか？\n(ハイスコア、GP、アップグレードがすべて初期化されます)" : "Are you sure you want to reset all data?\n(High score, GP, and upgrades will be initialized)";
    if (window.confirm(msg)) {
        resetData();
    }
}

function resetData() {
    saveData = {
        language: saveData.language,
        gp: 0,
        highScore: 0,
        soundEnabled: saveData.soundEnabled,
        upgrades: {
            jump: 0, booster: 0, aura: 0, pierce: 0, sheet: 0, yellowGiant: 0, multiplier: 0
        }
    };
    saveGameData();
    changeState('title');
}

// --- 画像・音声 ---
const ballImage = new Image(); ballImage.src = 'maimai.png';
const bgImage = new Image(); bgImage.src = 'BG.png';
let ballImageLoaded = false;
let bgImageLoaded = false;
ballImage.onload = () => { ballImageLoaded = true; };
bgImage.onload = () => { bgImageLoaded = true; };

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const soundBuffers = {};
let bgmSource = null;
let bgmGain = null;
let currentBgmName = "";

async function loadSound(name, url) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const arrayBuffer = await response.arrayBuffer();
        soundBuffers[name] = await audioCtx.decodeAudioData(arrayBuffer);
    } catch (e) {
        console.warn(`Sound load failed for ${name}:`, e);
    }
}

const fallbackAudios = {};
function playSound(name, volume = 1.0) {
    if (!saveData.soundEnabled) return;
    
    if (!soundBuffers[name]) {
        if(!fallbackAudios[name]) {
            const urlMap = {
                'jump': 'jump2.mp3', 'energy': 'energy.mp3',
                'dest1': 'block_destruction1.mp3', 'dest2': 'block_destruction2.mp3',
                'flameburst': 'Flames_burst.mp3'
            };
            if(urlMap[name]) fallbackAudios[name] = new Audio(urlMap[name]);
        }
        if(fallbackAudios[name]){
            fallbackAudios[name].volume = volume;
            fallbackAudios[name].currentTime = 0;
            fallbackAudios[name].play().catch(()=>{});
        }
        return;
    }

    try {
        const source = audioCtx.createBufferSource();
        source.buffer = soundBuffers[name];
        const gainNode = audioCtx.createGain();
        gainNode.gain.value = volume;
        source.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        source.start(0);
    } catch (e) { console.warn("playSound error", e); }
}

function playBGM(name) {
    if (!saveData.soundEnabled) return;
    if (!soundBuffers[name]) {
        setTimeout(() => playBGM(name), 500);
        return;
    }
    if (bgmSource && currentBgmName === name) return;

    stopBGM();
    try {
        bgmSource = audioCtx.createBufferSource();
        bgmSource.buffer = soundBuffers[name];
        bgmSource.loop = true;
        bgmGain = audioCtx.createGain();
        bgmGain.gain.value = 0.3;
        bgmSource.connect(bgmGain);
        bgmGain.connect(audioCtx.destination);
        bgmSource.start(0);
        currentBgmName = name;
    } catch (e) { console.warn("playBGM error", e); }
}

function fadeToBGM(nextName, duration = 3.0) {
    if (!saveData.soundEnabled || !soundBuffers[nextName] || currentBgmName === nextName) return;

    const oldSource = bgmSource;
    const oldGain = bgmGain;

    if (oldGain) {
        try { oldGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + duration); } catch(e){}
    }

    try {
        const newSource = audioCtx.createBufferSource();
        newSource.buffer = soundBuffers[nextName];
        newSource.loop = true;
        const newGain = audioCtx.createGain();
        newGain.gain.value = 0;
        newSource.connect(newGain);
        newGain.connect(audioCtx.destination);
        newSource.start(0);
        newGain.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + duration);

        bgmSource = newSource;
        bgmGain = newGain;
        currentBgmName = nextName;
    } catch (e) { console.warn("fadeToBGM error", e); }

    setTimeout(() => {
        if (oldSource) {
            try { oldSource.stop(); } catch (e) { }
        }
    }, duration * 1000 + 500);
}

function stopBGM() {
    if (bgmSource) {
        try { bgmSource.stop(); } catch (e) { }
        bgmSource = null;
    }
    bgmGain = null;
    currentBgmName = "";
}

loadSound('jump', 'jump2.mp3');
loadSound('energy', 'energy.mp3');
loadSound('bgm', 'BGM.mp3');
loadSound('bgm2', 'BGM2.mp3');
loadSound('dest1', 'block_destruction1.mp3');
loadSound('dest2', 'block_destruction2.mp3');
loadSound('flameburst', 'Flames_burst.mp3');

// --- ゲームロジック ---
let PLAY_X = 0;
let PLAY_W = 400;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    PLAY_W = Math.min(canvas.width * 0.90, 520);
    PLAY_X = (canvas.width - PLAY_W) / 2;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class Particle {
    constructor(x, y, color, vx, vy, lifeDecay = 0.03, size = 2) {
        this.x = x; this.y = y; this.vx = vx; this.vy = vy;
        this.life = 1.0; this.decay = lifeDecay; this.color = color; this.size = size;
    }
    update() { this.x += this.vx; this.y += this.vy; this.life -= this.decay; }
    draw(ctx, camY) {
        ctx.globalAlpha = this.life; ctx.fillStyle = this.color;
        ctx.beginPath(); ctx.arc(this.x, this.y - camY, this.size, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1.0;
    }
}

let ball, lines, boosters, items, blocks, particles, speedLines, lasers, ghosts, ghostTimer;
let isDrawing, startPoint, currentPoint, maxHeight, gameActive, cameraY;
let boostEffectTimer, powerModeTimer, nextGateAlt, nextBlockY, nextSingleBoosterY, currentSheetCount;
let fadeToWhite = 0;
let yellowItems = [];
let yellowGiantMode = false;
let yellowGiantJumpDist = 0;
let yellowGiantJumping = false;
let yellowGiantRemainingY = 0;
let ygScale = 1.0;

const config = {
    ballRadius: 26, gravity: 0.22, maxSpeed: 20, baseBounce: 9, powerMultiplier: 280,
    cameraLerp: 0.1, rotationDamping: 0.95, moveRotationFactor: 0.002, bounceRotationFactor: 0.03,
    stretchFactor: 0.006, bounceThreshold: 5, boostPower: -22, parallaxSpeed: 0.005, speedLineThreshold: 28,
    particleThreshold: 8
};

function initGame() {
    ball = {
        x: canvas.width / 2,
        y: canvas.height * 0.6,
        vx: (Math.random() - 0.5) * 4,
        vy: 2,
        angle: 0,
        va: 0,
        firstFall: true
    };
    lines = []; boosters = []; items = []; blocks = []; particles = []; speedLines = []; lasers = []; ghosts = []; yellowItems = [];
    isDrawing = false; startPoint = null; currentPoint = null;
    maxHeight = 0; cameraY = 0; boostEffectTimer = 0; powerModeTimer = 0; ghostTimer = 0; fadeToWhite = 0;
    nextGateAlt = 500; nextBlockY = -800; nextSingleBoosterY = -300;
    currentSheetCount = saveData.upgrades.sheet || 0;
    yellowGiantMode = false; yellowGiantJumpDist = 0; yellowGiantJumping = false; yellowGiantRemainingY = 0;
    ygScale = 1.0;
    
    document.getElementById('heightScore').textContent = "0";
    document.getElementById('powerUI').classList.remove('active');
    document.getElementById('yellowGiantUI').classList.remove('active');

    gameActive = true;
    requestAnimationFrame(gameLoop);
}

function spawnBooster(yTarget, isGate = false) {
    if (isGate) {
        const num = 5; const gateWidth = 60; const spacing = PLAY_W / (num + 1);
        for (let i = 1; i <= num; i++) { boosters.push({ x: PLAY_X + i * spacing - (gateWidth / 2), y: yTarget, w: gateWidth, h: 50, active: true, isGate: true }); }
    } else {
        boosters.push({ x: PLAY_X + Math.random() * (PLAY_W - 100) + 10, y: yTarget, w: 80, h: 60, active: true, isGate: false });
    }
}
function spawnItem(yTarget) { items.push({ x: PLAY_X + Math.random() * (PLAY_W - 100) + 50, y: yTarget, radius: 35, active: true }); }
function spawnYellowItem(yTarget) { yellowItems.push({ x: PLAY_X + Math.random() * (PLAY_W - 100) + 50, y: yTarget, radius: 30, active: true }); }
function spawnBlocks(yTarget, currentAlt) {
    const maxDensity = Math.min(5, Math.floor(currentAlt / 500) + 1);
    const count = Math.floor(Math.random() * maxDensity) + 1;
    for (let i = 0; i < count; i++) {
        let attempts = 0;
        let x, y, w, h;
        while (attempts < 15) {
            x = PLAY_X + Math.random() * (PLAY_W - 90);
            y = yTarget + (Math.random() * 150 - 75);
            w = 70 + Math.random() * 20;
            h = 30;
            let overlap = false;
            for (let b of blocks) {
                if (x < b.x + b.w + 10 && x + w + 10 > b.x && y < b.y + b.h + 10 && y + h + 10 > b.y) { overlap = true; break; }
            }
            if (!overlap) break;
            attempts++;
        }
        let bType = 'purple'; let bHp = 1;
        if (currentAlt >= 8000 && Math.random() < 0.4) { bType = 'white'; bHp = 4; }
        else if (currentAlt >= 6000 && Math.random() < 0.4) { bType = 'yellow'; bHp = 3; }
        else if (currentAlt >= 3000 && Math.random() < 0.4) { bType = 'red'; bHp = 2; }
        blocks.push({ x, y, w, h, active: true, type: bType, hp: bHp });
    }
}

function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY + cameraY };
}

canvas.addEventListener('mousedown', (e) => { if (gameActive) { isDrawing = true; startPoint = getPos(e); } });
window.addEventListener('mousemove', (e) => { if (isDrawing) { if (e.cancelable) e.preventDefault(); currentPoint = getPos(e); } });
window.addEventListener('mouseup', () => {
    if (isDrawing && startPoint && currentPoint) {
        const dx = currentPoint.x - startPoint.x, dy = currentPoint.y - startPoint.y, len = Math.sqrt(dx * dx + dy * dy);
        if (len > 5) lines.push({ x1: startPoint.x, y1: startPoint.y, x2: currentPoint.x, y2: currentPoint.y, length: len });
    }
    isDrawing = false; startPoint = null; currentPoint = null;
});
canvas.addEventListener('touchstart', (e) => { if (gameActive) { isDrawing = true; startPoint = getPos(e); } }, { passive: false });
window.addEventListener('touchmove', (e) => { if (isDrawing) { if (e.cancelable) e.preventDefault(); currentPoint = getPos(e); } }, { passive: false });
window.addEventListener('touchend', () => {
    if (isDrawing && startPoint && currentPoint) {
        const dx = currentPoint.x - startPoint.x, dy = currentPoint.y - startPoint.y, len = Math.sqrt(dx * dx + dy * dy);
        if (len > 5) lines.push({ x1: startPoint.x, y1: startPoint.y, x2: currentPoint.x, y2: currentPoint.y, length: len });
    }
    isDrawing = false; startPoint = null; currentPoint = null;
});

function update() {
    if (!gameActive) return;

    if (yellowGiantJumping) {
        const jumpSpeed = 32;
        ball.vy = -jumpSpeed;
        ball.vx *= 0.92;
        ball.y += ball.vy;
        ball.x += ball.vx;
        ball.angle += 0.15;
        yellowGiantRemainingY -= jumpSpeed;

        const ygLv = saveData.upgrades.yellowGiant;
        const targetScale = ygLv === 3 ? 11 : (ygLv === 2 ? 7 : 3.5);
        if (ygScale < targetScale) ygScale += (targetScale - ygScale) * 0.1;

        for (let i = 0; i < 6; i++) {
            particles.push(new Particle(
                ball.x + (Math.random() - 0.5) * 50 * ygScale, ball.y + Math.random() * 30 * ygScale,
                Math.random() > 0.4 ? '#ffff00' : '#ffcc00',
                (Math.random() - 0.5) * 6, jumpSpeed * 0.4 + Math.random() * 6, 0.04, 4 * ygScale
            ));
        }
        if (Math.random() > 0.2) speedLines.push({ x: PLAY_X + Math.random() * PLAY_W, y: -50, h: 100 + Math.random() * 150, v: 35 + Math.random() * 20 });

        const tY = ball.y - canvas.height * 0.45;
        if (tY < cameraY) cameraY += (tY - cameraY) * 0.5;

        const cAlt = Math.floor(Math.max(0, (canvas.height - 100 - ball.y) / 20));
        if (cAlt > maxHeight && maxHeight < 10000) {
            maxHeight = Math.min(cAlt, 10000);
            document.getElementById('heightScore').textContent = maxHeight;
            if (maxHeight >= 5000 && currentBgmName === 'bgm') fadeToBGM('bgm2', 3.0);
        }

        if (maxHeight >= 10000) {
            fadeToWhite += 0.005;
            if (fadeToWhite >= 1.5) { changeState('result'); fadeToWhite = 0; }
        }

        if (yellowGiantRemainingY <= 0) {
            yellowGiantJumping = false;
            yellowGiantMode = false;
            yellowGiantJumpDist = 0;
            ygScale = 1.0;
            ball.vy = -config.maxSpeed;
            ball.firstFall = false;
            document.getElementById('yellowGiantUI').classList.remove('active');
        }

        for (let i = particles.length - 1; i >= 0; i--) { particles[i].update(); if (particles[i].life <= 0) particles.splice(i, 1); }
        speedLines.forEach((sl, idx) => { sl.y += sl.v; });
        speedLines = speedLines.filter(sl => sl.y <= canvas.height);

        if (ball.y > cameraY + canvas.height + 50 && fadeToWhite === 0) changeState('result');
        return; 
    }

    const grav = ball.firstFall ? config.gravity * 0.4 : config.gravity;
    ball.vy += grav; ball.x += ball.vx; ball.y += ball.vy;
    if (ball.vy < 0) ball.firstFall = false;
    ball.angle += ball.va; ball.va *= config.rotationDamping; ball.va += ball.vx * config.moveRotationFactor;
    
    if (ball.x - config.ballRadius < PLAY_X || ball.x + config.ballRadius > PLAY_X + PLAY_W) {
        ball.vx *= -0.7; ball.va += ball.vy * 0.01;
        ball.x = ball.x < PLAY_X + config.ballRadius ? PLAY_X + config.ballRadius : PLAY_X + PLAY_W - config.ballRadius;
    }

    const targetY = ball.y - canvas.height * 0.5;
    if (targetY < cameraY) cameraY += (targetY - cameraY) * config.cameraLerp;

    const currentAlt = Math.floor(Math.max(0, (canvas.height - 100 - ball.y) / 20));
    const spawnY = cameraY - 400;
    const spawnActive = currentAlt < 9800;

    if (currentAlt >= nextGateAlt && spawnActive) { spawnBooster(ball.y - 450, true); nextGateAlt = (nextGateAlt === 500) ? 1000 : nextGateAlt + 1000; }
    
    const bLv = saveData.upgrades.booster;
    if (bLv > 0 && cameraY < nextSingleBoosterY && spawnActive) {
        const prob = (bLv === 2) ? 0.9 : 0.6;
        if (Math.random() < prob) spawnBooster(nextSingleBoosterY - 200, false);
        nextSingleBoosterY -= (bLv === 2 ? 600 : 1000);
    }

    const aLv = saveData.upgrades.aura;
    if (aLv > 0 && spawnActive) {
        const appearAlt = (aLv >= 2) ? 500 : 1000;
        const prob = (aLv >= 2) ? 0.005 : 0.0015;
        if (currentAlt >= appearAlt && Math.random() < prob) spawnItem(spawnY);
    }

    const ygLv = saveData.upgrades.yellowGiant;
    if (ygLv > 0 && spawnActive && !yellowGiantMode) {
        if (Math.random() < 0.0003) spawnYellowItem(spawnY);
    }

    if (cameraY < nextBlockY && spawnActive) {
        spawnBlocks(nextBlockY - 200, currentAlt);
        let interval = 800 - Math.floor(currentAlt / 1000) * 150;
        if (interval < 250) interval = 250;
        nextBlockY -= interval;
    }

    const powerUI = document.getElementById('powerUI');
    if (powerModeTimer > 0) {
        powerModeTimer -= 1 / 60; 
        powerUI.classList.add('active'); 
        document.getElementById('timer').textContent = Math.ceil(powerModeTimer);
        for (let i = 0; i < 3; i++) particles.push(new Particle(ball.x + (Math.random() - 0.5) * 40, ball.y + (Math.random() - 0.5) * 40, Math.random() > 0.4 ? '#ff0000' : '#ffaa00', (Math.random() - 0.5) * 3, -Math.random() * 8, 0.05, 4));
        if (powerModeTimer <= 0) powerUI.classList.remove('active');
    } else {
        powerUI.classList.remove('active');
    }

    const giantUI = document.getElementById('yellowGiantUI');
    if (yellowGiantMode && !yellowGiantJumping) {
        giantUI.classList.add('active');
    } else {
        giantUI.classList.remove('active');
    }

    if (ball.vy < -config.speedLineThreshold && Math.random() > 0.3) {
        speedLines.push({ x: PLAY_X + Math.random() * PLAY_W, y: -50, h: 60 + Math.random() * 100, v: 20 + Math.random() * 15 });
    }
    speedLines.forEach((sl, i) => { sl.y += sl.v; if (sl.y > canvas.height) speedLines.splice(i, 1); });

    boosters.forEach(b => {
        if (b.active && ball.x > b.x && ball.x < b.x + b.w && ball.y > b.y && ball.y < b.y + b.h) {
            const bLv = saveData.upgrades.booster;
            const power = bLv === 3 ? config.boostPower - 6 : config.boostPower;
            ball.vy = power; boostEffectTimer = 25;
            for (let i = 0; i < (bLv === 3 ? 60 : 25); i++) {
                let color = '#00ffff';
                if (bLv === 3) {
                    const colors = ['#00ffff', '#ff00ff', '#ffff00', '#ffffff', '#00ff00'];
                    color = colors[Math.floor(Math.random() * colors.length)];
                }
                particles.push(new Particle(ball.x, ball.y, color, (Math.random() - 0.5) * 20, (Math.random() - 0.5) * 20));
            }
            playSound('energy'); b.active = false;
            if (bLv === 3) lasers.push({ x: b.x + b.w / 2, y: b.y + b.h / 2, life: 1.0, width: b.w * 1.5 });
        }
    });

    items.forEach(it => { if (it.active && Math.sqrt((ball.x - it.x) ** 2 + (ball.y - it.y) ** 2) < (config.ballRadius + it.radius)) { const aLv = saveData.upgrades.aura; powerModeTimer = (aLv === 3) ? 15 : (aLv === 2 ? 10 : 5); it.active = false; playSound('energy'); for (let i = 0; i < 60; i++) particles.push(new Particle(it.x, it.y, '#ff0000', (Math.random() - 0.5) * 30, (Math.random() - 0.5) * 30, 0.02, 5)); } });

    yellowItems.forEach(it => {
        if (it.active && Math.sqrt((ball.x - it.x) ** 2 + (ball.y - it.y) ** 2) < (config.ballRadius + it.radius)) {
            it.active = false; yellowGiantMode = true; 
            const ygLv = saveData.upgrades.yellowGiant;
            yellowGiantJumpDist = ygLv === 3 ? 1000 : (ygLv === 2 ? 600 : 300);
            playSound('energy');
            for (let i = 0; i < 80; i++) particles.push(new Particle(it.x, it.y, Math.random() > 0.4 ? '#ffff00' : '#ffcc00', (Math.random() - 0.5) * 35, (Math.random() - 0.5) * 35, 0.02, 6));
        }
    });
    yellowItems = yellowItems.filter(it => it.y < cameraY + canvas.height + 100);

   const sheetY = canvas.height - 70; // シートの高さを設定
    if (currentSheetCount > 0 && ball.y > cameraY + sheetY - 10) {
        ball.vy = -18; 
        ball.y = cameraY + sheetY - 15; 
        currentSheetCount--; 
        playSound('energy');
        ball.firstFall = false;
        for (let i = 0; i < 30; i++) particles.push(new Particle(ball.x, ball.y, '#00ccff', (Math.random() - 0.5) * 15, (Math.random() - 0.5) * 15, 0.04, 4));
    }

    const pLv = saveData.upgrades.pierce;
    blocks.forEach(bk => {
        if (bk.active) {
            const cx = Math.max(bk.x, Math.min(ball.x, bk.x + bk.w)), cy = Math.max(bk.y, Math.min(ball.y, bk.y + bk.h)), dist = Math.sqrt((ball.x - cx) ** 2 + (ball.y - cy) ** 2);
            if (dist < config.ballRadius * (yellowGiantJumping ? ygScale : 1.0)) {
                const isPower = powerModeTimer > 0;
                let destroyed = false;
                let bounce = false;
                let slow = false;

                const levels = { purple: 0, red: 1, yellow: 2, white: 3 };
                const bkLv = levels[bk.type] || 0;

                if (isPower || pLv >= (bkLv + 2) || yellowGiantJumping) {
                    destroyed = true; 
                } else if (pLv === (bkLv + 1)) {
                    destroyed = true;
                    slow = true; 
                } else {
                    bk.hp--;
                    if (pLv > 0 && bk.hp > 0) {
                        if (bk.type === 'red' && pLv >= 1) bk.hp = 0;
                        if (bk.type === 'yellow' && pLv >= 2) bk.hp = 0;
                        if (bk.type === 'white' && pLv >= 3) bk.hp = 0;
                    }
                    if (bk.hp <= 0) destroyed = true;
                    bounce = true; 
                }

                if (destroyed) {
                    bk.active = false;
                    playSound(Math.random() < 0.5 ? 'dest1' : 'dest2', 0.4);
                    for (let i = 0; i < 40; i++) {
                        let c = '#8e38cc';
                        if (bk.type === 'red') c = '#ff1744';
                        if (bk.type === 'yellow') c = '#ffff00';
                        if (bk.type === 'white') c = '#ffffff';
                        particles.push(new Particle(cx, cy, c, (Math.random() - 0.5) * 12, (Math.random() - 0.5) * 12, 0.03, Math.random() * 4 + 2));
                    }
                    if (pLv >= 6 && !yellowGiantJumping) {
                        ball.vy = Math.min(ball.vy, -8) - 2.5; 
                        if (ball.vy < -22) ball.vy = -22;     
                        for (let i = 0; i < 8; i++) {
                            particles.push(new Particle(ball.x, ball.y, '#ffffff', (Math.random() - 0.5) * 4, 3, 0.1, 2));
                        }
                        ghostTimer = 35;
                    }
                }
                if (bounce) {
                    ball.vy = Math.abs(ball.vy) * 0.5 + 2; ball.vx *= 0.5; ball.y -= 10;
                    ball.firstFall = false;
                    playSound('jump');
                } else if (slow) {
                    ball.vy *= 0.7; playSound('jump');
                }
            }
        }
    });

    if (boostEffectTimer > 0) boostEffectTimer--;
    
    const jLv = saveData.upgrades.jump;
    if (ball.vy < -5) {
        if (jLv >= 1) particles.push(new Particle(ball.x, ball.y, '#00ccff', (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2, 0.08, 2));
        if (jLv >= 2) particles.push(new Particle(ball.x, ball.y, '#ff3366', (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2, 0.08, 2));
        if (jLv >= 3) particles.push(new Particle(ball.x, ball.y, '#ffff00', (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2, 0.08, 2));
    }

    if (Math.sqrt(ball.vx ** 2 + ball.vy ** 2) > config.particleThreshold) particles.push(new Particle(ball.x, ball.y, (powerModeTimer > 0 || yellowGiantMode) ? (yellowGiantMode ? '#ffff00' : '#ff3300') : '#00ccff', (Math.random() - 0.5) * 3, (Math.random() - 0.5) * 3));
    for (let i = particles.length - 1; i >= 0; i--) { particles[i].update(); if (particles[i].life <= 0) particles.splice(i, 1); }

    if (currentAlt > maxHeight && maxHeight < 10000) { 
        maxHeight = Math.min(currentAlt, 10000); document.getElementById('heightScore').textContent = maxHeight; 
        if (maxHeight >= 5000 && currentBgmName === 'bgm') fadeToBGM('bgm2', 3.0);
        if (maxHeight >= 10000) playSound('energy');
    }

    if (maxHeight >= 10000) {
        fadeToWhite += 0.005; ball.vy -= 0.6; 
        if (fadeToWhite >= 1.5) { changeState('result'); fadeToWhite = 0; }
    }

    if (ball.y > cameraY + canvas.height + 50 && fadeToWhite === 0) changeState('result');

    for (let i = lines.length - 1; i >= 0; i--) {
        if (checkCollision(ball, lines[i])) {
            if (yellowGiantMode && !yellowGiantJumping) {
                lines.splice(i, 1);
                yellowGiantJumping = true;
                yellowGiantRemainingY = yellowGiantJumpDist * 20; 
                ball.firstFall = false;
                playSound('flameburst');
                for (let j = 0; j < 60; j++) {
                    particles.push(new Particle(ball.x, ball.y, Math.random() > 0.5 ? '#ffff00' : '#ffffff', (Math.random() - 0.5) * 30, (Math.random() - 0.5) * 30, 0.025, 6));
                }
            } else {
                reflectBall(ball, lines[i]); 
                lines.splice(i, 1);
                playSound(powerModeTimer > 0 ? 'flameburst' : 'jump');
                if (powerModeTimer > 0) for (let j = 0; j < 25; j++) particles.push(new Particle(ball.x, ball.y, '#ff0000', (Math.random() - 0.5) * 15, (Math.random() - 0.5) * 15, 0.04, 3));
            }
        } else if (lines[i].y1 > cameraY + canvas.height + 100) lines.splice(i, 1);
    }
    
    boosters = boosters.filter(b => b.y < cameraY + canvas.height + 100);
    items = items.filter(it => it.y < cameraY + canvas.height + 100);
    blocks = blocks.filter(bk => bk.y < cameraY + canvas.height + 100 && bk.active);

    for (let i = lasers.length - 1; i >= 0; i--) { lasers[i].life -= 0.025; if (lasers[i].life <= 0) lasers.splice(i, 1); }
    if (ghostTimer > 0) { ghostTimer--; if (ghostTimer % 3 === 0) ghosts.push({ x: ball.x, y: ball.y, life: 0.5, angle: ball.angle, spd: Math.sqrt(ball.vx ** 2 + ball.vy ** 2), vx: ball.vx, vy: ball.vy }); }
    for (let i = ghosts.length - 1; i >= 0; i--) { ghosts[i].life -= 0.02; if (ghosts[i].life <= 0) ghosts.splice(i, 1); }
}

function checkCollision(ball, line) {
    const dx = line.x2 - line.x1, dy = line.y2 - line.y1, l2 = dx * dx + dy * dy;
    let t = Math.max(0, Math.min(1, ((ball.x - line.x1) * dx + (ball.y - line.y1) * dy) / l2));
    const currentRadius = config.ballRadius * (yellowGiantJumping ? ygScale : 1.0);
    return Math.sqrt(Math.pow(ball.x - (line.x1 + t * dx), 2) + Math.pow(ball.y - (line.y1 + t * dy), 2)) < currentRadius;
}

function reflectBall(ball, line) {
    const dx = line.x2 - line.x1, dy = line.y2 - line.y1;
    let nx = -dy, ny = dx; const mag = Math.sqrt(nx * nx + ny * ny); nx /= mag; ny /= mag;
    if (ny > 0) { nx *= -1; ny *= -1; }
    const dot = ball.vx * nx + ball.vy * ny;
    const jLv = saveData.upgrades.jump;
    const jumpBonus = (jLv === 3) ? 1.8 : (jLv === 2 ? 1.5 : (jLv === 1 ? 1.2 : 1.0));
    let mul = config.powerMultiplier * (powerModeTimer > 0 ? 3.0 : jumpBonus);
    const pwr = Math.min(config.baseBounce + (mul / (Math.sqrt(dx*dx+dy*dy) * 0.1)), config.maxSpeed * (powerModeTimer > 0 ? 2.2 : 1.0));
    ball.vx = (ball.vx - 2 * dot * nx) * 0.8; ball.vy = (ball.vy - 2 * dot * ny);
    const v = Math.sqrt(ball.vx**2 + ball.vy**2); ball.vx = (ball.vx / v) * pwr; ball.vy = (ball.vy / v) * pwr;
    ball.va = (ball.vx * Math.cos(Math.atan2(dy, dx))) * config.bounceRotationFactor; ball.y -= 10;
    ball.firstFall = false;
}

function drawBackground() {
    if (!bgImageLoaded) {
        ctx.fillStyle = "#050505";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "rgba(0, 204, 255, 0.1)";
        ctx.fillRect(PLAY_X, 0, PLAY_W, canvas.height);
        return;
    }

    const imgRatio = bgImage.width / bgImage.height;
    const canvasRatio = canvas.width / canvas.height;
    let drawW, drawH;

    if (canvasRatio > imgRatio) {
        drawW = canvas.width;
        drawH = canvas.width / imgRatio;
    } else {
        drawH = canvas.height;
        drawW = canvas.height * imgRatio;
    }

    const progress = Math.min(1.0, maxHeight / 10000);
    const startX = (canvas.width - drawW) / 2;
    const startY = (canvas.height - drawH) + progress * (drawH - canvas.height);

    // 1. 全体背景
    ctx.drawImage(bgImage, startX, startY, drawW, drawH);

    // 2. プレイエリアの強調 (ズーム効果)
    ctx.save();
    ctx.beginPath();
    ctx.rect(PLAY_X, 0, PLAY_W, canvas.height);
    ctx.clip(); 

    // ズームの基準点をプレイエリアの中央に変更
    const zoom = 1.35;
    const centerX = PLAY_X + PLAY_W / 2;
    const centerY = canvas.height / 2;

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.scale(zoom, zoom);
    ctx.translate(-centerX, -centerY);
    ctx.drawImage(bgImage, startX, startY, drawW, drawH);
    ctx.restore();

    ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
    ctx.fillRect(PLAY_X, 0, PLAY_W, canvas.height);
    ctx.restore();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawBackground();
    
    if (currentSheetCount > 0) {
        const drawSheetY = canvas.height - 70; // 判定位置と同じ高さに設定
        ctx.strokeStyle = '#00ccff'; 
        ctx.lineWidth = 20; 
        ctx.globalAlpha = 0.5 + Math.sin(Date.now() / 100) * 0.2;
        ctx.beginPath(); 
        ctx.moveTo(PLAY_X, drawSheetY); 
        ctx.lineTo(PLAY_X + PLAY_W, drawSheetY); 
        ctx.stroke(); 
        ctx.globalAlpha = 1.0;
    }
    
    ctx.strokeStyle = yellowGiantJumping ? 'rgba(255, 220, 0, 0.8)' : (powerModeTimer > 0 ? 'rgba(255, 30, 0, 0.7)' : 'rgba(0, 204, 255, 0.4)'); ctx.lineWidth = yellowGiantJumping ? 4 : 3;
    speedLines.forEach(sl => { ctx.beginPath(); ctx.moveTo(sl.x, sl.y); ctx.lineTo(sl.x, sl.y + sl.h); ctx.stroke(); });
    
    ctx.strokeStyle = 'rgba(0, 204, 255, 0.1)'; ctx.lineWidth = 1;
    const gStep = 50; const sGrid = Math.floor(cameraY / gStep) * gStep;
    for (let gy = sGrid; gy < sGrid + canvas.height + gStep; gy += gStep) { ctx.beginPath(); ctx.moveTo(PLAY_X, gy - cameraY); ctx.lineTo(PLAY_X + PLAY_W, gy - cameraY); ctx.stroke(); }
    
    particles.forEach(p => p.draw(ctx, cameraY));

    ctx.save();
    ctx.translate(0, -cameraY);
    ghosts.forEach(g => {
        ctx.save();
        ctx.translate(g.x, g.y);
        ctx.globalAlpha = g.life * 0.4;
        ctx.fillStyle = '#ff3366';
        const str = 1 + g.spd * config.stretchFactor;
        ctx.rotate(Math.atan2(g.vy, g.vx));
        ctx.scale(str, 1 / str);
        ctx.rotate(-Math.atan2(g.vy, g.vx));
        ctx.rotate(g.angle);
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#ff3366';
        ctx.beginPath();
        ctx.arc(0, 0, config.ballRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    });
    ctx.restore();

    lasers.forEach(l => {
        const alpha = l.life;
        const w = l.width * Math.pow(l.life, 0.5);
        ctx.save();
        ctx.shadowBlur = 30;
        ctx.shadowColor = 'rgba(0, 255, 255, 1)';
        const gradient = ctx.createLinearGradient(l.x - w / 2, 0, l.x + w / 2, 0);
        gradient.addColorStop(0, 'rgba(0, 255, 255, 0)');
        gradient.addColorStop(0.2, `rgba(0, 255, 255, ${alpha * 0.4})`);
        gradient.addColorStop(0.5, `rgba(255, 255, 255, ${alpha * 0.9})`);
        gradient.addColorStop(0.8, `rgba(0, 255, 255, ${alpha * 0.4})`);
        gradient.addColorStop(1, 'rgba(0, 255, 255, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(l.x - w / 2, 0, w, canvas.height);
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#ffffff';
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.fillRect(l.x - Math.max(1, w * 0.1), 0, Math.max(2, w * 0.2), canvas.height);
        ctx.restore();
    });

    ctx.save(); ctx.translate(0, -cameraY);
    
    blocks.forEach(bk => {
        if (!bk.active) return;
        const bx = bk.x, by = bk.y, bw = bk.w, bh = bk.h, bevel = 5;
        if (bk.type === 'red') {
            ctx.fillStyle = '#b71c1c'; ctx.fillRect(bx, by, bw, bh);
            ctx.fillStyle = '#ff5252'; ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx + bw, by); ctx.lineTo(bx + bw - bevel, by + bevel); ctx.lineTo(bx + bevel, by + bevel); ctx.fill();
            ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx + bevel, by + bevel); ctx.lineTo(bx + bevel, by + bh - bevel); ctx.lineTo(bx, by + bh); ctx.fill();
            ctx.fillStyle = '#7f0000'; ctx.beginPath(); ctx.moveTo(bx, by + bh); ctx.lineTo(bx + bw, by + bh); ctx.lineTo(bx + bw - bevel, by + bh - bevel); ctx.lineTo(bx + bevel, by + bh - bevel); ctx.fill();
            ctx.beginPath(); ctx.moveTo(bx + bw, by); ctx.lineTo(bx + bw, by + bh); ctx.lineTo(bx + bw - bevel, by + bh - bevel); ctx.lineTo(bx + bw - bevel, by + bevel); ctx.fill();
        } else if (bk.type === 'yellow') {
            ctx.fillStyle = '#f57f17'; ctx.fillRect(bx, by, bw, bh);
            ctx.fillStyle = '#ffff00'; ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx + bw, by); ctx.lineTo(bx + bw - bevel, by + bevel); ctx.lineTo(bx + bevel, by + bevel); ctx.fill();
            ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx + bevel, by + bevel); ctx.lineTo(bx + bevel, by + bh - bevel); ctx.lineTo(bx, by + bh); ctx.fill();
            ctx.fillStyle = '#bc5100'; ctx.beginPath(); ctx.moveTo(bx, by + bh); ctx.lineTo(bx + bw, by + bh); ctx.lineTo(bx + bw - bevel, by + bh - bevel); ctx.lineTo(bx + bevel, by + bh - bevel); ctx.fill();
            ctx.beginPath(); ctx.moveTo(bx + bw, by); ctx.lineTo(bx + bw, by + bh); ctx.lineTo(bx + bw - bevel, by + bh - bevel); ctx.lineTo(bx + bw - bevel, by + bevel); ctx.fill();
        } else if (bk.type === 'white') {
            ctx.fillStyle = '#9e9e9e'; ctx.fillRect(bx, by, bw, bh);
            ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx + bw, by); ctx.lineTo(bx + bw - bevel, by + bevel); ctx.lineTo(bx + bevel, by + bevel); ctx.fill();
            ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx + bevel, by + bevel); ctx.lineTo(bx + bevel, by + bh - bevel); ctx.lineTo(bx, by + bh); ctx.fill();
            ctx.fillStyle = '#707070'; ctx.beginPath(); ctx.moveTo(bx, by + bh); ctx.lineTo(bx + bw, by + bh); ctx.lineTo(bx + bw - bevel, by + bh - bevel); ctx.lineTo(bx + bevel, by + bh - bevel); ctx.fill();
            ctx.beginPath(); ctx.moveTo(bx + bw, by); ctx.lineTo(bx + bw, by + bh); ctx.lineTo(bx + bw - bevel, by + bh - bevel); ctx.lineTo(bx + bw - bevel, by + bevel); ctx.fill();
        } else {
            ctx.fillStyle = '#4a148c'; ctx.fillRect(bx, by, bw, bh);
            ctx.fillStyle = '#7c43bd'; ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx + bw, by); ctx.lineTo(bx + bw - bevel, by + bevel); ctx.lineTo(bx + bevel, by + bevel); ctx.fill();
            ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx + bevel, by + bevel); ctx.lineTo(bx + bevel, by + bh - bevel); ctx.lineTo(bx, by + bh); ctx.fill();
            ctx.fillStyle = '#12005e'; ctx.beginPath(); ctx.moveTo(bx, by + bh); ctx.lineTo(bx + bw, by + bh); ctx.lineTo(bx + bw - bevel, by + bh - bevel); ctx.lineTo(bx + bevel, by + bh - bevel); ctx.fill();
            ctx.beginPath(); ctx.moveTo(bx + bw, by); ctx.lineTo(bx + bw, by + bh); ctx.lineTo(bx + bw - bevel, by + bh - bevel); ctx.lineTo(bx + bw - bevel, by + bevel); ctx.fill();
        }
    });

    items.forEach(it => { if (!it.active) return; ctx.fillStyle = '#ff3300'; ctx.shadowBlur = 40; ctx.shadowColor = '#ff0000'; const p = Math.sin(Date.now() / 120) * 10; ctx.beginPath(); ctx.arc(it.x, it.y, it.radius + p, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(it.x, it.y, (it.radius + p) * 0.5, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0; });
    
    yellowItems.forEach(it => {
        if (!it.active) return;
        const p = Math.sin(Date.now() / 90) * 10; const r = it.radius + p;
        ctx.shadowBlur = 60; ctx.shadowColor = '#ffee00'; ctx.fillStyle = '#ffdd00'; ctx.beginPath(); ctx.arc(it.x, it.y, r, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0; ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(it.x, it.y, r * 0.42, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = 'rgba(255, 240, 0, 0.7)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(it.x, it.y, r + 14, 0, Math.PI * 2); ctx.stroke();
        ctx.strokeStyle = 'rgba(255, 200, 0, 0.35)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(it.x, it.y, r + 24, 0, Math.PI * 2); ctx.stroke();
        ctx.shadowBlur = 0;
    });

    boosters.forEach(b => {
        if (!b.active) return;
        ctx.strokeStyle = b.isGate ? '#ffffff' : '#00ffff'; ctx.lineWidth = 6; ctx.shadowBlur = 15; ctx.shadowColor = ctx.strokeStyle;
        for (let i = 0; i < 3; i++) { const yo = (i * 20); ctx.beginPath(); ctx.moveTo(b.x, b.y + b.h - yo); ctx.lineTo(b.x + b.w / 2, b.y + b.h - 25 - yo); ctx.lineTo(b.x + b.w, b.y + b.h - yo); ctx.stroke(); }
        ctx.shadowBlur = 0;
    });

    lines.forEach(line => { 
        if (powerModeTimer > 0) {
            ctx.strokeStyle = '#ff0000'; 
        } else {
            const dx = line.x2 - line.x1;
            const dy = line.y2 - line.y1;
            const len = Math.sqrt(dx*dx + dy*dy);
            const hue = Math.max(0, 180 - len * 0.5);
            ctx.strokeStyle = `hsl(${hue}, 100%, 60%)`; 
        }
        ctx.lineWidth = 6; 
        ctx.lineCap = 'round'; 
        ctx.shadowBlur = 10;
        ctx.shadowColor = ctx.strokeStyle;
        ctx.beginPath(); 
        ctx.moveTo(line.x1, line.y1); 
        ctx.lineTo(line.x2, line.y2); 
        ctx.stroke(); 
        ctx.shadowBlur = 0; 
    });

    if (isDrawing && startPoint && currentPoint) { ctx.strokeStyle = '#ffffff'; ctx.setLineDash([5, 5]); ctx.beginPath(); ctx.moveTo(startPoint.x, startPoint.y); ctx.lineTo(currentPoint.x, currentPoint.y); ctx.stroke(); ctx.setLineDash([]); }

    // ボール本体
    ctx.save(); ctx.translate(ball.x, ball.y);
    
    const spd = Math.sqrt(ball.vx ** 2 + ball.vy ** 2);
    const stretch = 1 + spd * config.stretchFactor; 
    const squash = 1 / stretch; 

    const moveAngle = Math.atan2(ball.vy, ball.vx);
    ctx.rotate(moveAngle);
    ctx.scale(stretch, squash);
    ctx.rotate(-moveAngle);
    ctx.rotate(ball.angle);

    const ygDrawR = config.ballRadius * ygScale;
    
    if (yellowGiantMode) {
        const auraColor = yellowGiantJumping ? 'rgba(255, 220, 0,' : 'rgba(255, 255, 255,';
        const auraCount = yellowGiantJumping ? 3 : 1;
        
        for (let ri = 0; ri < auraCount; ri++) {
            const pulse = Math.sin(Date.now() / 80 + ri * 1.0) * (yellowGiantJumping ? 8 : 4);
            ctx.beginPath(); ctx.arc(0, 0, ygDrawR + 12 + ri * 10 + pulse, 0, Math.PI * 2);
            ctx.strokeStyle = `${auraColor} ${0.6 - ri * 0.15})`; ctx.lineWidth = 5 - ri; ctx.shadowBlur = 30; ctx.shadowColor = '#ffff00'; ctx.stroke(); ctx.shadowBlur = 0;
        }
        if (yellowGiantJumping) {
            ctx.fillStyle = 'rgba(255, 230, 0, 0.25)'; ctx.beginPath(); ctx.arc(0, 0, ygDrawR * 1.4, 0, Math.PI * 2); ctx.fill();
        }
    }
    
    if (powerModeTimer > 0) { ctx.shadowBlur = 50; ctx.shadowColor = '#ff0000'; ctx.fillStyle = 'rgba(255, 0, 0, 0.5)'; ctx.beginPath(); ctx.arc(0, 0, config.ballRadius * 1.8, 0, Math.PI * 2); ctx.fill(); }
    else if (boostEffectTimer > 0) { ctx.shadowBlur = 25; ctx.shadowColor = '#ffffff'; }
    else if (yellowGiantMode) { ctx.shadowBlur = 40; ctx.shadowColor = '#ffff00'; }
    
    if (ballImageLoaded) { ctx.drawImage(ballImage, -ygDrawR, -ygDrawR, ygDrawR * 2, ygDrawR * 2); }
    else { ctx.fillStyle = yellowGiantMode ? '#ffff00' : '#ff3366'; ctx.beginPath(); ctx.arc(0, 0, ygDrawR, 0, Math.PI * 2); ctx.fill(); }
    ctx.restore(); ctx.restore();

    if (fadeToWhite > 0) {
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1.0, fadeToWhite)})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
}

function gameLoop() { 
    if (gameActive) { 
        update(); 
        draw(); 
        requestAnimationFrame(gameLoop); 
    } 
}

loadData();
updateLanguageUI();
changeState('title');