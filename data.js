// =========================================
// LINE 貼圖 Prompt 產生器 - 資料定義
// =========================================

// 角色模板
const CHARACTER_TEMPLATES = {
    chibi_girl: {
        name: "👧 Q版女孩",
        prompt: "A cute chibi girl with big round sparkling eyes, pink cheeks"
    },
    chibi_boy: {
        name: "👦 Q版男孩",
        prompt: "A cute chibi boy with bright eyes, cheerful expression"
    },
    shiba: {
        name: "🐕 柴犬",
        prompt: "A cute Shiba Inu dog with fluffy fur, happy expression, tongue out"
    },
    cat: {
        name: "🐱 貓咪",
        prompt: "An adorable cat with big round eyes, soft fur, playful pose"
    },
    rabbit: {
        name: "🐰 兔子",
        prompt: "A cute bunny with long floppy ears, fluffy tail, innocent look"
    },
    bear: {
        name: "🐻 熊熊",
        prompt: "A cuddly teddy bear with round body, friendly smile"
    },
    hamster: {
        name: "🐹 倉鼠",
        prompt: "A tiny hamster with chubby cheeks, small paws, adorable"
    },
    penguin: {
        name: "🐧 企鵝",
        prompt: "A cute penguin with round belly, small wings"
    },
    dinosaur: {
        name: "🦕 恐龍",
        prompt: "A friendly baby dinosaur, small and round, pastel colors"
    },
    custom: {
        name: "✏️ 自訂角色",
        prompt: ""
    }
};

// 主題與貼圖項目
const THEMES = {
    greetings: {
        name: "👋 打招呼",
        items: [
            { action: "Waving hand cheerfully", text: "哈囉" },
            { action: "Bowing politely", text: "你好" },
            { action: "Giving thumbs up", text: "嗨" },
            { action: "Peeking from corner", text: "在嗎？" },
            { action: "Jumping with excitement", text: "好久不見" },
            { action: "Blowing a kiss", text: "想你囉" }
        ]
    },
    care: {
        name: "💕 問候關心",
        items: [
            { action: "Holding a steaming cup", text: "天冷了注意保暖" },
            { action: "Sending heart gestures", text: "關心你" },
            { action: "Holding an umbrella", text: "記得帶傘" },
            { action: "Stretching with a yawn", text: "早安" },
            { action: "Under a cozy blanket", text: "晚安" },
            { action: "Eating a meal happily", text: "記得吃飯" }
        ]
    },
    festivals: {
        name: "🎉 節日",
        items: [
            { action: "Holding a red envelope", text: "新年快樂" },
            { action: "Jumping with gold ingots", text: "恭喜發財" },
            { action: "Holding a lantern", text: "元宵節快樂" },
            { action: "Holding a mooncake", text: "中秋節快樂" },
            { action: "Looking at the moon", text: "花好月圓" },
            { action: "Wearing Santa hat", text: "聖誕快樂" }
        ]
    },
    love: {
        name: "❤️ 情侶愛情",
        items: [
            { action: "Holding a big heart", text: "我愛你" },
            { action: "Blowing kisses", text: "親一個" },
            { action: "Hugging a pillow shyly", text: "想你" },
            { action: "Making heart with hands", text: "比心" },
            { action: "Blushing with hearts around", text: "好喜歡你" },
            { action: "With couple rings", text: "永遠在一起" }
        ]
    },
    daily: {
        name: "💬 日常回覆",
        items: [
            { action: "Nodding with approval", text: "好的" },
            { action: "Giving double thumbs up", text: "沒問題" },
            { action: "Thinking pose", text: "讓我想想" },
            { action: "Shrugging shoulders", text: "隨便你" },
            { action: "Checking time on watch", text: "等一下" },
            { action: "Running in a hurry", text: "我先走了" }
        ]
    },
    emotions: {
        name: "😊 情緒表達",
        items: [
            { action: "Laughing with tears", text: "笑死" },
            { action: "Crying dramatically", text: "嗚嗚嗚" },
            { action: "Angry with steam", text: "生氣氣" },
            { action: "Shocked with wide eyes", text: "什麼！" },
            { action: "Sleepy with zzz", text: "好睏" },
            { action: "Sweating nervously", text: "緊張" }
        ]
    },
    work: {
        name: "💼 工作學習",
        items: [
            { action: "Working on laptop", text: "努力中" },
            { action: "Celebrating with confetti", text: "下班了！" },
            { action: "Exhausted at desk", text: "好累" },
            { action: "Holding coffee", text: "先喝咖啡" },
            { action: "High-fiving", text: "合作愉快" },
            { action: "Saluting", text: "收到！" }
        ]
    },
    thanks: {
        name: "🙏 感謝道歉",
        items: [
            { action: "Bowing deeply", text: "謝謝" },
            { action: "Holding a gift", text: "感謝你" },
            { action: "Praying hands", text: "拜託" },
            { action: "Apologetic bow", text: "對不起" },
            { action: "Kneeling with regret", text: "原諒我" },
            { action: "Clapping hands", text: "太棒了" }
        ]
    }
};

