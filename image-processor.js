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

let userSeeds = []; // Array of {x, y} for manual flood fill seeds
let isDragging = false; // For Magic Wand Dragging
let dragPath = []; // Temporary path during drag
let eraserBoxes = []; // Array of {x, y, w, h}
let currentTool = 'wand'; // 'wand' or 'eraser'
let eraserStartPoint = null; // {x, y} for box drag start
let actionHistory = []; // Stack of {type: 'seed'|'box', data: ...}
let isLegacyMode = false;
let isDebackPreviewMode = false; // Preview mode for background removal

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

    // Preview
    canvasWrapper: document.getElementById('canvasWrapper'),
    previewCanvas: document.getElementById('previewCanvas'),
    gridOverlay: document.getElementById('gridOverlay'),

    // Actions
    backToUpload: document.getElementById('backToUpload'),
    cutBtn: document.getElementById('cutBtn'),
    startOverBtn: document.getElementById('startOverBtn'),
    undoBtn: document.getElementById('undoBtn'),
    legacyModeToggle: document.getElementById('legacyModeToggle'),

    // Results
    cutCount: document.getElementById('cutCount'),
    resultPreview: document.getElementById('resultPreview'),

    // Main Image Selection
    enableMainSelect: document.getElementById('enableMainSelect'),
    mainSelectHint: document.getElementById('mainSelectHint'),
    mainSelectInstruction: document.getElementById('mainSelectInstruction'),
    redownloadBtn: document.getElementById('redownloadBtn'),

    // Toast
    toast: document.getElementById('toast'),


    toleranceRange: document.getElementById('toleranceRange'),
    toleranceValue: document.getElementById('toleranceValue'),

    // Preview Deback Button
    previewDebackBtn: document.getElementById('previewDebackBtn')
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
    elements.moveDown.addEventListener('click', () => moveGrid(0, 10));
    elements.undoBtn.addEventListener('click', undoLastAction); // Undo

    // Toolbar
    // Toolbar
    elements.toleranceRange.addEventListener('input', (e) => {
        elements.toleranceValue.textContent = e.target.value;
        drawPreviewWithDeback();
    });

    // Tool Mode & Legacy
    document.querySelectorAll('input[name="toolMode"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            currentTool = e.target.value;
            showToast(`已切換模式：${currentTool === 'wand' ? '魔法棒' : '框選清除'}`);
        });
    });

    // Check if legacy toggle exists (in case HTML mismatch)
    if (elements.legacyModeToggle) {
        elements.legacyModeToggle.addEventListener('change', (e) => {
            isLegacyMode = e.target.checked;
            showToast(`已${isLegacyMode ? '開啟' : '關閉'}經典綠幕模式`);
            if (isDebackPreviewMode) {
                drawPreviewWithDeback();
            }
        });
    }

    // Magic Wand Interaction (Drag/Click)
    elements.previewCanvas.addEventListener('mousedown', handlePreviewMouseDown);
    elements.previewCanvas.addEventListener('mousemove', handlePreviewMouseMove);
    elements.previewCanvas.addEventListener('mouseup', handlePreviewMouseUp);
    elements.previewCanvas.addEventListener('mouseout', handlePreviewMouseUp); // Stop if leaving canvas

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

    // Preview Deback Button
    if (elements.previewDebackBtn) {
        elements.previewDebackBtn.addEventListener('click', toggleDebackPreview);
    }
}

// =========================================
// Toggle Deback Preview Mode
// =========================================

function toggleDebackPreview() {
    if (!imageElement) {
        showToast('請先上傳圖片', 'error');
        return;
    }

    isDebackPreviewMode = !isDebackPreviewMode;

    if (isDebackPreviewMode) {
        // Enable preview mode
        elements.previewDebackBtn.classList.add('active');
        elements.previewDebackBtn.innerHTML = '<span class="btn-icon">👁️</span> 關閉去背預覽';
        showToast('去背預覽模式已開啟 - 點擊圖片可增加去背點', 'success');
        drawPreviewWithDeback();
    } else {
        // Disable preview mode
        elements.previewDebackBtn.classList.remove('active');
        elements.previewDebackBtn.innerHTML = '<span class="btn-icon">👁️</span> 試看去背';
        showToast('去背預覽模式已關閉', 'success');
        drawPreview();
    }
}

