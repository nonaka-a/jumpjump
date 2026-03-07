// --- システム・セーブデータ管理 ---
const SAVE_KEY = 'lineball_savedata_v3';
let saveData = {
    gp: 0,
    highScore: 0,
    soundEnabled: true,
    upgrades: {
        jump: 0,
        booster: 0,
        aura: 0,
        pierce: 0,
        sheet: 0,
        multiplier: 0
    }
};

const UPGRADE_DATA = {
    jump: {
        name: "High Jump",
        costs: [600, 2000],
        max: 2,
        descs: [
            "ラインでの基本ジャンプ力がアップし、流れ星の尾を引きます",
            "ジャンプ力がさらにアップし、尾が2色の豪華な光になります",
            "ジャンプ力は最大です"
        ]
    },
    booster: {
        name: "Speed Booster",
        costs: [500, 1500],
        max: 2,
        descs: [
            "道中に青い単体ブースターが出現するようになります",
            "単体ブースターの出現率がアップします",
            "ブースター出現率は最大です"
        ]
    },
    aura: {
        name: "Power Aura",
        costs: [1200, 3500, 7500],
        max: 3,
        descs: [
            "1000m以降に稀に赤アイテムが出現。5秒間パワーモードになります",
            "500mから出現し、持続時間が10秒に。出現率もアップします",
            "継続時間が驚異の15秒に。赤いオーラを長く纏い突き進めます",
            "赤アイテムの効果は最大です"
        ]
    },
    pierce: {
        name: "Block Pierce",
        costs: [400, 2500, 6000, 12000, 25000],
        max: 5,
        descs: [
            "紫を貫通(減)、赤を1回破壊(反)へ",
            "紫を完貫、赤を貫通(減)、黄を1回破壊へ",
            "紫赤を完貫、黄を貫通(減)、白を1回破壊へ",
            "紫赤黄を完貫、白を貫通(減)へ",
            "全ブロックを減速なしで完全貫通。無敵の突破力です",
            "貫通力は究極です"
        ]
    },
    sheet: {
        name: "Blue Sheet",
        costs: [1500, 4500],
        max: 2,
        descs: [
            "画面下に青いラインを張り、1回だけ落下を防ぎます",
            "ブルーシートが強化され、2回まで落下を防ぎます",
            "ブルーシートは最大強化されています"
        ]
    },
    multiplier: {
        name: "GP Multiplier",
        costs: [1000, 4000],
        max: 2,
        descs: [
            "獲得できるGPが常時1.5倍になります",
            "獲得できるGPが常時2.0倍になります",
            "GP獲得倍率は最大です"
        ]
    }
};

function loadData() {
    const saved = localStorage.getItem(SAVE_KEY);
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
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
    if (audioCtx.state === 'suspended') audioCtx.resume();

    if (state === 'title') {
        document.getElementById('titleScreen').style.display = 'flex';
        document.getElementById('titleHigh').textContent = saveData.highScore;
        document.getElementById('titleGp').textContent = Math.floor(saveData.gp);
    } else if (state === 'shop') {
        document.getElementById('shopScreen').style.display = 'flex';
        updateShopUI();
    } else if (state === 'settings') {
        document.getElementById('settingsScreen').style.display = 'flex';
        updateSettingsUI();
    } else if (state === 'play') {
        document.getElementById('gameUI').style.display = 'block';
        initGame();
    } else if (state === 'result') {
        document.getElementById('resultScreen').style.display = 'flex';
        const mult = saveData.upgrades.multiplier === 2 ? 2.0 : (saveData.upgrades.multiplier === 1 ? 1.5 : 1.0);
        const earned = Math.floor(maxHeight * mult);
        const oldGp = saveData.gp;
        saveData.gp += earned;
        if (maxHeight > saveData.highScore) saveData.highScore = maxHeight;
        saveGameData();

        const titleEl = document.getElementById('resultTitle');
        if (maxHeight >= 10000) {
            titleEl.textContent = "GOAL!!";
            titleEl.style.color = "#ffff00";
        } else {
            titleEl.textContent = "GAME OVER";
            titleEl.style.color = "#00ffcc";
        }

        document.getElementById('resultHeight').textContent = maxHeight;
        document.getElementById('resultEarned').textContent = earned;
    }
}

