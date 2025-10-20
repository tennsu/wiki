// js/article.js

import { supabase } from "./api.js";

// URLパラメータから記事ID取得
const params = new URLSearchParams(window.location.search);
const id = params.get("id");

// DOM要素取得
const titleEl = document.getElementById("articleTitle");
const contentEl = document.getElementById("articleContent");

// 記事読み込み関数
async function loadArticle() {
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    titleEl.textContent = "記事が見つかりません";
    console.error("記事読み込みエラー:", error);
    return;
  }

  titleEl.textContent = data.title;
  contentEl.innerHTML = data.content; // HTML形式で表示
}

// 初期読み込み
await loadArticle();

// 編集ボタン処理
document.getElementById("editBtn").addEventListener("click", () => {
  window.location.href = `editor.html?id=${id}`;
});

// 戻るボタン処理
document.getElementById("backBtn").addEventListener("click", () => {
  window.location.href = "home.html";
});

// 削除ボタン処理
document.getElementById("deleteBtn").addEventListener("click", async () => {
  const confirmed = confirm("この記事を削除しますか？");

  if (!confirmed) return;

  const { error } = await supabase
    .from("articles")
    .delete()
    .eq("id", id);

  if (error) {
    alert("削除に失敗しました。");
    console.error("削除エラー:", error);
    return;
  }

  alert("記事を削除しました。");
  window.location.href = "home.html"; // 削除後にトップページへ
});
