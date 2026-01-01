// =========================================
// LINE 貼圖 Prompt 產生器 - 主程式
// =========================================

// State
let currentItems = [];

// DOM Elements
const elements = {
    characterTemplate: document.getElementById('characterTemplate'),
    characterCustom: document.getElementById('characterCustom'),
    customCharacter: document.getElementById('customCharacter'),
    themeSelect: document.getElementById('themeSelect'),
    styleSelect: document.getElementById('styleSelect'),
    textStyle: document.getElementById('textStyle'),
    textPosition: document.getElementById('textPosition'),
    textLanguage: document.getElementById('textLanguage'),
    stickerItems: document.getElementById('stickerItems'),
    itemCount: document.getElementById('itemCount'),
    outputCount: document.getElementById('outputCount'),
    bgColor: document.getElementById('bgColor'),
    customBgColor: document.getElementById('customBgColor'),
    bgColorPicker: document.getElementById('bgColorPicker'),
    promptOutput: document.getElementById('promptOutput'),
    copyBtn: document.getElementById('copyBtn'),
    resetBtn: document.getElementById('resetBtn'),
    saveSettingsBtn: document.getElementById('saveSettingsBtn'),
    loadSettingsBtn: document.getElementById('loadSettingsBtn'),
    clearSettingsBtn: document.getElementById('clearSettingsBtn'),
    copyStatus: document.getElementById('copyStatus'),
    toast: document.getElementById('toast'),

    // Reference Image
    refImageInstruction: document.getElementById('refImageInstruction')
};

// =========================================
// Initialization
// =========================================

function init() {
    populateSelects();
    bindEvents();
    loadThemeItems('greetings');
    updatePrompt();
}

function populateSelects() {
    // Character Templates
    for (const [key, data] of Object.entries(CHARACTER_TEMPLATES)) {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = data.name;
        elements.characterTemplate.appendChild(option);
    }

    // Themes
    for (const [key, data] of Object.entries(THEMES)) {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = data.name;
        elements.themeSelect.appendChild(option);
    }

    // Styles
    for (const [key, data] of Object.entries(STYLES)) {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = data.name;
        elements.styleSelect.appendChild(option);
    }

    // Text Styles
    for (const [key, data] of Object.entries(TEXT_STYLES)) {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = data.name;
        elements.textStyle.appendChild(option);
    }

    // Text Positions
    for (const [key, data] of Object.entries(TEXT_POSITIONS)) {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = data.name;
        elements.textPosition.appendChild(option);
    }

    // Text Languages
    for (const [key, data] of Object.entries(TEXT_LANGUAGES)) {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = data.name;
        elements.textLanguage.appendChild(option);
    }
}

// =========================================
// Event Handlers
// =========================================

function bindEvents() {
    // Character Template Change
    elements.characterTemplate.addEventListener('change', (e) => {
        const val = e.target.value;

        // Custom Character Textarea
        if (val === 'custom') {
            elements.characterCustom.classList.remove('hidden');
        } else {
            elements.characterCustom.classList.add('hidden');
        }

        // Reference Image Instruction
        if (val === 'reference_image') {
            elements.refImageInstruction.classList.remove('hidden');
        } else {
            elements.refImageInstruction.classList.add('hidden');
        }

        updatePrompt();
    });

    elements.customCharacter.addEventListener('input', updatePrompt);

    // Theme Change
    elements.themeSelect.addEventListener('change', (e) => {
        loadThemeItems(e.target.value);
        updatePrompt();
    });

    // Style Change
    elements.styleSelect.addEventListener('change', updatePrompt);

    // Text Settings Change
    elements.textStyle.addEventListener('change', updatePrompt);
    elements.textPosition.addEventListener('change', updatePrompt);
    elements.textLanguage.addEventListener('change', updatePrompt);

    // Output Settings Change
    elements.outputCount.addEventListener('change', () => {
        updateItemCount();
        updatePrompt();
    });

    // Background Color
    elements.bgColor.addEventListener('change', (e) => {
        if (e.target.value === 'custom') {
            elements.customBgColor.classList.remove('hidden');
        } else {
            elements.customBgColor.classList.add('hidden');
        }
        updatePrompt();
    });

    elements.bgColorPicker.addEventListener('input', updatePrompt);

    // Buttons
    elements.copyBtn.addEventListener('click', copyPrompt);
    elements.resetBtn.addEventListener('click', resetAll);
    elements.saveSettingsBtn.addEventListener('click', saveSettings);
    elements.loadSettingsBtn.addEventListener('click', loadSettings);
    elements.clearSettingsBtn.addEventListener('click', clearSettings);


}

// =========================================
// Theme & Items
// =========================================

function loadThemeItems(themeKey) {
    const theme = THEMES[themeKey];
    if (!theme) return;

    currentItems = theme.items.map(item => ({ ...item }));
    renderStickerItems();
    updateItemCount();
}

