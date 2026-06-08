**重要 — Git 歷史已改寫（Remove large JPGs）**

我已使用 `git-filter-repo` 清除舊版的 JPG 範例圖片並強制推送（force-push），因此遠端的 Git 歷史已改寫。這份說明告訴你如何安全地同步新的歷史，以及要注意的事項與給團隊的郵件範本。

---

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

---

**替代作法（若不想重新 clone，風險較高）**

若你理解風險且沒有未推送的本地修改，可以在本地執行下列命令以匹配改寫後的遠端：

```bash
git fetch origin --all
# 小心：以下命令會覆寫本地所有未提交/未推送的變更！
git reset --hard origin/master
git clean -fdx
```

若你有本地分支重要修改，請務必先備份（`git branch backup-my-work`、`git format-patch`、或推到你自有遠端）。

---

**同步後的清理（選做）**

要嘗試在本地回收已刪除物件，可執行：

```bash
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

注意：這僅清理本地物件，GitHub 端的實際儲存回收由 GitHub 確認並清理（通常需要一段時間）。

---

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

若你要我幫忙聯絡團隊或直接在 repo 加上 `README.md` 的同步說明，我可以把上面的內容寫入 `README.md` 或發送郵件草稿給你。要我怎麼做下一步？
