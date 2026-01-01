// =========================================
// LINE 貼圖裁切工具 - 主程式
// =========================================

// LINE Sticker Specifications
const STICKER_WIDTH = 370;
const STICKER_HEIGHT = 320;

// State
let uploadedImage = null;
let imageElement = null;
let gridCols = 3;
let gridRows = 3;
let offsetX = 0;
let offsetY = 0;
let scale = 1;
let cutStickers = [];
let selectedMainIndex = 0; // Index of sticker to use as main.png

// DOM Elements
const elements = {
    // Steps
    step1: document.getElementById('step1'),
    step2: document.getElementById('step2'),
    step3: document.getElementById('step3'),

    // Upload
    uploadZone: document.getElementById('uploadZone'),
    fileInput: document.getElementById('fileInput'),

    // Grid Settings
    gridCols: document.getElementById('gridCols'),
    gridRows: document.getElementById('gridRows'),
    gridTotal: document.getElementById('gridTotal'),
    moveLeft: document.getElementById('moveLeft'),
    moveRight: document.getElementById('moveRight'),
    moveUp: document.getElementById('moveUp'),
    moveDown: document.getElementById('moveDown'),
    offsetDisplay: document.getElementById('offsetDisplay'),
    resetOffset: document.getElementById('resetOffset'),

    // Preview
    canvasWrapper: document.getElementById('canvasWrapper'),
    previewCanvas: document.getElementById('previewCanvas'),
    gridOverlay: document.getElementById('gridOverlay'),

    // Actions
    backToUpload: document.getElementById('backToUpload'),
    cutBtn: document.getElementById('cutBtn'),
    startOverBtn: document.getElementById('startOverBtn'),

    // Results
    cutCount: document.getElementById('cutCount'),
    resultPreview: document.getElementById('resultPreview'),

    // Main Image Selection
    enableMainSelect: document.getElementById('enableMainSelect'),
    mainSelectHint: document.getElementById('mainSelectHint'),
    mainSelectInstruction: document.getElementById('mainSelectInstruction'),
    redownloadBtn: document.getElementById('redownloadBtn'),

    // Toast
    toast: document.getElementById('toast')
};

// =========================================
// Initialization
// =========================================

function init() {
    bindEvents();
}

function bindEvents() {
    // Upload Zone
    elements.uploadZone.addEventListener('click', () => elements.fileInput.click());
    elements.uploadZone.addEventListener('dragover', handleDragOver);
    elements.uploadZone.addEventListener('dragleave', handleDragLeave);
    elements.uploadZone.addEventListener('drop', handleDrop);
    elements.fileInput.addEventListener('change', handleFileSelect);

    // Grid Settings
    elements.gridCols.addEventListener('change', updateGridSettings);
    elements.gridRows.addEventListener('change', updateGridSettings);

    // Position Controls
    elements.moveLeft.addEventListener('click', () => moveGrid(-10, 0));
    elements.moveRight.addEventListener('click', () => moveGrid(10, 0));
    elements.moveUp.addEventListener('click', () => moveGrid(0, -10));
    elements.moveDown.addEventListener('click', () => moveGrid(0, 10));
    elements.resetOffset.addEventListener('click', resetGridOffset);

    // Actions
    elements.backToUpload.addEventListener('click', () => {
        showStep(1);
        resetAll();
    });
    elements.cutBtn.addEventListener('click', cutAndDownload);
    elements.startOverBtn.addEventListener('click', () => {
        showStep(1);
        resetAll();
    });

    // Main Image Selection
    elements.enableMainSelect.addEventListener('change', toggleMainSelect);
    elements.redownloadBtn.addEventListener('click', redownloadWithNewMain);
}

// =========================================
// File Upload Handlers
// =========================================

function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    elements.uploadZone.classList.add('dragover');
}

function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    elements.uploadZone.classList.remove('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    elements.uploadZone.classList.remove('dragover');

    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type.startsWith('image/')) {
        loadImage(files[0]);
    }
}

function handleFileSelect(e) {
    const files = e.target.files;
    if (files.length > 0) {
        loadImage(files[0]);
    }
    e.target.value = '';
}