function renderStickerItems() {
    elements.stickerItems.innerHTML = '';
    const count = parseInt(elements.outputCount.value);

    for (let i = 0; i < count; i++) {
        const item = currentItems[i] || { action: '', text: '' };
        const div = document.createElement('div');
        div.className = 'sticker-item';
        div.innerHTML = `
            <span class="item-number">${i + 1}</span>
            <input type="text" 
                   class="action-input" 
                   data-index="${i}" 
                   value="${item.action}" 
                   placeholder="動作描述">
            <input type="text" 
                   class="text-input" 
                   data-index="${i}" 
                   value="${item.text}" 
                   placeholder="貼圖文字">
        `;
        elements.stickerItems.appendChild(div);
    }

    // Bind item input events
    document.querySelectorAll('.action-input, .text-input').forEach(input => {
        input.addEventListener('input', (e) => {
            const index = parseInt(e.target.dataset.index);
            if (!currentItems[index]) {
                currentItems[index] = { action: '', text: '' };
            }
            if (e.target.classList.contains('action-input')) {
                currentItems[index].action = e.target.value;
            } else {
                currentItems[index].text = e.target.value;
            }
            updatePrompt();
        });
    });
}

function updateItemCount() {
    const count = parseInt(elements.outputCount.value);
    elements.itemCount.textContent = `(${count} 項)`;

    // Ensure currentItems has enough items
    while (currentItems.length < count) {
        currentItems.push({ action: '', text: '' });
    }

    renderStickerItems();
}

// =========================================
// Prompt Generation
// =========================================

function updatePrompt() {
    const prompt = generatePrompt();
    elements.promptOutput.textContent = prompt;
}

function generatePrompt() {
    const count = parseInt(elements.outputCount.value);
    const layoutInfo = GRID_LAYOUTS[count];

    // Get Character
    const charKey = elements.characterTemplate.value;
    let characterPrompt = '';
    if (charKey === 'custom') {
        characterPrompt = elements.customCharacter.value || 'A cute character';
    } else {
        characterPrompt = CHARACTER_TEMPLATES[charKey]?.prompt || '';
    }

    // Add reference image instruction if enabled
    const hasRefImage = charKey === 'reference_image';
    let refImageInstruction = '';
    if (hasRefImage) {
        refImageInstruction = `
⚠️ 重要：請根據我附上的參考圖片中的角色來設計貼圖。
保持參考圖中角色的：外觀特徵、服裝風格、顏色配色。
但可以改變表情和姿勢來配合各貼圖內容。
`;
    }

    // Get Style
    const styleKey = elements.styleSelect.value;
    const stylePrompt = STYLES[styleKey]?.prompt || '';

    // Get Text Settings
    const textStylePrompt = TEXT_STYLES[elements.textStyle.value]?.prompt || '';
    const textPositionPrompt = TEXT_POSITIONS[elements.textPosition.value]?.prompt || '';
    const textLanguagePrompt = TEXT_LANGUAGES[elements.textLanguage.value]?.prompt || '';

    // Get Background
    let bgPrompt = '';
    switch (elements.bgColor.value) {
        case 'green':
            bgPrompt = 'Solid bright green (#00FF00) for chroma key';
            break;
        case 'white':
            bgPrompt = 'Pure white (#FFFFFF)';
            break;
        case 'custom':
            bgPrompt = elements.bgColorPicker.value.toUpperCase();
            break;
    }

    // Build Text Style Line
    let textStyleLine = '';
    const textParts = [textStylePrompt, textLanguagePrompt].filter(p => p);
    if (textParts.length > 0) {
        textStyleLine = `**Text Style:** ${textParts.join(', ')}.`;
    }

    // Build Action List
    let actionList = '';
    const items = currentItems.slice(0, count);
    items.forEach((item, index) => {
        if (item.action || item.text) {
            const textPart = item.text ? `, with text "${item.text}"${textPositionPrompt ? ' ' + textPositionPrompt : ''}` : '';
            actionList += `${index + 1}. ${item.action}${textPart}.\n`;
        }
    });

    // Check if no text mode
    const isNoText = elements.textLanguage.value === 'none';
    const criticalNote = isNoText
        ? ''
        : `**CRITICAL:** Try to render the text exactly as written.\n\n`;

    // Check if green screen mode
    const isGreenScreen = elements.bgColor.value === 'green';

    // Build Constraints with precise dimensions
    let constraintsList = `* **Canvas Size:** Exactly ${layoutInfo.width}x${layoutInfo.height} pixels (aspect ratio ${layoutInfo.ratio}).
* **Grid Layout:** ${layoutInfo.cols} columns × ${layoutInfo.rows} rows, each cell is 370×320 pixels.
* **No Extra Margins:** Stickers must fill the entire canvas with no padding or borders around the grid.
* **Background:** ${bgPrompt}.`;

    // Add strict green screen instructions
    if (isGreenScreen) {
        constraintsList += `
* **CRITICAL - GREEN SCREEN RULES:**
  - The ENTIRE background must be solid bright green (#00FF00).
  - NO grid lines, borders, dividers, or separators between stickers.
  - NO white lines, NO frames, NO outlines around individual stickers.
  - Characters should have a visible outline/stroke to separate from green background.
  - The green must be uniform and continuous across the entire canvas.
  - **Do NOT use green color** for the character's clothing or accessories to prevent chroma key issues.`;
    }

    if (!isNoText && textLanguagePrompt) {
        constraintsList += `\n* **Text Rendering:** Text must be legible, ${textLanguagePrompt}, distinct from the background.`;
    }

    // Generate Final Prompt
    const prompt = `${refImageInstruction}**[Role & Style]**
Create a "Character Sheet" containing ${count} distinct sticker designs arranged in a ${layoutInfo.grid} grid.
**Canvas:** ${layoutInfo.width}×${layoutInfo.height} px (${layoutInfo.cols} columns × ${layoutInfo.rows} rows). Each sticker cell is exactly 370×320 px. NO extra margins or padding.
**Style:** ${stylePrompt}, clean background.
**Character:** ${characterPrompt}.
${textStyleLine}
**Use your creative imagination to vary poses, facial expressions, and small details while keeping the main elements and text exact.**

**[Action Request - Batch 1]**
Generate ${count} variations. ${criticalNote}${actionList}
**[Constraints]**
${constraintsList}`;

    return prompt.trim();
}

