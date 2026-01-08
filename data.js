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
    reference_image: {
        name: "📷 使用參考圖",
        prompt: "Based on the attached reference image character"
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
            { action: "Blowing a kiss", text: "想你囉" },
            { action: "Waving goodbye", text: "掰掰" },
            { action: "Looking at phone", text: "晚點聊" },
            { action: "Waiting patiently", text: "等你唷" },
            { action: "Running towards camera", text: "來了來了" },
            { action: "Hiding behind door", text: "找我嗎" },
            { action: "Yawning and waving", text: "要睡了掰" }
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
            { action: "Eating a meal happily", text: "記得吃飯" },
            { action: "Holding a water bottle", text: "多喝水" },
            { action: "Doing stretching exercise", text: "注意身體" },
            { action: "Sitting on sofa relaxed", text: "休息一下" },
            { action: "Wearing a scarf", text: "小心感冒" },
            { action: "Holding medicine", text: "吃藥了嗎" },
            { action: "Walking in park", text: "有空出來走走" }
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
            { action: "Wearing Santa hat", text: "聖誕快樂" },
            { action: "Holding zongzi", text: "端午節快樂" },
            { action: "Wearing witch costume", text: "萬聖節快樂" },
            { action: "With birthday cake", text: "生日快樂" },
            { action: "Holding heart gift", text: "情人節快樂" },
            { action: "Giving carnation flower", text: "母親節快樂" },
            { action: "With necktie gift", text: "父親節快樂" }
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
            { action: "With couple rings", text: "永遠在一起" },
            { action: "In bed with phone", text: "睡前想你" },
            { action: "Morning stretch with smile", text: "今天也愛你" },
            { action: "Opening arms for hug", text: "抱抱" },
            { action: "Cheering with sparkles", text: "你最棒" },
            { action: "Looking at distance", text: "想見你" },
            { action: "Happy couple pose", text: "在一起好幸福" },
            { action: "Holding a glowing heart, blushing", text: "純純的愛" },
            { action: "Standing in front of a dreamy castle", text: "純愛城堡" },
            { action: "Wearing headband determined", text: "純愛戰士" },
            { action: "Leaning on shoulder happy", text: "有你真好" },
            { action: "Hugging a huge heart tightly", text: "最愛你了" }
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
            { action: "Running in a hurry", text: "我先走了" },
            { action: "Nodding with understanding", text: "了解" },
            { action: "Making OK hand sign", text: "OK" },
            { action: "Typing on phone busy", text: "在忙" },
            { action: "Rushing with speed lines", text: "馬上來" },
            { action: "Crossing arms saying no", text: "不行" },
            { action: "Casual shrug", text: "沒意見" }
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
            { action: "Sweating nervously", text: "緊張" },
            { action: "Jumping with joy", text: "開心" },
            { action: "Facepalm gesture", text: "傻眼" },
            { action: "Blushing covering face", text: "害羞" },
            { action: "Sighing with droopy eyes", text: "無奈" },
            { action: "Excited with sparkles", text: "興奮" },
            { action: "Dizzy with spirals", text: "暈倒" }
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
            { action: "Saluting", text: "收到！" },
            { action: "Fist pump motivation", text: "加油" },
            { action: "Melting on desk", text: "快撐不住" },
            { action: "Arms up celebration", text: "終於完成" },
            { action: "At meeting table", text: "開會中" },
            { action: "With luggage vacation mode", text: "放假囉" },
            { action: "Head exploding", text: "要爆炸了" }
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
            { action: "Clapping hands", text: "太棒了" },
            { action: "Bowing with hands together", text: "麻煩你了" },
            { action: "Wiping sweat relieved", text: "辛苦了" },
            { action: "Scratching head embarrassed", text: "不好意思" },
            { action: "Hands in prayer thankful", text: "感恩" },
            { action: "Hugging happily", text: "幫大忙了" },
            { action: "Jumping with gratitude", text: "超感謝" }
        ]
    },
    motivation: {
        name: "💪 加油打氣",
        items: [
            { action: "Fist pump energetically", text: "加油" },
            { action: "Cheering with pompoms", text: "你可以的" },
            { action: "Giving thumbs up confidently", text: "相信自己" },
            { action: "Running with determination", text: "衝啊" },
            { action: "Flexing muscles", text: "我最強" },
            { action: "Pointing forward", text: "往前衝" },
            { action: "Standing on mountain top", text: "我做到了" },
            { action: "High-fiving self", text: "給自己鼓掌" },
            { action: "Breaking through wall", text: "突破極限" },
            { action: "Sunrise stretching", text: "新的一天" },
            { action: "Medal on chest", text: "冠軍是我" },
            { action: "Flying with cape", text: "超越自己" }
        ]
    },
    positive: {
        name: "🌟 正能量語錄",
        items: [
            { action: "Looking at stars", text: "夢想會實現" },
            { action: "Holding light bulb", text: "靈感來了" },
            { action: "Growing plant", text: "慢慢變好" },
            { action: "Butterfly emerging", text: "蛻變中" },
            { action: "Sunshine pose", text: "今天也要開心" },
            { action: "Heart in hands", text: "愛自己" },
            { action: "Peaceful meditation", text: "放輕鬆" },
            { action: "Rainbow background", text: "雨後天晴" },
            { action: "Climbing ladder", text: "一步一步來" },
            { action: "Planting seed", text: "播種希望" },
            { action: "Open arms to sky", text: "感謝這一切" },
            { action: "Smiling through tears", text: "笑著面對" }
        ]
    },
    success: {
        name: "🏆 成功慶祝",
        items: [
            { action: "Popping champagne", text: "成功了" },
            { action: "Throwing confetti", text: "恭喜" },
            { action: "Holding trophy", text: "第一名" },
            { action: "Graduation cap throw", text: "畢業快樂" },
            { action: "Money rain", text: "發財了" },
            { action: "Victory pose", text: "勝利" },
            { action: "Celebration dance", text: "太棒了" },
            { action: "Fireworks background", text: "慶祝" },
            { action: "Cutting ribbon", text: "開幕大吉" },
            { action: "Clinking glasses", text: "乾杯" },
            { action: "Red carpet pose", text: "VIP 登場" },
            { action: "Taking a bow", text: "謝謝大家" }
        ]
    }
};