function loadImage(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        uploadedImage = e.target.result;
        imageElement = new Image();
        imageElement.onload = () => {
            // Auto-detect grid size based on image aspect ratio
            autoDetectGridSize();
            showStep(2);
            drawPreview();
        };
        imageElement.src = uploadedImage;
    };
    reader.readAsDataURL(file);
}

// =========================================
// Grid Detection & Settings
// =========================================

function autoDetectGridSize() {
    if (!imageElement) return;

    const imgRatio = imageElement.width / imageElement.height;
    const stickerRatio = STICKER_WIDTH / STICKER_HEIGHT;

    // Try common grid sizes and find best match
    const gridOptions = [
        [1, 1], [2, 2], [3, 2], [3, 3], [4, 2], [4, 3], [4, 4],
        [5, 3], [5, 4], [6, 4], [5, 5], [6, 5], [6, 6]
    ];

    let bestMatch = [3, 3];
    let bestDiff = Infinity;

    for (const [cols, rows] of gridOptions) {
        const gridRatio = (cols * STICKER_WIDTH) / (rows * STICKER_HEIGHT);
        const diff = Math.abs(gridRatio - imgRatio);
        if (diff < bestDiff) {
            bestDiff = diff;
            bestMatch = [cols, rows];
        }
    }

    gridCols = bestMatch[0];
    gridRows = bestMatch[1];
    elements.gridCols.value = gridCols;
    elements.gridRows.value = gridRows;
    updateGridTotal();
}

function updateGridSettings() {
    gridCols = parseInt(elements.gridCols.value);
    gridRows = parseInt(elements.gridRows.value);
    updateGridTotal();
    drawPreview();
}

function updateGridTotal() {
    const total = gridCols * gridRows;
    elements.gridTotal.textContent = `= ${total} 張貼圖`;
}

function moveGrid(dx, dy) {
    offsetX += dx;
    offsetY += dy;
    updateOffsetDisplay();
    drawGridOverlay();
}

function resetGridOffset() {
    offsetX = 0;
    offsetY = 0;
    updateOffsetDisplay();
    drawGridOverlay();
}

function updateOffsetDisplay() {
    elements.offsetDisplay.textContent = `偏移: (${offsetX}, ${offsetY})`;
}

// =========================================
// Preview Drawing
// =========================================

function drawPreview() {
    if (!imageElement) return;

    const canvas = elements.previewCanvas;
    const ctx = canvas.getContext('2d');

    // Set canvas size to match image (scaled down if too large)
    const maxWidth = 900;
    scale = Math.min(1, maxWidth / imageElement.width);

    canvas.width = imageElement.width * scale;
    canvas.height = imageElement.height * scale;

    // Draw image
    ctx.drawImage(imageElement, 0, 0, canvas.width, canvas.height);

    // Draw grid overlay
    drawGridOverlay();
}

function drawGridOverlay() {
    const overlay = elements.gridOverlay;
    overlay.innerHTML = '';

    // Use percentage-based positioning for responsive display
    const cellWidthPercent = 100 / gridCols;
    const cellHeightPercent = 100 / gridRows;

    // Offset as percentage of canvas
    const canvas = elements.previewCanvas;
    const offsetXPercent = (offsetX / (canvas.width / scale)) * 100;
    const offsetYPercent = (offsetY / (canvas.height / scale)) * 100;

    // Draw outer border
    const border = document.createElement('div');
    border.className = 'grid-border';
    border.style.left = offsetXPercent + '%';
    border.style.top = offsetYPercent + '%';
    border.style.width = '100%';
    border.style.height = '100%';
    overlay.appendChild(border);

    // Draw vertical lines
    for (let i = 1; i < gridCols; i++) {
        const line = document.createElement('div');
        line.className = 'grid-line-v';
        line.style.left = (i * cellWidthPercent + offsetXPercent) + '%';
        overlay.appendChild(line);
    }

    // Draw horizontal lines
    for (let i = 1; i < gridRows; i++) {
        const line = document.createElement('div');
        line.className = 'grid-line-h';
        line.style.top = (i * cellHeightPercent + offsetYPercent) + '%';
        overlay.appendChild(line);
    }

    // Draw cell numbers
    for (let row = 0; row < gridRows; row++) {
        for (let col = 0; col < gridCols; col++) {
            const num = row * gridCols + col + 1;
            const label = document.createElement('div');
            label.className = 'grid-cell-number';
            label.textContent = num;
            label.style.left = (col * cellWidthPercent + offsetXPercent + 1) + '%';
            label.style.top = (row * cellHeightPercent + offsetYPercent + 1) + '%';
            overlay.appendChild(label);
        }
    }
}

