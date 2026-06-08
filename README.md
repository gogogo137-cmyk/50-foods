# 50-foods

示範用的美食資料庫與範例前後端專案（FastAPI + Next.js）。此倉庫包含示範資料、API 與前端範例，用於教學與快速原型。

## 目錄
- `backend/` — FastAPI 應用與資料來源
- `frontend/` — Next.js 前端（app router）

## 本地啟動（開發）

1. 啟動 backend：

```bash
cd backend
python -m venv .venv
source .venv/Scripts/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

2. 啟動 frontend：

```bash
cd frontend
npm install
npm run dev
# 前端預設在 http://localhost:3000，backend 在 http://localhost:8000
```

---

## 重要 — Git 歷史已改寫（Remove large JPGs）

我已使用 `git-filter-repo` 清除倉庫中舊版的 JPG 範例圖片並強制推送（force-push），因此遠端的 Git 歷史已改寫。請參考下列步驟安全地同步新的歷史：

**最重要（推薦作法） — 重新 clone（最簡單、最安全）**

1. 備份你本地的未推送變更（若有）：

```bash
# 在其他位置建立補救備份
git format-patch origin/master..HEAD -o ~/my-patches
# 或把暫存分支推到你自己的遠端
git push <your-fork> HEAD:backup-my-work
```

2. 刪除或移動你現在的本地倉庫資料夾，然後重新 clone：

```bash
cd ~/projects
rm -rf 50-foods
git clone https://github.com/gogogo137-cmyk/50-foods.git
cd 50-foods
```

這樣可以確保你拿到的是改寫後、乾淨的歷史。

**替代作法（若不想重新 clone，風險較高）**

若你理解風險且沒有未推送的本地修改，可以在本地執行下列命令以匹配改寫後的遠端：

```bash
git fetch origin --all
# 小心：以下命令會覆寫本地所有未提交/未推送的變更！
git reset --hard origin/master
git clean -fdx
```

若你有本地分支重要修改，請務必先備份（`git branch backup-my-work`、`git format-patch`、或推到你自有遠端）。

**同步後的清理（選做）**

要嘗試在本地回收已刪除物件，可執行：

```bash
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

注意：這僅清理本地物件，GitHub 端的實際儲存回收由 GitHub 確認並清理（通常需要一段時間）。

**給團隊的郵件 / 訊息範本**

主旨：重要 — repo 歷史已改寫（移除大型 JPG 檔），請重新同步

內容（可直接複製）：

```
大家好，

我剛剛在 `50-foods` 倉庫執行了歷史清理（刪除了 20 張示範 JPG 圖片並改寫 Git 歷史），並已強制推送到 `origin/master`。

影響：
- 遠端已被 force-push，舊的 commit id 不再對應。若你本地有尚未推送的修改，請先備份這些修改（`git format-patch` 或推到你自己的 fork）。

建議步驟（最安全）：
1. 備份你本地的重要修改（若有）。
2. 刪除本地 repo，重新 clone：
   git clone https://github.com/gogogo137-cmyk/50-foods.git

若你無法重新 clone，也可以使用：
   git fetch origin --all
   git reset --hard origin/master
   git clean -fdx

如有疑問或需要我協助搬移你尚未推送的工作，請回覆我。

謝謝！
```

---

若要我同時在主 repo（`L1`）建立 Issue 或 PR 通知團隊，請告訴我。已把此操作標記為完成。 
