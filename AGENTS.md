# AGENTS.md

## Language

- 所有回覆使用繁體中文（台灣）
- 程式碼命名維持英文
- Commit Message 使用英文

## Safety Rules

未經我的確認，不可執行以下操作：

- git push
- git push --force
- git reset --hard
- git rebase
- git clean
- git tag
- rm
- rm -rf
- 刪除任何檔案
- 覆蓋現有重要檔案
- 安裝或移除套件
- 修改環境變數
- 修改 .env 檔案

執行上述操作前：

1. 說明原因
2. 顯示即將執行的指令
3. 等待我的確認

## Development Rules

- 一次只完成一個需求
- 完成後停止等待 Review
- 不要自行新增功能
- 不要修改與需求無關的程式碼
- 優先修改最少的檔案

## Coding Style

- JavaScript
- React
- Function Component
- Arrow Function
- 使用 Bootstrap
- ESLint 不可有 Error

## Git Rules

- 不要自動 Commit
- 不要自動 Push
- 每次 Commit 前先產生 Commit Message 建議
- 等待我確認後再 Commit

## File Rules

- 不要刪除任何檔案
- 如果需要刪除，請先提出原因

## Package Rules

- 不要自行安裝新套件
- 如需安裝，請先說明：
  - 套件名稱
  - 用途
  - 為什麼需要

## Review Rules

完成需求後：

- 說明修改哪些檔案
- 說明修改原因
- 等待我 Review