// 風格選項
const STYLES = {
    cute_chibi: {
        name: "🎀 可愛 Q 版",
        prompt: "Cute chibi style, adorable, lively, 2D flat sticker art, thick white outline, vibrant colors"
    },
    realistic: {
        name: "📷 照片級寫實",
        prompt: "Photo-realistic style, precise lighting and shadows, detailed textures, hyper-realistic"
    },
    figurine_3d: {
        name: "🧸 3D 公仔",
        prompt: "3D figurine style, rounded shapes, soft lighting, material textures, clay-like appearance"
    },
    flat: {
        name: "📐 扁平插畫",
        prompt: "Flat illustration style, minimalist, clean simple lines, geometric shapes, modern design"
    },
    storybook: {
        name: "📖 童書繪本",
        prompt: "Warm children's book illustration style, soft pastel colors, whimsical, imaginative"
    },
    anime_chibi: {
        name: "🌸 日系 Chibi",
        prompt: "Japanese Chibi style, big head small body, cel-shaded, anime-inspired, expressive"
    },
    handdrawn: {
        name: "✏️ 童趣手繪",
        prompt: "Hand-drawn style, irregular lines, playful, childlike charm, sketch-like texture"
    },
    watercolor: {
        name: "🎨 水彩風格",
        prompt: "Watercolor illustration style, soft color bleeding, artistic, delicate brushstrokes"
    },
    pixel: {
        name: "👾 像素復古",
        prompt: "Pixel art style, 8-bit retro gaming aesthetic, blocky, nostalgic"
    },
    neon: {
        name: "✨ 霓虹潮流",
        prompt: "Neon pop style, vibrant glowing colors, trendy, urban street art vibe"
    }
};

// 文字風格
const TEXT_STYLES = {
    default: {
        name: "🔘 預設（不指定）",
        prompt: ""
    },
    bubble: {
        name: "💬 標準氣泡框",
        prompt: "Text in a speech bubble with white background"
    },
    floating: {
        name: "✨ 無框文字",
        prompt: "Bold text floating next to character, no background"
    },
    handwritten: {
        name: "✏️ 手寫風格",
        prompt: "Hand-written style text, casual and playful"
    },
    neon: {
        name: "💡 霓虹發光",
        prompt: "Neon glowing text effect"
    },
    embossed: {
        name: "🔲 立體浮雕",
        prompt: "3D embossed text with shadow"
    },
    comic: {
        name: "💥 漫畫音效",
        prompt: "Comic-style text with action lines"
    },
    rounded: {
        name: "⭕ 可愛圓體",
        prompt: "Cute rounded bubble text"
    },
    calligraphy: {
        name: "🖌️ 書法風格",
        prompt: "Calligraphy brush stroke text"
    },
    cartoon: {
        name: "🔤 卡通斜體",
        prompt: "Cartoon italic bold text"
    }
};

// 文字位置
const TEXT_POSITIONS = {
    default: {
        name: "🔘 預設（不指定）",
        prompt: ""
    },
    beside: {
        name: "➡️ 角色旁邊",
        prompt: "text clearly visible next to character"
    },
    above: {
        name: "⬆️ 角色上方",
        prompt: "text floating above character"
    },
    bubble: {
        name: "💬 對話框內",
        prompt: "text inside speech bubble"
    },
    bottom: {
        name: "⬇️ 底部標註",
        prompt: "text at the bottom of the sticker"
    }
};

// 文字語言
const TEXT_LANGUAGES = {
    default: {
        name: "🔘 預設（不指定）",
        prompt: ""
    },
    zh_tw: {
        name: "🇹🇼 繁體中文",
        prompt: "Traditional Chinese characters"
    },
    en: {
        name: "🇺🇸 英文",
        prompt: "English text"
    },
    ja: {
        name: "🇯🇵 日文",
        prompt: "Japanese text"
    },
    none: {
        name: "🚫 無文字",
        prompt: "No text, expression only"
    }
};

// 輸出排列對應（含實際尺寸）
// 每張貼圖 370x320 px
const GRID_LAYOUTS = {
    1: { grid: "1x1", cols: 1, rows: 1, width: 370, height: 320, ratio: "37:32" },
    4: { grid: "2x2", cols: 2, rows: 2, width: 740, height: 640, ratio: "37:32" },
    6: { grid: "3x2", cols: 3, rows: 2, width: 1110, height: 640, ratio: "111:64" },
    8: { grid: "4x2", cols: 4, rows: 2, width: 1480, height: 640, ratio: "37:16" },
    9: { grid: "3x3", cols: 3, rows: 3, width: 1110, height: 960, ratio: "37:32" },
    12: { grid: "4x3", cols: 4, rows: 3, width: 1480, height: 960, ratio: "37:24" },
    16: { grid: "4x4", cols: 4, rows: 4, width: 1480, height: 1280, ratio: "37:32" },
    20: { grid: "5x4", cols: 5, rows: 4, width: 1850, height: 1280, ratio: "37:26" },
    24: { grid: "6x4", cols: 6, rows: 4, width: 2220, height: 1280, ratio: "111:64" }
};