// =========================================
// Cut and Download
// =========================================

async function cutAndDownload() {
    if (!imageElement) return;

    const totalStickers = gridCols * gridRows;
    showToast(`正在處理 ${totalStickers} 張貼圖...`, 'success');
    cutStickers = [];

    // Calculate actual cell size from original image
    const cellWidth = imageElement.width / gridCols;
    const cellHeight = imageElement.height / gridRows;

    const zip = new JSZip();
    const folder = zip.folder('LINE_Stickers');

    // Cut each cell
    for (let row = 0; row < gridRows; row++) {
        for (let col = 0; col < gridCols; col++) {
            const num = row * gridCols + col + 1;
            showToast(`去背中... (${num}/${totalStickers})`, 'success');

            // Create temp canvas to crop this cell
            const cropCanvas = document.createElement('canvas');
            cropCanvas.width = cellWidth;
            cropCanvas.height = cellHeight;
            const cropCtx = cropCanvas.getContext('2d');

            // Source position (with offset)
            const srcX = col * cellWidth + offsetX / scale;
            const srcY = row * cellHeight + offsetY / scale;

            // Draw cropped portion
            cropCtx.drawImage(
                imageElement,
                srcX, srcY, cellWidth, cellHeight,
                0, 0, cellWidth, cellHeight
            );

            // Remove green background
            const resultBlob = await chromaKeyRemoval(cropCanvas);

            // Create final sticker canvas (370x320)
            const stickerCanvas = document.createElement('canvas');
            stickerCanvas.width = STICKER_WIDTH;
            stickerCanvas.height = STICKER_HEIGHT;
            const stickerCtx = stickerCanvas.getContext('2d');

            // Load result and draw scaled to sticker size
            const resultImg = await loadImageFromBlob(resultBlob);
            stickerCtx.drawImage(resultImg, 0, 0, STICKER_WIDTH, STICKER_HEIGHT);

            // Convert to blob and add to ZIP
            const finalBlob = await new Promise(resolve => {
                stickerCanvas.toBlob(resolve, 'image/png');
            });

            const filename = `${String(num).padStart(2, '0')}.png`;
            folder.file(filename, finalBlob);

            // Save for preview
            cutStickers.push({
                num: num,
                dataUrl: stickerCanvas.toDataURL('image/png')
            });
        }
    }

    // Generate main.png (240x240) - using first sticker
    if (cutStickers.length > 0) {
        const mainCanvas = document.createElement('canvas');
        mainCanvas.width = 240;
        mainCanvas.height = 240;
        const mainCtx = mainCanvas.getContext('2d');

        const firstImg = new Image();
        firstImg.src = cutStickers[0].dataUrl;
        await new Promise(resolve => { firstImg.onload = resolve; });

        // Center and fit the sticker in square
        const scale = Math.min(240 / STICKER_WIDTH, 240 / STICKER_HEIGHT);
        const w = STICKER_WIDTH * scale;
        const h = STICKER_HEIGHT * scale;
        const x = (240 - w) / 2;
        const y = (240 - h) / 2;
        mainCtx.drawImage(firstImg, x, y, w, h);

        const mainBlob = await new Promise(resolve => {
            mainCanvas.toBlob(resolve, 'image/png');
        });
        folder.file('main.png', mainBlob);
    }

    // Generate tab.png (96x74) - using first sticker
    if (cutStickers.length > 0) {
        const tabCanvas = document.createElement('canvas');
        tabCanvas.width = 96;
        tabCanvas.height = 74;
        const tabCtx = tabCanvas.getContext('2d');

        const firstImg = new Image();
        firstImg.src = cutStickers[0].dataUrl;
        await new Promise(resolve => { firstImg.onload = resolve; });

        // Center and fit the sticker
        const scale = Math.min(96 / STICKER_WIDTH, 74 / STICKER_HEIGHT);
        const w = STICKER_WIDTH * scale;
        const h = STICKER_HEIGHT * scale;
        const x = (96 - w) / 2;
        const y = (74 - h) / 2;
        tabCtx.drawImage(firstImg, x, y, w, h);

        const tabBlob = await new Promise(resolve => {
            tabCanvas.toBlob(resolve, 'image/png');
        });
        folder.file('tab.png', tabBlob);
    }

    // Add readme
    const readme = `LINE 貼圖上傳說明
==================

檔案清單:
- main.png (240x240) - 貼圖首頁圖示
- tab.png (96x74) - 聊天室選單圖示
- 01.png ~ ${String(gridCols * gridRows).padStart(2, '0')}.png - 貼圖 (${STICKER_WIDTH}x${STICKER_HEIGHT})

上傳步驟:
1. 前往 LINE Creators Market (https://creator.line.me/)
2. 登入並建立新貼圖
3. 上傳 main.png 作為主圖
4. 上傳 tab.png 作為標籤圖
5. 上傳所有編號 PNG 作為貼圖
6. 填寫資訊並送審

產生時間: ${new Date().toLocaleString('zh-TW')}
`;
    folder.file('說明.txt', readme);

    // Generate and download ZIP
    const content = await zip.generateAsync({ type: 'blob' });
    const filename = `LINE_Stickers_${gridCols}x${gridRows}_${new Date().toISOString().slice(0, 10)}.zip`;

    saveAs(content, filename);

    // Show results
    showResults();
}