function updateShopUI() {
    document.getElementById('shopGp').textContent = Math.floor(saveData.gp);
    const container = document.getElementById('shopList');
    container.innerHTML = "";
    for (let key in UPGRADE_DATA) {
        const info = UPGRADE_DATA[key];
        const lv = saveData.upgrades[key] || 0;
        const isMax = lv >= info.max;
        const cost = isMax ? 0 : info.costs[lv];
        const itemEl = document.createElement('div');
        itemEl.className = 'shop-item';
        itemEl.innerHTML = `
            <div class="shop-info">
                <div class="shop-title">${info.name} [Lv ${lv}]</div>
                <div class="shop-desc">${info.descs[lv]}</div>
            </div>
            <button class="shop-btn" ${isMax || saveData.gp < cost ? 'disabled' : ''} onclick="buyUpgrade('${key}')">
                ${isMax ? 'MAX' : 'Buy: ' + cost}
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
    const btn = document.getElementById('soundToggleBtn');
    btn.textContent = `SOUND: ${saveData.soundEnabled ? 'ON' : 'OFF'}`;
    btn.style.background = saveData.soundEnabled ? '#00ffcc' : '#555';
}

function toggleSound() {
    saveData.soundEnabled = !saveData.soundEnabled;
    saveGameData();
    updateSettingsUI();
    if (saveData.soundEnabled) playSound('energy');
}

function confirmReset() {
    if (window.confirm("本当にデータをリセットしますか？\n(ハイスコア、GP、アップグレードがすべて初期化されます)")) {
        resetData();
    }
}

function resetData() {
    saveData = {
        gp: 0,
        highScore: 0,
        soundEnabled: saveData.soundEnabled, // 音量設定は維持する
        upgrades: {
            jump: 0,
            booster: 0,
            aura: 0,
            pierce: 0,
            sheet: 0,
            multiplier: 0
        }
    };
    saveGameData();
    alert("データをリセットしました。");
    changeState('title');
}

// --- 画像・音声 ---
const ballImage = new Image(); ballImage.src = 'maimai.png';
const bgImage = new Image(); bgImage.src = 'BG.png';
let imagesLoaded = 0;
const onImageLoad = () => { imagesLoaded++; };
ballImage.onload = onImageLoad;
bgImage.onload = onImageLoad;

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const soundBuffers = {};
async function loadSound(name, url) {
    try {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        soundBuffers[name] = await audioCtx.decodeAudioData(arrayBuffer);
    } catch (e) { }
}
function playSound(name) {
    if (!saveData.soundEnabled) return;
    if (!soundBuffers[name] || audioCtx.state === 'suspended') return;
    const source = audioCtx.createBufferSource();
    source.buffer = soundBuffers[name];
    source.connect(audioCtx.destination);
    source.start(0);
}
loadSound('jump', 'jump2.mp3');
loadSound('energy', 'energy.mp3');

// --- ゲームロジック ---
function resizeCanvas() {
    const maxWidth = 500; const maxHeight = window.innerHeight * 0.95;
    const scale = Math.min(window.innerWidth / maxWidth, window.innerHeight / maxHeight);
    canvas.width = maxWidth; canvas.height = maxHeight;
    canvas.style.width = (maxWidth * scale) + 'px'; canvas.style.height = (maxHeight * scale) + 'px';
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

let ball, lines, boosters, items, blocks, particles, speedLines;
let isDrawing, startPoint, currentPoint, maxHeight, gameActive, cameraY;
let boostEffectTimer, powerModeTimer, nextGateAlt, nextBlockY, nextSingleBoosterY, currentSheetCount;

const config = {
    ballRadius: 20, gravity: 0.22, maxSpeed: 20, baseBounce: 9, powerMultiplier: 280,
    cameraLerp: 0.1, rotationDamping: 0.95, moveRotationFactor: 0.002, bounceRotationFactor: 0.03,
    stretchFactor: 0.004, boostPower: -22, parallaxSpeed: 0.005, speedLineThreshold: 28
};

function initGame() {
    // 開始位置を高さ60%付近に調整
    ball = {
        x: canvas.width / 2,
        y: canvas.height * 0.6,
        vx: (Math.random() - 0.5) * 3,
        vy: 1,
        angle: 0,
        va: 0
    };
    lines = []; boosters = []; items = []; blocks = []; particles = []; speedLines = [];
    isDrawing = false; startPoint = null; currentPoint = null;
    maxHeight = 0; cameraY = 0; boostEffectTimer = 0; powerModeTimer = 0;
    nextGateAlt = 500; nextBlockY = -800; nextSingleBoosterY = -300;
    currentSheetCount = saveData.upgrades.sheet || 0;
    document.getElementById('heightScore').textContent = "0";
    document.getElementById('powerUI').style.display = 'none';
    gameActive = true;
    requestAnimationFrame(gameLoop);
}

function spawnBooster(yTarget, isGate = false) {
    if (isGate) {
        const num = 6; const gateWidth = 70; const spacing = canvas.width / (num + 1);
        for (let i = 1; i <= num; i++) { boosters.push({ x: i * spacing - (gateWidth / 2), y: yTarget, w: gateWidth, h: 50, active: true, isGate: true }); }
    } else {
        boosters.push({ x: Math.random() * (canvas.width - 120) + 20, y: yTarget, w: 100, h: 60, active: true, isGate: false });
    }
}
function spawnItem(yTarget) { items.push({ x: Math.random() * (canvas.width - 100) + 50, y: yTarget, radius: 35, active: true }); }
function spawnBlocks(yTarget, currentAlt) {
    const maxDensity = Math.min(4, Math.floor(currentAlt / 1000) + 1);
    const count = Math.floor(Math.random() * maxDensity) + 1;
    for (let i = 0; i < count; i++) {
        let attempts = 0;
        let x, y, w, h;
        while (attempts < 15) {
            x = Math.random() * (canvas.width - 100);
            y = yTarget + (Math.random() * 150 - 75);
            w = 80 + Math.random() * 40;
            h = 30;

            let overlap = false;
            for (let b of blocks) {
                if (x < b.x + b.w + 10 && x + w + 10 > b.x &&
                    y < b.y + b.h + 10 && y + h + 10 > b.y) {
                    overlap = true;
                    break;
                }
            }
            if (!overlap) break;
            attempts++;
        }
        let bType = 'purple';
        let bHp = 1;
        if (currentAlt >= 8000 && Math.random() < 0.4) {
            bType = 'white'; bHp = 4;
        } else if (currentAlt >= 6000 && Math.random() < 0.4) {
            bType = 'yellow'; bHp = 3;
        } else if (currentAlt >= 3000 && Math.random() < 0.4) {
            bType = 'red'; bHp = 2;
        }
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
window.addEventListener('mouseup', () => { isDrawing = false; });
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
    ball.vy += config.gravity; ball.x += ball.vx; ball.y += ball.vy;
    ball.angle += ball.va; ball.va *= config.rotationDamping; ball.va += ball.vx * config.moveRotationFactor;
    if (ball.x - config.ballRadius < 0 || ball.x + config.ballRadius > canvas.width) { ball.vx *= -0.7; ball.va += ball.vy * 0.01; ball.x = ball.x < config.ballRadius ? config.ballRadius : canvas.width - config.ballRadius; }

    const targetY = ball.y - canvas.height * 0.5;
    if (targetY < cameraY) cameraY += (targetY - cameraY) * config.cameraLerp;

    const currentAlt = Math.floor(Math.max(0, (canvas.height - 100 - ball.y) / 20));
    const spawnY = cameraY - 400;

    if (currentAlt >= nextGateAlt) { spawnBooster(ball.y - 450, true); nextGateAlt = (nextGateAlt === 500) ? 1000 : nextGateAlt + 1000; }

    const bLv = saveData.upgrades.booster;
    if (bLv > 0 && cameraY < nextSingleBoosterY) {
        const prob = (bLv === 2) ? 0.9 : 0.6;
        if (Math.random() < prob) spawnBooster(nextSingleBoosterY - 200, false);
        nextSingleBoosterY -= (bLv === 2 ? 600 : 1000);
    }

    const aLv = saveData.upgrades.aura;
    if (aLv > 0) {
        const appearAlt = (aLv >= 2) ? 500 : 1000;
        const prob = (aLv >= 2) ? 0.005 : 0.0015;
        if (currentAlt >= appearAlt && Math.random() < prob) spawnItem(spawnY);
    }

    if (cameraY < nextBlockY) {
        spawnBlocks(nextBlockY - 200, currentAlt);
        let interval = 800 - Math.floor(currentAlt / 1000) * 150;
        if (interval < 250) interval = 250;
        nextBlockY -= interval;
    }

    if (powerModeTimer > 0) {
        powerModeTimer -= 1 / 60; document.getElementById('powerUI').style.display = 'block'; document.getElementById('timer').textContent = Math.ceil(powerModeTimer);
        for (let i = 0; i < 3; i++) particles.push(new Particle(ball.x + (Math.random() - 0.5) * 40, ball.y + (Math.random() - 0.5) * 40, Math.random() > 0.4 ? '#ff0000' : '#ffaa00', (Math.random() - 0.5) * 3, -Math.random() * 8, 0.05, 4));
        if (powerModeTimer <= 0) document.getElementById('powerUI').style.display = 'none';
    }

    if (ball.vy < -config.speedLineThreshold && Math.random() > 0.3) { speedLines.push({ x: Math.random() < 0.5 ? Math.random() * 60 : canvas.width - Math.random() * 60, y: -50, h: 60 + Math.random() * 100, v: 20 + Math.random() * 15 }); }
    speedLines.forEach((sl, i) => { sl.y += sl.v; if (sl.y > canvas.height) speedLines.splice(i, 1); });

    boosters.forEach(b => { if (b.active && ball.x > b.x && ball.x < b.x + b.w && ball.y > b.y && ball.y < b.y + b.h) { ball.vy = config.boostPower; boostEffectTimer = 25; for (let i = 0; i < 25; i++) particles.push(new Particle(ball.x, ball.y, '#00ffff', (Math.random() - 0.5) * 20, (Math.random() - 0.5) * 20)); playSound('energy'); b.active = false; } });
    items.forEach(it => { if (it.active && Math.sqrt((ball.x - it.x) ** 2 + (ball.y - it.y) ** 2) < (config.ballRadius + it.radius)) { const aLv = saveData.upgrades.aura; powerModeTimer = (aLv === 3) ? 15 : (aLv === 2 ? 10 : 5); it.active = false; playSound('energy'); for (let i = 0; i < 60; i++) particles.push(new Particle(it.x, it.y, '#ff0000', (Math.random() - 0.5) * 30, (Math.random() - 0.5) * 30, 0.02, 5)); } });

    if (currentSheetCount > 0 && ball.y > cameraY + canvas.height - 40) {
        ball.vy = -18; ball.y = cameraY + canvas.height - 45; currentSheetCount--; playSound('energy');
        for (let i = 0; i < 30; i++) particles.push(new Particle(ball.x, ball.y, '#00ccff', (Math.random() - 0.5) * 15, (Math.random() - 0.5) * 15, 0.04, 4));
    }

    const pLv = saveData.upgrades.pierce;
    blocks.forEach(bk => {
        if (bk.active) {
            const cx = Math.max(bk.x, Math.min(ball.x, bk.x + bk.w)), cy = Math.max(bk.y, Math.min(ball.y, bk.y + bk.h)), dist = Math.sqrt((ball.x - cx) ** 2 + (ball.y - cy) ** 2);
            if (dist < config.ballRadius) {
                const isPower = powerModeTimer > 0;
                let destroyed = false;
                let bounce = false;
                let slow = false;

                const levels = { purple: 0, red: 1, yellow: 2, white: 3 };
                const bkLv = levels[bk.type] || 0;

                if (isPower || pLv >= (bkLv + 2)) {
                    destroyed = true; // 完全貫通
                } else if (pLv === (bkLv + 1)) {
                    destroyed = true;
                    slow = true; // 減速貫通
                } else {
                    bk.hp--;
                    // 貫通設定があれば、そのブロックの硬度を段階的に無視する
                    if (pLv > 0 && bk.hp > 0) {
                        if (bk.type === 'red' && pLv >= 1) bk.hp = 0;
                        if (bk.type === 'yellow' && pLv >= 2) bk.hp = 0;
                        if (bk.type === 'white' && pLv >= 3) bk.hp = 0;
                    }
                    if (bk.hp <= 0) destroyed = true;
                    bounce = true; // 反射破壊
                }

                if (destroyed) {
                    bk.active = false;
                    playSound('jump');
                    for (let i = 0; i < 40; i++) {
                        let c = '#8e38cc';
                        if (bk.type === 'red') c = '#ff1744';
                        if (bk.type === 'yellow') c = '#ffff00';
                        if (bk.type === 'white') c = '#ffffff';
                        particles.push(new Particle(cx, cy, c, (Math.random() - 0.5) * 12, (Math.random() - 0.5) * 12, 0.03, Math.random() * 4 + 2));
                    }
                }
                if (bounce) {
                    ball.vy = Math.abs(ball.vy) * 0.5 + 2; ball.vx *= 0.5; ball.y -= 10;
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
        if (jLv === 1) particles.push(new Particle(ball.x, ball.y, '#00ffcc', (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2, 0.08, 2));
        if (jLv === 2) {
            particles.push(new Particle(ball.x, ball.y, '#00ffcc', (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2, 0.08, 2));
            particles.push(new Particle(ball.x, ball.y, '#ff3366', (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2, 0.08, 2));
        }
    }

    if (Math.sqrt(ball.vx ** 2 + ball.vy ** 2) > config.particleThreshold) particles.push(new Particle(ball.x, ball.y, powerModeTimer > 0 ? '#ff3300' : '#00ffcc', (Math.random() - 0.5) * 3, (Math.random() - 0.5) * 3));
    for (let i = particles.length - 1; i >= 0; i--) { particles[i].update(); if (particles[i].life <= 0) particles.splice(i, 1); }
    if (currentAlt > maxHeight) {
        maxHeight = currentAlt; document.getElementById('heightScore').textContent = maxHeight;
        if (maxHeight >= 10000) {
            gameActive = false;
            setTimeout(() => changeState('result'), 1000);
            for (let i = 0; i < 100; i++) particles.push(new Particle(ball.x, ball.y, '#ffff00', (Math.random() - 0.5) * 30, (Math.random() - 0.5) * 30, 0.01, 8));
        }
    }
    if (ball.y > cameraY + canvas.height + 50) changeState('result');

    for (let i = lines.length - 1; i >= 0; i--) {
        if (checkCollision(ball, lines[i])) {
            reflectBall(ball, lines[i]); lines.splice(i, 1); playSound('jump');
            if (powerModeTimer > 0) for (let j = 0; j < 25; j++) particles.push(new Particle(ball.x, ball.y, '#ff0000', (Math.random() - 0.5) * 15, (Math.random() - 0.5) * 15, 0.04, 3));
        } else if (lines[i].y1 > cameraY + canvas.height + 100) lines.splice(i, 1);
    }
    boosters = boosters.filter(b => b.y < cameraY + canvas.height + 100);
    items = items.filter(it => it.y < cameraY + canvas.height + 100);
    blocks = blocks.filter(bk => bk.y < cameraY + canvas.height + 100 && bk.active);
}

function checkCollision(ball, line) {
    const dx = line.x2 - line.x1, dy = line.y2 - line.y1, l2 = dx * dx + dy * dy;
    let t = Math.max(0, Math.min(1, ((ball.x - line.x1) * dx + (ball.y - line.y1) * dy) / l2));
    return Math.sqrt(Math.pow(ball.x - (line.x1 + t * dx), 2) + Math.pow(ball.y - (line.y1 + t * dy), 2)) < config.ballRadius;
}

function reflectBall(ball, line) {
    const dx = line.x2 - line.x1, dy = line.y2 - line.y1;
    let nx = -dy, ny = dx; const mag = Math.sqrt(nx * nx + ny * ny); nx /= mag; ny /= mag;
    if (ny > 0) { nx *= -1; ny *= -1; }
    const dot = ball.vx * nx + ball.vy * ny;
    const jLv = saveData.upgrades.jump;
    const jumpBonus = (jLv === 2) ? 1.5 : (jLv === 1 ? 1.2 : 1.0);
    let mul = config.powerMultiplier * (powerModeTimer > 0 ? 3.0 : jumpBonus);
    const pwr = Math.min(config.baseBounce + (mul / (line.length * 0.1)), config.maxSpeed * (powerModeTimer > 0 ? 2.2 : 1.0));
    ball.vx = (ball.vx - 2 * dot * nx) * 0.8; ball.vy = (ball.vy - 2 * dot * ny);
    const v = Math.sqrt(ball.vx ** 2 + ball.vy ** 2); ball.vx = (ball.vx / v) * pwr; ball.vy = (ball.vy / v) * pwr;
    ball.va = (ball.vx * Math.cos(Math.atan2(dy, dx))) * config.bounceRotationFactor; ball.y -= 10;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (imagesLoaded >= 2) {
        const bgW = canvas.width * 3; const bgScale = bgW / bgImage.width; const bgH = bgImage.height * bgScale;
        // 10000m（高度）に合わせて、BG画像の最下部から最上部までスライドさせる
        const progress = Math.min(1.0, maxHeight / 10000);
        const bgOffset = progress * (bgH - canvas.height);
        const startX = (canvas.width - bgW) / 2;
        ctx.drawImage(bgImage, startX, (canvas.height - bgH) + bgOffset, bgW, bgH);
        ctx.fillStyle = "rgba(0, 0, 0, 0.8)"; ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    if (currentSheetCount > 0) {
        ctx.strokeStyle = '#00ccff'; ctx.lineWidth = 20; ctx.globalAlpha = 0.5 + Math.sin(Date.now() / 100) * 0.2;
        ctx.beginPath(); ctx.moveTo(0, canvas.height - 30); ctx.lineTo(canvas.width, canvas.height - 30); ctx.stroke(); ctx.globalAlpha = 1.0;
    }
    ctx.strokeStyle = powerModeTimer > 0 ? 'rgba(255, 30, 0, 0.7)' : 'rgba(0, 255, 204, 0.4)'; ctx.lineWidth = 3;
    speedLines.forEach(sl => { ctx.beginPath(); ctx.moveTo(sl.x, sl.y); ctx.lineTo(sl.x, sl.y + sl.h); ctx.stroke(); });
    ctx.strokeStyle = 'rgba(0, 255, 204, 0.1)'; ctx.lineWidth = 1;
    const gStep = 50; const sGrid = Math.floor(cameraY / gStep) * gStep;
    for (let gy = sGrid; gy < sGrid + canvas.height + gStep; gy += gStep) { ctx.beginPath(); ctx.moveTo(0, gy - cameraY); ctx.lineTo(canvas.width, gy - cameraY); ctx.stroke(); }
    particles.forEach(p => p.draw(ctx, cameraY));
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
        ctx.strokeStyle = bk.type === 'white' ? 'rgba(255, 255, 255, 0.4)' : (bk.type === 'yellow' ? 'rgba(255, 255, 0, 0.2)' : (bk.type === 'red' ? 'rgba(255, 100, 100, 0.2)' : 'rgba(255, 255, 255, 0.1)'));
    });
    items.forEach(it => { if (!it.active) return; ctx.fillStyle = '#ff3300'; ctx.shadowBlur = 40; ctx.shadowColor = '#ff0000'; const p = Math.sin(Date.now() / 120) * 10; ctx.beginPath(); ctx.arc(it.x, it.y, it.radius + p, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(it.x, it.y, (it.radius + p) * 0.5, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0; });
    boosters.forEach(b => {
        if (!b.active) return;
        ctx.strokeStyle = b.isGate ? '#ffffff' : '#00ffff'; ctx.lineWidth = 6; ctx.shadowBlur = 15; ctx.shadowColor = ctx.strokeStyle;
        for (let i = 0; i < 3; i++) { const yo = (i * 20); ctx.beginPath(); ctx.moveTo(b.x, b.y + b.h - yo); ctx.lineTo(b.x + b.w / 2, b.y + b.h - 25 - yo); ctx.lineTo(b.x + b.w, b.y + b.h - yo); ctx.stroke(); }
        ctx.shadowBlur = 0;
    });
    ctx.fillStyle = '#00ffcc'; ctx.globalAlpha = 0.5;
    for (let m = 0; m < maxHeight + 100; m += 10) { const yp = canvas.height - 100 - (m * 20); ctx.fillRect(0, yp, 15, 2); ctx.fillRect(canvas.width - 15, yp, 15, 2); if (m % 50 === 0) ctx.fillText(m + 'm', 20, yp + 5); }
    ctx.globalAlpha = 1.0;
    lines.forEach(line => { const hue = Math.max(0, 180 - line.length * 0.5); ctx.strokeStyle = (powerModeTimer > 0) ? '#ff0000' : `hsl(${hue}, 100%, 60%)`; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(line.x1, line.y1); ctx.lineTo(line.x2, line.y2); ctx.stroke(); });
    if (isDrawing && startPoint && currentPoint) { ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)'; ctx.setLineDash([5, 5]); ctx.beginPath(); ctx.moveTo(startPoint.x, startPoint.y); ctx.lineTo(currentPoint.x, currentPoint.y); ctx.stroke(); ctx.setLineDash([]); }
    ctx.save(); ctx.translate(ball.x, ball.y);
    const spd = Math.sqrt(ball.vx ** 2 + ball.vy ** 2); const str = 1 + Math.pow(spd / config.maxSpeed, 1.5) * (config.maxSpeed * config.stretchFactor);
    ctx.rotate(Math.atan2(ball.vy, ball.vx)); ctx.scale(str, 1 / str); ctx.rotate(-Math.atan2(ball.vy, ball.vx)); ctx.rotate(ball.angle);
    if (powerModeTimer > 0) { ctx.shadowBlur = 50; ctx.shadowColor = '#ff0000'; ctx.fillStyle = 'rgba(255, 0, 0, 0.5)'; ctx.beginPath(); ctx.arc(0, 0, config.ballRadius * 1.8, 0, Math.PI * 2); ctx.fill(); }
    else if (boostEffectTimer > 0) { ctx.shadowBlur = 25; ctx.shadowColor = '#ffffff'; }
    if (imagesLoaded >= 1) { ctx.drawImage(ballImage, -config.ballRadius, -config.ballRadius, config.ballRadius * 2, config.ballRadius * 2); }
    else { ctx.fillStyle = '#ff3366'; ctx.beginPath(); ctx.arc(0, 0, config.ballRadius, 0, Math.PI * 2); ctx.fill(); }
    ctx.restore(); ctx.restore();
}

function gameLoop() { if (gameActive) { update(); draw(); requestAnimationFrame(gameLoop); } }

loadData();
changeState('title');