// 風格選項  2D flat sticker art
const STYLES = {
    cute_chibi: {
        name: "🎀 Q版",
        prompt: "Cute chibi style, adorable, lively,  vibrant colors"
    },
    realistic: {
        name: "📷 照片寫實",
        prompt: "Photo-realistic style, precise lighting and shadows, detailed textures, hyper-realistic"
    },
    figurine_3d: {
        name: "🧸 3D 公仔",
        prompt: "3D figurine style, rounded shapes, soft lighting, material textures, clay-like appearance"
    },
    storybook: {
        name: "📖 繪本",
        prompt: "Warm children's book illustration style, soft pastel colors, whimsical, imaginative"
    },
    anime_chibi: {
        name: "🌸 Chibi",
        prompt: "Japanese Chibi style, big head small body, cel-shaded, anime-inspired, expressive"
    },
    handdrawn: {
        name: "✏️ 手繪風格",
        prompt: "Hand-drawn style, irregular lines, playful, childlike charm, sketch-like texture"
    },
    watercolor: {
        name: "🎨 水彩風格",
        prompt: "Watercolor illustration style, soft color bleeding, artistic, delicate brushstrokes"
    },
    neon: {
        name: "✨ 霓虹",
        prompt: "Neon pop style, vibrant glowing colors, trendy, urban street art vibe"
    },
    gradient: {
        name: "🌈 漸層彩虹",
        prompt: "Vibrant gradient colors, rainbow palette, colorful, smooth color transitions"
    },
    game: {
        name: "🎮 遊戲卡通",
        prompt: "Game character style, bold colors, dynamic poses, energetic, gaming aesthetic"
    }
};

// 文字風格
const TEXT_STYLES = {
    chibi_pop_art: {
        name: "🎀 可愛Q版 Pop Art",
        prompt: "可愛 Q 版 Pop Art 字型, bold rounded cute text, vibrant colorful, playful and adorable"
    },
    festival: {
        name: "🎀 漸層圓體",
        prompt: "Bold rounded cute Chinese font. Warm and soft color palette (soft red, warm orange, gentle brown). Subtle gradient effect, harmonious with the character style"
    },
    cute_outline: {
        name: "🐰 可愛描邊",
        prompt: "Bold rounded cute font. Warm brown/chocolate solid color text, no gradient. Simple and clean, highly readable"
    },
    comic: {
        name: "💥 漫畫音效",
        prompt: "Comic-style text with action lines"
    },
    mixed_styles: {
        name: "🎨 混合風格",
        prompt: "Automatically choose the most suitable text style based on the emotion and context: Happy/Festive → warm rounded font with gradient; Cute/Shy → brown outlined text; Excited/Surprised → comic style with action lines; Elegant/Thanks → handwritten style; Mysterious/Halloween → neon glowing; Important/Emphasis → 3D embossed."
    },
    dynamic: {
        name: "🎭 情境混搭",
        prompt: "Vary the text style for each based on its emotion. Use bubbly rounded text for happy emotions, bold comic text for excited emotions, soft handwritten text for calm emotions. Be creative with text colors and effects"
    },
    neon: {
        name: "💡 霓虹發光",
        prompt: "Neon glowing text effect"
    },
    rounded: {
        name: "⭕ 可愛圓體",
        prompt: "Cute rounded bubble text"
    },
    handwritten: {
        name: "✏️ 手寫風格",
        prompt: "Hand-written style text, casual and playful"
    },
    calligraphy: {
        name: "🖌️ 書法風格",
        prompt: "Calligraphy brush stroke text"
    },
    cartoon: {
        name: "🔤 卡通斜體",
        prompt: "Cartoon italic bold text"
    },
    embossed: {
        name: "🔲 立體浮雕",
        prompt: "3D embossed text with shadow"
    },
    bubble: {
        name: "💬 標準氣泡框",
        prompt: "Text in a speech bubble with white background"
    },
    floating: {
        name: "✨ 無框文字",
        prompt: "Bold text floating next to character, no background"
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
        prompt: "text at the bottom"
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