function handlePreviewClick(e) {
    if (!isDebackPreviewMode || !imageElement) return;

    // Calculate click position relative to original image
    const rect = elements.previewCanvas.getBoundingClientRect();
    const scaleX = elements.previewCanvas.width / rect.width; // display vs internal canvas pixels
    const scaleY = elements.previewCanvas.height / rect.height;

    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    // Convert to original image coordinates
    // Canvas was drawn with scale = Math.min(1, maxWidth / imageElement.width)
    // So canvas.width = imageElement.width * scale
    // x_orig = clickX / scale

    // Note: The global 'scale' variable was set in drawPreview()
    const origX = clickX / scale;
    const origY = clickY / scale;

    // Add to seeds
    userSeeds.push({ x: origX, y: origY });

    showToast('已增加去背點', 'success');
    drawPreviewWithDeback();
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
    updateGridTotal();
}

function moveGrid(dx, dy) {
    offsetX += dx;
    offsetY += dy;
    // updateOffsetDisplay(); // Removed
    drawGridOverlay();
}


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

async function drawPreviewWithDeback() {
    if (!imageElement) return;

    showToast('正在產生去背預覽...', 'success');

    const canvas = elements.previewCanvas;
    const ctx = canvas.getContext('2d');

    // Use a temp canvas to process the full image at scale
    // Note: Applying flood fill on the scaled down canvas for performance in preview
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.drawImage(imageElement, 0, 0, tempCanvas.width, tempCanvas.height);

    // Apply Flood Fill
    // Scale user seeds to match the current canvas size
    const scaledSeeds = userSeeds.map(s => ({ x: s.x * scale, y: s.y * scale }));
    await applySmartFloodFill(tempCanvas, scaledSeeds);

    // Apply Eraser Boxes
    applyEraserBoxes(tempCanvas, scale);

    // Draw checkered background for transparency
    drawCheckeredBackground(ctx, canvas.width, canvas.height);

    // Draw processed image
    ctx.drawImage(tempCanvas, 0, 0);

    // Draw grid overlay
    drawGridOverlay();
}

