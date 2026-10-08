# BLITZ AI スクールのステータスライン

Claude Code の画面のいちばん下に、いまの使い方を出しっぱなしにする表示です。

```
CTX ███░░░░░░░ 28% │ 5h ██░░░░░░░░ 15% 2h24m │ 1w █░░░░░░░░░ 9% 6d17h
Opus │ renshu
```

- **CTX** … コンテキスト（AI が一度に覚えておける量）の使用率。30% で黄色、40% で赤になります。赤くなったら、/compact や /clear で整理する目安です
- **5h** … 5時間ごとの使用量の枠を、どれだけ使ったか。右は、枠が元に戻るまでの時間
- **1w** … 1週間ごとの使用量の枠を、どれだけ使ったか。右は、枠が元に戻るまでの時間
- 2行目 … いま使っているモデルの名前と、開いているフォルダの名前

5h と 1w は、その会話で最初の返事が出るまでは `--` と出ます。一度やり取りをすると数字に変わります。
数字が出るのは、Claude の Pro / Max の契約で Claude Code を使っているときです（API キーで使っているときは `--` のままです）。

## 入れ方

Claude Code に、このページのアドレスと次の一文を、同じ入力欄に入れて送ってください。

```
このページを見て、ステータスラインを私の環境に入れて
```

途中で許可を求められたら、内容を読んで許可してください。
入ったら、Claude Code を立ち上げ直してください。画面の下に CTX の棒が出れば成功です。

---

## Claude Code へ（入れる手順）

このページを読んだ Claude Code は、次の手順で入れてください。Windows・Mac のどちらでも同じです。
以下、`<ホーム>` は利用者のホームフォルダ（Windows `C:/Users/<名前>`／Mac `/Users/<名前>`）です。

1. **Node.js があるか確かめる**: `node -v` が v18 以上を返すこと。無ければ、入れ方を利用者に案内して止まる
2. **スクリプトを取ってきて置く**: 次のアドレスのファイルを、**そのままダウンロードして**
   `<ホーム>/.claude/blitz-statusline.js` に保存する（中身を書き写したり、書き換えたりしない）
   ```
   https://raw.githubusercontent.com/blitz-ai-school/blitz-statusline/main/blitz-statusline.js
   ```
   - 例（Windows・Mac とも）: `curl -fsSL <上のアドレス> -o "<ホーム>/.claude/blitz-statusline.js"`
     （Windows の PowerShell では `curl` ではなく `curl.exe` と打つ）
   - どうしても書き写すしかないときは、**UTF-8（BOM なし）**で保存する（`█` などの記号が化けるため）
   - 保存したら、1行目が `#!/usr/bin/env node` で、2行目に `BLITZ AI スクールのステータスライン` とあることを確かめる
3. **設定に足す**: `<ホーム>/.claude/settings.json` に、次の `statusLine` を足す（ほかの設定は消さない・並べ替えない）。
   - 書き換える前に、いまの `settings.json` を `settings.json.bak` という名前で写しておく（無ければ不要）
   - パスは 2 で置いた場所の絶対パスを、区切りを `/` にして書く
   ```json
   "statusLine": {
     "type": "command",
     "command": "node \"C:/Users/<名前>/.claude/blitz-statusline.js\"",
     "refreshInterval": 30
   }
   ```
   （Mac なら `"command": "node \"/Users/<名前>/.claude/blitz-statusline.js\""`）
   - `settings.json` が無ければ、`{ }` の中にこの1項目だけを書いて作る
   - **すでに `statusLine` があるときは、書き換える前に利用者に「いまのステータスラインを置き換えてよいか」を聞き、元の値を利用者に見せて控えてもらう**
   - 書き換えたら、ファイル全体が JSON として読めることを確かめる
     （例 `node -e "JSON.parse(require('fs').readFileSync('<ホーム>/.claude/settings.json','utf8'));console.log('ok')"`）。
     読めなければ `settings.json.bak` から戻して、利用者に知らせる
4. **試す**: 短い JSON をスクリプトの標準入力に渡して実行し、2行の表示が出ることを確かめる（色の記号が混ざって見えてよい）
   - Mac・Git Bash: `echo '{"context_window":{"used_percentage":28},"model":{"display_name":"Opus"},"workspace":{"current_dir":"/x/renshu"}}' | node "<ホーム>/.claude/blitz-statusline.js"`
   - Windows の PowerShell: `'{"context_window":{"used_percentage":28},"model":{"display_name":"Opus"},"workspace":{"current_dir":"/x/renshu"}}' | node "<ホーム>/.claude/blitz-statusline.js"`
5. 利用者に「Claude Code を立ち上げ直してください」と伝える

## 外し方

`.claude/settings.json` から `statusLine` の項目を消し、`.claude/blitz-statusline.js` を消す。

## 中身について

- `blitz-statusline.js` 1ファイルだけ。Node.js のほかに入れるものはありません
- Claude Code が標準入力に渡す情報（コンテキストの使用率・使用量の枠・モデル名・フォルダ）を読んで表示するだけで、
  ネットにはつながらず、ファイルも書きません