// =========================================
// Actions
// =========================================

function copyPrompt() {
    const prompt = elements.promptOutput.textContent;
    navigator.clipboard.writeText(prompt).then(() => {
        elements.copyStatus.textContent = '✅ 已複製到剪貼簿！';
        showToast('已複製到剪貼簿！', 'success');
        setTimeout(() => {
            elements.copyStatus.textContent = '';
        }, 3000);
    }).catch(() => {
        showToast('複製失敗，請手動複製', 'error');
    });
}

function resetAll() {
    elements.characterTemplate.value = 'chibi_girl';
    elements.characterCustom.classList.add('hidden');
    elements.customCharacter.value = '';
    elements.themeSelect.value = 'greetings';
    elements.styleSelect.value = 'cute_chibi';
    elements.textStyle.value = 'default';
    elements.textPosition.value = 'default';
    elements.textLanguage.value = 'default';
    elements.outputCount.value = '9';
    elements.bgColor.value = 'white';
    elements.customBgColor.classList.add('hidden');

    loadThemeItems('greetings');
    updatePrompt();
    showToast('已重設所有設定', 'success');
}

// =========================================
// Settings Storage
// =========================================

function saveSettings() {
    const settings = {
        character: elements.characterTemplate.value,
        customCharacter: elements.customCharacter.value,
        theme: elements.themeSelect.value,
        style: elements.styleSelect.value,
        textStyle: elements.textStyle.value,
        textPosition: elements.textPosition.value,
        textLanguage: elements.textLanguage.value,
        outputCount: elements.outputCount.value,
        bgColor: elements.bgColor.value,
        bgColorPicker: elements.bgColorPicker.value,
        items: currentItems
    };

    localStorage.setItem('lineStickerSettings', JSON.stringify(settings));
    showToast('設定已儲存！', 'success');
}

function loadSettings() {
    const saved = localStorage.getItem('lineStickerSettings');
    if (!saved) {
        showToast('沒有找到已儲存的設定', 'error');
        return;
    }

    try {
        const settings = JSON.parse(saved);

        elements.characterTemplate.value = settings.character || 'chibi_girl';
        if (settings.character === 'custom') {
            elements.characterCustom.classList.remove('hidden');
            elements.customCharacter.value = settings.customCharacter || '';
        }

        elements.themeSelect.value = settings.theme || 'greetings';
        elements.styleSelect.value = settings.style || 'cute_chibi';
        elements.textStyle.value = settings.textStyle || 'default';
        elements.textPosition.value = settings.textPosition || 'default';
        elements.textLanguage.value = settings.textLanguage || 'default';
        elements.outputCount.value = settings.outputCount || '6';
        elements.bgColor.value = settings.bgColor || 'white';

        if (settings.bgColor === 'custom') {
            elements.customBgColor.classList.remove('hidden');
            elements.bgColorPicker.value = settings.bgColorPicker || '#FFFFFF';
        }

        if (settings.items) {
            currentItems = settings.items;
            renderStickerItems();
        }

        updatePrompt();
        showToast('設定已載入！', 'success');
    } catch (e) {
        showToast('載入設定失敗', 'error');
    }
}

function clearSettings() {
    localStorage.removeItem('lineStickerSettings');
    showToast('已清除儲存的設定', 'success');
}

// =========================================
// Reference Image Handlers
// =========================================



// =========================================
// Toast Notification
// =========================================

function showToast(message, type = 'success') {
    elements.toast.textContent = message;
    elements.toast.className = `toast ${type}`;
    elements.toast.classList.remove('hidden');

    // Trigger animation
    setTimeout(() => {
        elements.toast.classList.add('show');
    }, 10);

    // Hide after delay
    setTimeout(() => {
        elements.toast.classList.remove('show');
        setTimeout(() => {
            elements.toast.classList.add('hidden');
        }, 300);
    }, 2500);
}

// =========================================
// Start App
// =========================================

document.addEventListener('DOMContentLoaded', init);
