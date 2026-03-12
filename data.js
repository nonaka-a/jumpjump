const UPGRADE_DATA = {
    jump: {
        name: "High Jump",
        nameJa: "ハイジャンプ",
        costs: [600, 2000, 6000],
        max: 3,
        descsJa: [
            "ラインでの基本ジャンプ力がアップ",
            "ジャンプ力がさらにアップし",
            "ジャンプ力が限界までアップ",
            "ジャンプ力は最大です"
        ],
        descsEn: [
            "Increases basic jump power on lines.",
            "Increases jump power even further.",
            "Increases jump power to the limit.",
            "Jump power is at maximum."
        ]
    },
    booster: {
        name: "Speed Booster",
        nameJa: "スピードブースター",
        costs: [500, 1500, 8000],
        max: 3,
        descsJa: [
            "ブースターが出現するようになります",
            "ブースターの出現率がアップします",
            "ブースターの出力がパワーアップ",
            "ブースター性能は最大です"
        ],
        descsEn: [
            "Boosters will now appear.",
            "Increases booster appearance rate.",
            "Boosters are now more powerful.",
            "Booster performance is at maximum."
        ]
    },
    aura: {
        name: "Red Aura",
        nameJa: "レッドオーラ",
        costs: [1200, 3500, 7500],
        max: 3,
        descsJa: [
            "1000m以降に赤アイテムが出現。5秒間パワーモードになります",
            "500mから赤アイテムが出現し、持続時間が10秒に。出現率もアップ",
            "継続時間が15秒に。赤いオーラを長く纏い突き進めます",
            "赤アイテムの効果は最大です"
        ],
        descsEn: [
            "Red items appear after 1000m. Enter Power Mode for 5s.",
            "Red items appear from 500m, duration 10s. Higher rate.",
            "Duration increases to 15s. Charge ahead with a red aura.",
            "Red item effects are at maximum."
        ]
    },
    pierce: {
        name: "Block Pierce",
        nameJa: "ブロック貫通",
        costs: [400, 1200, 2500, 5000, 10000, 20000],
        max: 6,
        descsJa: [
            "ブロック破壊力アップ。紫ブロックを貫通できるが少し減速する",
            "ブロック破壊力アップ。赤ブロックを貫通できるが少し減速する",
            "ブロック破壊力アップ。黄ブロックを貫通できるが少し減速する",
            "ブロック破壊力アップ。白ブロックを貫通できるが少し減速する",
            "全ブロックを減速なしで完全貫通。無敵の突破力",
            "全ブロックを貫通し、さらにブロック破壊時に上方向への加速を得ます",
            "貫通力と加速の極致。全ての破壊が新たな推進力を生みます"
        ],
        descsEn: [
            "Pierce Purple blocks with slight deceleration.",
            "Pierce Red blocks with slight deceleration.",
            "Pierce Yellow blocks with slight deceleration.",
            "Pierce White blocks with slight deceleration.",
            "Pierce all blocks with no deceleration. Ultimate power.",
            "Pierce all blocks and gain upward boost on destruction.",
            "The pinnacle of piercing and acceleration. Total destruction."
        ]
    },
    sheet: {
        name: "Blue Sheet",
        nameJa: "ブルーシート",
        costs: [1500, 4500],
        max: 2,
        descsJa: [
            "画面下に青いラインを張り、1回だけ落下を防ぎます",
            "ブルーシートが強化され、2回まで落下を防ぎます",
            "ブルーシートは最大強化されています"
        ],
        descsEn: [
            "Places a blue line at the bottom to prevent falling once.",
            "Reinforced sheet prevents falling up to two times.",
            "Blue sheet is fully reinforced."
        ]
    },
    yellowGiant: {
        name: "Yellow Giant",
        nameJa: "イエロージャイアント",
        costs: [4000, 10000, 20000],
        max: 3,
        descsJa: [
            "低確率で黄色アイテムが出現。巨大化し次のライン反射で300m一気にジャンプ",
            "さらに巨大化し、600mの超ジャンプが可能になる",
            "  MAX巨大化し、驚異の1000mジャンプを放つ",
            "イエロージャイアントは最大強化です"
        ],
        descsEn: [
            "Yellow items appear. Grow huge and jump 300m on next bounce.",
            "Grow even larger for a massive 600m jump.",
            "Maximum size! Unleash an incredible 1000m jump.",
            "Yellow Giant is at maximum level."
        ]
    },
    multiplier: {
        name: "GP Multiplier",
        nameJa: "GP マルチプライヤー",
        costs: [1000, 4000],
        max: 2,
        descsJa: [
            "獲得できるGPが常時1.5倍になります",
            "獲得できるGPが常時2.0倍になります",
            "GP獲得倍率は最大です"
        ],
        descsEn: [
            "Earned GP is permanently multiplied by 1.5x.",
            "Earned GP is permanently multiplied by 2.0x.",
            "GP Multiplier is at maximum."
        ]
    }
};

const I18N = {
    altitude: { en: "ALTITUDE:", ja: "高度:" },
    redAura: { en: "RED AURA:", ja: "レッドオーラ:" },
    yellowGiant: { en: "YELLOW GIANT!", ja: "イエロージャイアント!" },
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


const ENDING_TEXT = {
    ja: [
        "キラキラと輝くネオン。空を飛ぶ車。たくさんのロケットや宇宙船。",
        "",
        "そんな見慣れぬ世界に圧倒されつつも",
        "まいまいはジャンプして！ジャンプして！ジャンプして！！",
        "ついにサイバーパンクな星を飛び出しました。",
        "",
        "「ふぅ……これで、なんとかおうちに帰れるぞ。",
        "大変だったけど、ピョンピョン飛ぶのは楽しかったし、",
        "キラキラがいっぱいでステキなところだったなぁ」",
        "",
        "まいまいがおうちに帰ったら、また新しい冒険が待っています。",
        "でも、それはまた別のお話。",
        "",
        "MAIMAI JUMP JUMP!",
        "Thank you for playing!"
    ],
    en: [
        "Shimmering neon lights. Flying cars. Countless rockets and spaceships.",
        "",
        "Overwhelmed by this unfamiliar world, Maimai jumped, and jumped, and jumped! At last, she soared beyond the cyberpunk star.",
        "",
        "\"Whew... now I can finally go home. It was a long journey, but hopping around was so much fun! And this place was so sparkly and beautiful.\"",
        "",
        "Once Maimai returns home, a new adventure awaits. But that is a story for another time.",
        "",
        "Thank you for playing MAIMAI JUMP JUMP!"
    ]
};

// I18Nのgoalを「クリア！」に変更
I18N.goal = { en: "CLEAR!!", ja: "クリア!!" };