function drawCheckeredBackground(ctx, w, h) {
    const size = 20;
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#dcdcdc';
    for (let y = 0; y < h; y += size) {
        for (let x = 0; x < w; x += size) {
            if ((x / size + y / size) % 2 === 0) {
                ctx.fillRect(x, y, size, size);
            }
        }
    }
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

    // 1. Process the FULL image first (Global Flood Fill)
    // This ensures consistency with preview and handles global "user seeds" correctly
    const fullProcessCanvas = document.createElement('canvas');
    fullProcessCanvas.width = imageElement.width;
    fullProcessCanvas.height = imageElement.height;
    const fullCtx = fullProcessCanvas.getContext('2d');
    fullCtx.drawImage(imageElement, 0, 0);

    // Apply Smart Flood Fill globally
    showToast('正在進行全圖去背...', 'success');
    await applySmartFloodFill(fullProcessCanvas, userSeeds);

    // Apply Smart Eraser Boxes
    applyEraserBoxes(fullProcessCanvas, 1);

    // 2. Cut from the PROCESSED canvas
    const cellWidth = imageElement.width / gridCols;
    const cellHeight = imageElement.height / gridRows;

    const zip = new JSZip();
    const folder = zip.folder('LINE_Stickers');

    for (let row = 0; row < gridRows; row++) {
        for (let col = 0; col < gridCols; col++) {
            const num = row * gridCols + col + 1;
            showToast(`裁切中... (${num}/${totalStickers})`, 'success');

            // Source position (with offset)
            const srcX = col * cellWidth + offsetX / scale;
            const srcY = row * cellHeight + offsetY / scale;

            // Create sticker canvas (370x320)
            const stickerCanvas = document.createElement('canvas');
            stickerCanvas.width = STICKER_WIDTH;
            stickerCanvas.height = STICKER_HEIGHT;
            const stickerCtx = stickerCanvas.getContext('2d');

            // Draw cropped portion from the ALREADY PROCESSED full canvas
            stickerCtx.drawImage(
                fullProcessCanvas,
                srcX, srcY, cellWidth, cellHeight,
                0, 0, STICKER_WIDTH, STICKER_HEIGHT
            );

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
// Smart Flood Fill (Magic Wand)
// =========================================

async function applySmartFloodFill(canvas, extraSeeds = []) {
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    const visited = new Uint8Array(width * height); // Shared visited map

    // Global Tolerance (for auto-detect)
    const globalTolerance = parseInt(elements.toleranceRange.value) || 60;

    // 1. Auto-Detect Background (Corners)
    const corners = [
        { x: 0, y: 0 },
        { x: width - 1, y: 0 },
        { x: 0, y: height - 1 },
        { x: width - 1, y: height - 1 }
    ];

    if (isLegacyMode) {
        // --- Legacy Mode: Simple Global Color Key (No Flood Fill) ---
        // Collect all target colors (Corners + User Seeds)
        const targetColors = [];

        // Add corners
        corners.forEach(corner => {
            const idx = (corner.y * width + corner.x) * 4;
            targetColors.push({
                r: data[idx],
                g: data[idx + 1],
                b: data[idx + 2],
                tolerance: globalTolerance
            });
        });

        // Add User Seeds
        if (extraSeeds && extraSeeds.length > 0) {
            extraSeeds.forEach(seed => {
                const tol = seed.tolerance !== undefined ? seed.tolerance : globalTolerance;
                let r, g, b;
                if (seed.color) {
                    r = seed.color.r;
                    g = seed.color.g;
                    b = seed.color.b;
                } else {
                    const idx = (Math.floor(seed.y) * width + Math.floor(seed.x)) * 4;
                    r = data[idx];
                    g = data[idx + 1];
                    b = data[idx + 2];
                }
                targetColors.push({ r, g, b, tolerance: tol });
            });
        }

        // Scan every pixel and check against all target colors
        // Optimization: If a pixel matches ANY target, clear it.
        for (let idx = 0; idx < data.length; idx += 4) {
            if (data[idx + 3] === 0) continue; // Already transparent

            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];

            for (let i = 0; i < targetColors.length; i++) {
                const target = targetColors[i];
                if (colorMatch(r, g, b, target.r, target.g, target.b, target.tolerance)) {
                    data[idx + 3] = 0;
                    break; // Cleared, move to next pixel
                }
            }
        }

    } else {
        // --- Normal Mode: Smart Flood Fill (BFS) ---
        corners.forEach(corner => {
            const idx = (corner.y * width + corner.x) * 4;
            const targetR = data[idx];
            const targetG = data[idx + 1];
            const targetB = data[idx + 2];

            floodFill(data, width, height, visited, corner.x, corner.y, targetR, targetG, targetB, globalTolerance);
        });

        // 2. Process User Seeds
        if (extraSeeds && extraSeeds.length > 0) {
            extraSeeds.forEach(seed => {
                // Validate bounds
                if (seed.x >= 0 && seed.x < width && seed.y >= 0 && seed.y < height) {
                    // Use seed-specific tolerance/color if available, else fallback to global/current
                    const tol = seed.tolerance !== undefined ? seed.tolerance : globalTolerance;

                    let r, g, b;
                    if (seed.color) {
                        r = seed.color.r;
                        g = seed.color.g;
                        b = seed.color.b;
                    } else {
                        // Fallback: Sample current pixel color if not stored
                        // Note: If pixel is already cleared, this might be 0,0,0,0
                        const idx = (Math.floor(seed.y) * width + Math.floor(seed.x)) * 4;
                        r = data[idx];
                        g = data[idx + 1];
                        b = data[idx + 2];
                    }

                    floodFill(data, width, height, visited, Math.floor(seed.x), Math.floor(seed.y), r, g, b, tol);
                }
            });
        }
    }

    // 3. Post-processing: Global Masked Edge De-spill
    // We can assume green screen if ANY of the corners felt "greenish" or just run it generally?
    // The previous logic checked (0,0). Let's stick to checking (0,0) as a heuristic for now
    // or arguably we should run it everywhere. The logic is safe because it only cleans green pixels at edges.

    // Check top-left corner original color for heuristic
    // Wait, original data is modified. We need original logic.
    // The previous logic used 'targetR, targetG...' from (0,0).
    // Let's re-implement similar heuristic.

    // Copy original for neighbor checking (since we modified data in place with alpha=0)
    // Actually, Despill loop checks 'data' directly to find transparent boundaries.

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 4;

            // Skip fully transparent
            if (data[idx + 3] === 0) continue;

            // Check 8-neighbors to detect if this pixel is on the edge (adjacent to transparency)
            let isEdge = false;

            const checkTransparent = (nx, ny) => {
                if (nx < 0 || nx >= width || ny < 0 || ny >= height) return true; // Image boundary is edge
                return data[(ny * width + nx) * 4 + 3] === 0;
            };

            // Check immediate neighbors (4-connected)
            if (checkTransparent(x - 1, y) || checkTransparent(x + 1, y) ||
                checkTransparent(x, y - 1) || checkTransparent(x, y + 1)) {
                isEdge = true;
            }
            // Check diagonals
            else if (checkTransparent(x - 1, y - 1) || checkTransparent(x + 1, y - 1) ||
                checkTransparent(x - 1, y + 1) || checkTransparent(x + 1, y + 1)) {
                isEdge = true;
            }

            // Only De-spill if it's an edge pixel
            if (isEdge) {
                const r = data[idx];
                const g = data[idx + 1];
                const b = data[idx + 2];

                // Green Spill Removal for White/Bright Edges (Strict)
                if (g > 180 && r > 150 && b > 150 && g > r && g > b) {
                    data[idx + 1] = Math.max(r, b);
                }
                // General Green Edge Cleanup (Milder)
                else if (g > r + 30 && g > b + 30 && g > 100) {
                    data[idx + 1] = (r + b) / 2;
                }
            }
        }
    }

    ctx.putImageData(imageData, 0, 0);

    return new Promise(resolve => {
        canvas.toBlob(resolve, 'image/png');
    });
}

