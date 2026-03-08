const UPGRADE_DATA = {
    jump: {
        name: "High Jump",
        nameJa: "ハイジャンプ",
        costs: [600, 2000, 6000],
        max: 3,
        descs: [
            "ラインでの基本ジャンプ力がアップ",
            "ジャンプ力がさらにアップし",
            "ジャンプ力が限界までアップ",
            "ジャンプ力は最大です"
        ]
    },
    booster: {
        name: "Speed Booster",
        nameJa: "スピードブースター",
        costs: [500, 1500, 8000],
        max: 3,
        descs: [
            "ブースターが出現するようになります",
            "ブースターの出現率がアップします",
            "ブースターの出力が強化され、噴射時に虹色の光を放ちます",
            "ブースター性能は最大です"
        ]
    },
    aura: {
        name: "Power Aura",
        nameJa: "パワーオーラ",
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
        nameJa: "ブロック貫通",
        costs: [400, 1200, 3000, 6000, 12000, 25000],
        max: 6,
        descs: [
            "紫を貫通(減)、赤を1回破壊(反)へ",
            "紫を完貫、赤を貫通(減)、黄を1回破壊へ",
            "紫赤を完貫、黄を貫通(減)、白を1回破壊へ",
            "紫赤黄を完貫、白を貫通(減)へ",
            "全ブロックを減速なしで完全貫通。無敵の突破力です",
            "全ブロックを貫通し、さらに破壊時に上方向への加速を得ます",
            "貫通力と加速の極致。全ての破壊が新たな推進力を生みます"
        ]
    },
    sheet: {
        name: "Blue Sheet",
        nameJa: "ブルーシート",
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
        nameJa: "GP マルチプライヤー",
        costs: [1000, 4000],
        max: 2,
        descs: [
            "獲得できるGPが常時1.5倍になります",
            "獲得できるGPが常時2.0倍になります",
            "GP獲得倍率は最大です"
        ]
    }
};

const I18N = {
    altitude: { en: "ALTITUDE:", ja: "高度:" },
    redAura: { en: "RED AURA:", ja: "レッドオーラ:" },
    highScore: { en: "HIGH SCORE:", ja: "ハイスコア:" },
    totalGp: { en: "TOTAL GP:", ja: "トータル GP:" },
    jumpStart: { en: "JUMP (START)", ja: "ジャンプ(スタート)" },
    shop: { en: "SHOP", ja: "ショップ" },
    settings: { en: "SETTINGS", ja: "設定" },
    resetData: { en: "RESET DATA", ja: "データリセット" },
    backToTitle: { en: "BACK TO TITLE", ja: "タイトルにもどる" },
    upgradeShop: { en: "UPGRADE SHOP", ja: "アップグレード ショップ" },
    gameOver: { en: "GAME OVER", ja: "ゲームオーバー" },
    goal: { en: "GOAL!!", ja: "ゴール!!" },
    reached: { en: "Reached:", ja: "到達高度:" },
    earnedGp: { en: "Earned GP:", ja: "獲得 GP:" },
    retry: { en: "RETRY", ja: "リトライ" },
    titleBtn: { en: "TITLE", ja: "タイトルへもどる" }
};