// =========================================
// Chroma Key (Green Screen) Removal
// =========================================

async function chromaKeyRemoval(canvas) {
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Green screen color range
    // Target: green hue (around 100-140), high saturation
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Check if pixel is green-ish
        // Green should be dominant and significantly higher than red/blue
        const isGreen = g > 80 &&
            g > r * 1.2 &&
            g > b * 1.2 &&
            Math.abs(r - b) < 80;

        if (isGreen) {
            data[i + 3] = 0; // Make transparent
        }
    }

    ctx.putImageData(imageData, 0, 0);

    return new Promise(resolve => {
        canvas.toBlob(resolve, 'image/png');
    });
}


function loadImageFromBlob(blob) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = URL.createObjectURL(blob);
    });
}


function showResults() {
    elements.cutCount.textContent = cutStickers.length;
    selectedMainIndex = 0; // Reset to first sticker
    elements.enableMainSelect.checked = false;
    elements.redownloadBtn.classList.add('hidden');
    elements.mainSelectInstruction.classList.add('hidden');
    elements.mainSelectHint.textContent = '（目前使用第一張）';

    // Generate preview grid
    elements.resultPreview.innerHTML = '';
    cutStickers.forEach((sticker, index) => {
        const img = document.createElement('img');
        img.src = sticker.dataUrl;
        img.alt = `Sticker ${sticker.num}`;
        img.title = `貼圖 ${sticker.num}`;
        img.dataset.index = index;
        if (index === 0) img.classList.add('selected');
        elements.resultPreview.appendChild(img);
    });

    showStep(3);
    showToast('ZIP 下載完成！', 'success');
}

function toggleMainSelect() {
    const enabled = elements.enableMainSelect.checked;
    const images = elements.resultPreview.querySelectorAll('img');

    if (enabled) {
        elements.mainSelectInstruction.classList.remove('hidden');
        images.forEach(img => {
            img.classList.add('selectable');
            img.addEventListener('click', selectMainSticker);
        });
    } else {
        elements.mainSelectInstruction.classList.add('hidden');
        images.forEach(img => {
            img.classList.remove('selectable');
            img.removeEventListener('click', selectMainSticker);
        });
    }
}

function selectMainSticker(e) {
    const index = parseInt(e.target.dataset.index);
    selectedMainIndex = index;

    // Update visual selection
    elements.resultPreview.querySelectorAll('img').forEach(img => {
        img.classList.remove('selected');
    });
    e.target.classList.add('selected');

    // Update hint and show re-download button
    elements.mainSelectHint.textContent = `（已選擇第 ${index + 1} 張）`;
    elements.redownloadBtn.classList.remove('hidden');

    showToast(`已選擇第 ${index + 1} 張作為主圖`, 'success');
}