function floodFill(data, width, height, visited, startX, startY, targetR, targetG, targetB, tolerance) {
    const startIdx = startY * width + startX;

    // If start pixel is already visited/cleared, or doesn't match target, fast return?
    // Actually, if we pass distinct targetColor, we should check opacity.

    const stack = [[startX, startY]];

    while (stack.length > 0) {
        const [x, y] = stack.pop();
        const idx = y * width + x;

        if (visited[idx]) continue;
        visited[idx] = 1;

        const pixelIdx = idx * 4;
        const r = data[pixelIdx];
        const g = data[pixelIdx + 1];
        const b = data[pixelIdx + 2];

        // Check if color matches target
        if (colorMatch(r, g, b, targetR, targetG, targetB, tolerance)) {
            // Make transparent
            data[pixelIdx + 3] = 0;

            // Add neighbors
            if (x > 0) stack.push([x - 1, y]);
            if (x < width - 1) stack.push([x + 1, y]);
            if (y > 0) stack.push([x, y - 1]);
            if (y < height - 1) stack.push([x, y + 1]);
        }
    }
}

function colorMatch(r1, g1, b1, r2, g2, b2, tolerance) {
    return Math.abs(r1 - r2) <= tolerance &&
        Math.abs(g1 - g2) <= tolerance &&
        Math.abs(b1 - b2) <= tolerance;
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
// Magic Wand Drag Handlers
// =========================================

let previewBackup = null;

function handlePreviewMouseDown(e) {
    if (!isDebackPreviewMode || !imageElement) return;

    isDragging = true;

    if (currentTool === 'wand') {
        dragPath = [];
        addSeedFromEvent(e);
    } else {
        const ctx = elements.previewCanvas.getContext('2d');
        previewBackup = ctx.getImageData(0, 0, elements.previewCanvas.width, elements.previewCanvas.height);

        const rect = elements.previewCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const sX = elements.previewCanvas.width / rect.width;
        const sY = elements.previewCanvas.height / rect.height;

        eraserStartPoint = { x: x * sX, y: y * sY };
    }
}

function handlePreviewMouseMove(e) {
    if (!isDragging || !isDebackPreviewMode) return;

    const ctx = elements.previewCanvas.getContext('2d');
    const rect = elements.previewCanvas.getBoundingClientRect();

    if (currentTool === 'wand') {
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
        ctx.lineCap = 'round';

        if (dragPath.length > 0) {
            const last = dragPath[dragPath.length - 1];
            const sX = elements.previewCanvas.width / rect.width;
            const sY = elements.previewCanvas.height / rect.height;

            ctx.beginPath();
            ctx.moveTo(last.displayX, last.displayY);
            ctx.lineTo(x * sX, y * sY);
            ctx.stroke();
        }
        addSeedFromEvent(e);

    } else {
        // Eraser
        if (previewBackup) {
            ctx.putImageData(previewBackup, 0, 0);
        }

        const sX = elements.previewCanvas.width / rect.width;
        const sY = elements.previewCanvas.height / rect.height;

        const x = (e.clientX - rect.left) * sX;
        const y = (e.clientY - rect.top) * sY;

        const w = x - eraserStartPoint.x;
        const h = y - eraserStartPoint.y;

        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;
        ctx.strokeRect(eraserStartPoint.x, eraserStartPoint.y, w, h);
    }
}

function handlePreviewMouseUp(e) {
    if (!isDragging) return;
    isDragging = false;

    if (currentTool === 'wand') {
        const pathCopy = [...dragPath];
        if (pathCopy.length > 0) {
            // Add all points in drag path as seeds
            userSeeds.push(...pathCopy);

            // Record this batch as ONE action
            actionHistory.push({
                type: 'seed_batch',
                count: pathCopy.length
            });

            showToast(`已新增 ${pathCopy.length} 個去背點`, 'success');
            drawPreviewWithDeback();
        }
        dragPath = [];
    } else {
        // Eraser
        const rect = elements.previewCanvas.getBoundingClientRect();
        const sX = elements.previewCanvas.width / rect.width;
        const sY = elements.previewCanvas.height / rect.height;

        const x = (e.clientX - rect.left) * sX;
        const y = (e.clientY - rect.top) * sY;

        const w = x - eraserStartPoint.x;
        const h = y - eraserStartPoint.y;

        // Normalize rect
        const finalX = w < 0 ? x : eraserStartPoint.x;
        const finalY = h < 0 ? y : eraserStartPoint.y;
        const finalW = Math.abs(w);
        const finalH = Math.abs(h);

        if (finalW > 1 && finalH > 1) {
            const currentTol = parseInt(elements.toleranceRange.value) || 60;
            const newBox = {
                x: finalX / scale,
                y: finalY / scale,
                w: finalW / scale,
                h: finalH / scale,
                tolerance: currentTol
            };
            eraserBoxes.push(newBox);

            actionHistory.push({
                type: 'box',
                data: newBox
            });

            showToast('已增加清除範圍', 'success');
            drawPreviewWithDeback();
        }
        previewBackup = null;
    }
}

function undoLastAction() {
    if (actionHistory.length === 0) {
        showToast('沒有可復原的動作', 'info');
        return;
    }

    const lastAction = actionHistory.pop();

    if (lastAction.type === 'seed_batch') {
        // Remove the last 'count' seeds from userSeeds
        userSeeds.splice(userSeeds.length - lastAction.count, lastAction.count);
        showToast(`已復原 ${lastAction.count} 個去背點`, 'info');
    } else if (lastAction.type === 'box') {
        // Remove the last box from eraserBoxes
        const removedBox = eraserBoxes.pop();
        showToast('已復原清除範圍', 'info');
    } else if (lastAction.type === 'seed_click') {
        // Remove the last single seed from userSeeds
        userSeeds.pop();
        showToast('已復原去背點', 'info');
    }

    drawPreviewWithDeback();
}

function applyEraserBoxes(canvas, s) {
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Smart Erase: Only remove pixels matching background color
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    const globalTolerance = parseInt(elements.toleranceRange.value) || 60;

    // Determine Reference Background Color correctly
    // We cannot trust 'data[0]' because it might be transparent (alpha=0) from flood fill
    // We must sample the original imageElement's (0,0) pixel

    // Create a 1x1 temp canvas to sample the original source color
    const refCanvas = document.createElement('canvas');
    refCanvas.width = 1;
    refCanvas.height = 1;
    const refCtx = refCanvas.getContext('2d');
    if (imageElement) {
        refCtx.drawImage(imageElement, 0, 0); // Draws top-left corner
    }
    const refData = refCtx.getImageData(0, 0, 1, 1).data;
    const bgR = refData[0];
    const bgG = refData[1];
    const bgB = refData[2];

    eraserBoxes.forEach(box => {
        // Convert box coords to current canvas coords
        const bx = Math.floor(box.x * s);
        const by = Math.floor(box.y * s);
        const bw = Math.floor(box.w * s);
        const bh = Math.floor(box.h * s);

        const startX = Math.max(0, bx);
        const startY = Math.max(0, by);
        const endX = Math.min(width, bx + bw);
        const endY = Math.min(height, by + bh);

        // Pass 1: Erase matching background pixels
        for (let y = startY; y < endY; y++) {
            for (let x = startX; x < endX; x++) {
                const idx = (y * width + x) * 4;

                // If pixel is not already transparent
                if (data[idx + 3] !== 0) {
                    const r = data[idx];
                    const g = data[idx + 1];
                    const b = data[idx + 2];

                    // Use per-box tolerance, boosted by 1.5x
                    const boxTol = (box.tolerance !== undefined ? box.tolerance : globalTolerance) * 1.5;

                    if (colorMatch(r, g, b, bgR, bgG, bgB, boxTol)) {
                        data[idx + 3] = 0;
                    }
                }
            }
        }

        // Pass 2: Despill / Edge Cleanup within the box
        for (let y = startY; y < endY; y++) {
            for (let x = startX; x < endX; x++) {
                const idx = (y * width + x) * 4;
                if (data[idx + 3] === 0) continue;

                // Check if it's an edge (adjacent to transparent)
                let isEdge = false;
                const checkTransparent = (nx, ny) => {
                    if (nx < 0 || nx >= width || ny < 0 || ny >= height) return true;
                    return data[(ny * width + nx) * 4 + 3] === 0;
                };

                if (checkTransparent(x - 1, y) || checkTransparent(x + 1, y) ||
                    checkTransparent(x, y - 1) || checkTransparent(x, y + 1)) {
                    isEdge = true;
                }

                if (isEdge) {
                    const r = data[idx];
                    const g = data[idx + 1];
                    const b = data[idx + 2];

                    if (g > 180 && r > 150 && b > 150 && g > r && g > b) {
                        data[idx + 1] = Math.max(r, b);
                    }
                    else if (g > r + 30 && g > b + 30 && g > 100) {
                        data[idx + 1] = (r + b) / 2;
                    }
                }
            }
        }
    });

    ctx.putImageData(imageData, 0, 0);
}

function addSeedFromEvent(e) {
    const rect = elements.previewCanvas.getBoundingClientRect();
    const scaleX = elements.previewCanvas.width / rect.width;
    const scaleY = elements.previewCanvas.height / rect.height;

    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    const origX = clickX / scale;
    const origY = clickY / scale;

    // Sample original color and tolerance
    const tolerance = parseInt(elements.toleranceRange.value) || 60;
    let color = null;

    if (imageElement) {
        // We need to sample from the original image at origX, origY
        // Create 1x1 canvas
        const tempC = document.createElement('canvas');
        tempC.width = 1;
        tempC.height = 1;
        const tempCtx = tempC.getContext('2d');
        tempCtx.drawImage(imageElement, -1 * origX, -1 * origY); // Offset to draw pixel at 0,0
        const p = tempCtx.getImageData(0, 0, 1, 1).data;
        color = { r: p[0], g: p[1], b: p[2] };
    }

    const newSeed = {
        x: origX,
        y: origY,
        displayX: clickX,
        displayY: clickY,
        tolerance: tolerance,
        color: color
    };

    dragPath.push(newSeed);

    // Add to history (only if this is a click, dragging handles history separately?)
    // Actually addSeedFromEvent is called by drag.
    // We should probably group drag actions or just treat clicks as actions.
    // The current logic adds seeds CONTINUOUSLY during drag?
    // Let's check handlePreviewMouseMove.
    // If dragging, we add seeds.
    // If we want UNDO to undo a whole drag stroke, we need to group them.
    // BUT the current implementation of 'addSeedFromEvent' pushes to dragPath, not userSeeds yet?
    // userSeeds is updated in MouseUp.
    // Let's check MouseUp logic.
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

    // Clear history stack
    actionHistory = [];
    isLegacyMode = false;
    if (elements.legacyModeToggle) elements.legacyModeToggle.checked = false;

    // ... other resets ...
    userSeeds = []; // Reset seeds
    eraserBoxes = [];
    isDragging = false;
    currentTool = 'wand';
    eraserStartPoint = null;
    dragPath = [];
    cutStickers = [];
    elements.gridCols.value = '3';
    elements.gridRows.value = '3';
    updateGridTotal();
    elements.previewCanvas.getContext('2d').clearRect(0, 0, elements.previewCanvas.width, elements.previewCanvas.height);
    elements.gridOverlay.innerHTML = '';
    elements.resultPreview.innerHTML = '';

    // Reset preview mode
    isDebackPreviewMode = false;
    if (elements.previewDebackBtn) {
        elements.previewDebackBtn.classList.remove('active');
        elements.previewDebackBtn.innerHTML = '<span class="btn-icon">👁️</span> 試看去背';
    }
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
