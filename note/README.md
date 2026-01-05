# 專案啟動方式

本專案包含兩個主要工具，均為靜態網頁，無需安裝伺服器，直接使用瀏覽器開啟即可。

## 1. LINE 貼圖 Prompt 產生器
* **檔案**：`index.html`
* **功能**：產生 LINE 貼圖專用的 AI 繪圖 Prompt，支援自訂角色、主題、風格與文字設定。
* **啟動**：雙擊 `index.html` 開啟。

## 2. 圖片處理器
* **檔案**：`image-processor.html`
* **功能**：對生成的圖片進行後製處理。
* **啟動**：雙擊 `image-processor.html` 開啟，或由 Prompt 產生器頁面右上角連結前往。

## 3. 啟動本地伺服器 (Port 8080)
若需要透過網頁伺服器（Web Server）訪問（例如為了避免 CORS 問題或透過區域網路分享），可以使用以下方式：

* **快速啟動**：
    1. 雙擊執行專案根目錄下的 `start_server.bat`。
    2. 瀏覽器開啟 [http://localhost:8080](http://localhost:8080)。

* **手動啟動 (Command Line)**：
    * **Python**: `python -m http.server 8080`
    * **Node.js (npx)**: `npx http-server -p 8080`

## 4. Ollama 模型設定 (可選)
若您計畫搭配本機 LLM 使用 (例如用於 RAG 或 Prompt 增強)，請確保已下載相關模型：
* **Embedding 模型**: `ollama pull qwen3-embedding`

---
**💡 提示**：
* 建議使用 Chrome, Edge 或 Firefox 瀏覽器。
* 設定會自動儲存在瀏覽器中（Local Storage）。
