import { supabase } from "./api.js";

// URLから記事ID取得
const params = new URLSearchParams(window.location.search);
const articleId = params.get("id");

if (!articleId) {
  document.body.innerHTML = "<p>記事が見つかりません。</p>";
  throw new Error("Article ID missing");
}

// 戻るボタン設定
document.getElementById("backBtn").href = `article.html?id=${articleId}`;

// 履歴データ取得
async function loadHistory() {
  const { data, error } = await supabase
    .from("article_history")
    .select(`
      id,
      editor_id,
      edited_at,
      old_title,
      new_title,
      old_content,
      new_content
    `)
    .eq("article_id", articleId)
    .order("edited_at", { ascending: false });

  if (error) {
    console.error(error);
    document.getElementById("history-list").innerHTML = "<p>履歴を読み込めませんでした。</p>";
    return;
  }

  if (!data || data.length === 0) {
    document.getElementById("history-list").innerHTML = "<p>まだ編集履歴がありません。</p>";
    return;
  }

  const list = document.getElementById("history-list");
  list.innerHTML = data
    .map(
      (h) => `
      <div class="history-item">
        <h3>${new Date(h.edited_at).toLocaleString()}</h3>
        <p><b>タイトル変更:</b> ${h.old_title || "(なし)"} → ${h.new_title || "(なし)"}</p>
        <p><b>本文の変化:</b></p>
        <div class="diff">${highlightDiff(h.old_content || "", h.new_content || "")}</div>
      </div>
    `
    )
    .join("");
}

// 差分をシンプルに強調（追加:緑、削除:赤）
function highlightDiff(oldText, newText) {
  const oldWords = oldText.split(/\s+/);
  const newWords = newText.split(/\s+/);

  const diff = [];
  let i = 0, j = 0;

  while (i < oldWords.length || j < newWords.length) {
    if (oldWords[i] === newWords[j]) {
      diff.push(oldWords[i]);
      i++; j++;
    } else if (newWords[j] && !oldWords.includes(newWords[j])) {
      diff.push(`<span class="added">${newWords[j]}</span>`);
      j++;
    } else if (oldWords[i] && !newWords.includes(oldWords[i])) {
      diff.push(`<span class="removed">${oldWords[i]}</span>`);
      i++;
    } else {
      i++; j++;
    }
  }

  return diff.join(" ");
}

loadHistory();