async function redownloadWithNewMain() {
    showToast('正在產生新的 ZIP...', 'success');

    const zip = new JSZip();
    const folder = zip.folder('LINE_Stickers');

    // Add all stickers
    for (const sticker of cutStickers) {
        const response = await fetch(sticker.dataUrl);
        const blob = await response.blob();
        const filename = `${String(sticker.num).padStart(2, '0')}.png`;
        folder.file(filename, blob);
    }

    // Generate main.png from selected sticker
    const mainCanvas = document.createElement('canvas');
    mainCanvas.width = 240;
    mainCanvas.height = 240;
    const mainCtx = mainCanvas.getContext('2d');

    const selectedImg = new Image();
    selectedImg.src = cutStickers[selectedMainIndex].dataUrl;
    await new Promise(resolve => { selectedImg.onload = resolve; });

    const scale = Math.min(240 / STICKER_WIDTH, 240 / STICKER_HEIGHT);
    const w = STICKER_WIDTH * scale;
    const h = STICKER_HEIGHT * scale;
    const x = (240 - w) / 2;
    const y = (240 - h) / 2;
    mainCtx.drawImage(selectedImg, x, y, w, h);

    const mainBlob = await new Promise(resolve => {
        mainCanvas.toBlob(resolve, 'image/png');
    });
    folder.file('main.png', mainBlob);

    // Generate tab.png from selected sticker
    const tabCanvas = document.createElement('canvas');
    tabCanvas.width = 96;
    tabCanvas.height = 74;
    const tabCtx = tabCanvas.getContext('2d');

    const tabScale = Math.min(96 / STICKER_WIDTH, 74 / STICKER_HEIGHT);
    const tw = STICKER_WIDTH * tabScale;
    const th = STICKER_HEIGHT * tabScale;
    const tx = (96 - tw) / 2;
    const ty = (74 - th) / 2;
    tabCtx.drawImage(selectedImg, tx, ty, tw, th);

    const tabBlob = await new Promise(resolve => {
        tabCanvas.toBlob(resolve, 'image/png');
    });
    folder.file('tab.png', tabBlob);

    // Add readme
    const readme = `LINE 貼圖上傳說明
==================

檔案清單:
- main.png (240x240) - 貼圖首頁圖示（使用第 ${selectedMainIndex + 1} 張）
- tab.png (96x74) - 聊天室選單圖示
- 01.png ~ ${String(cutStickers.length).padStart(2, '0')}.png - 貼圖 (${STICKER_WIDTH}x${STICKER_HEIGHT})

上傳步驟:
1. 前往 LINE Creators Market (https://creator.line.me/)
2. 登入並建立新貼圖
3. 上傳 main.png 作為主圖
4. 上傳 tab.png 作為標籤圖
5. 上傳所有編號 PNG 作為貼圖
6. 填寫資訊並送審

產生時間: ${new Date().toLocaleString('zh-TW')}
`;
    folder.file('說明.txt', readme);

    // Generate and download ZIP
    const content = await zip.generateAsync({ type: 'blob' });
    const filename = `LINE_Stickers_main${selectedMainIndex + 1}_${new Date().toISOString().slice(0, 10)}.zip`;

    saveAs(content, filename);
    showToast('新 ZIP 下載完成！', 'success');
}

// =========================================
// UI Helpers
// =========================================

function showStep(stepNumber) {
    document.querySelectorAll('.step-section').forEach((section, index) => {
        section.classList.toggle('active', index + 1 === stepNumber);
    });
}

function resetAll() {
    uploadedImage = null;
    imageElement = null;
    gridCols = 3;
    gridRows = 3;
    offsetX = 0;
    offsetY = 0;
    cutStickers = [];
    elements.gridCols.value = '3';
    elements.gridRows.value = '3';
    updateGridTotal();
    updateOffsetDisplay();
    elements.previewCanvas.getContext('2d').clearRect(0, 0, elements.previewCanvas.width, elements.previewCanvas.height);
    elements.gridOverlay.innerHTML = '';
    elements.resultPreview.innerHTML = '';
}

function showToast(message, type = 'success') {
    elements.toast.textContent = message;
    elements.toast.className = `toast ${type}`;
    elements.toast.classList.remove('hidden');
    setTimeout(() => elements.toast.classList.add('show'), 10);
    setTimeout(() => {
        elements.toast.classList.remove('show');
        setTimeout(() => elements.toast.classList.add('hidden'), 300);
    }, 2500);
}

// =========================================
// Start App
// =========================================

document.addEventListener('DOMContentLoaded', init);
