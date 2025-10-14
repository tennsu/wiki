import { supabase } from "./api.js";

const params = new URLSearchParams(window.location.search);
const id = params.get("id");

const titleEl = document.getElementById("articleTitle");
const contentEl = document.getElementById("articleContent");
const infoEl = document.getElementById("info");

async function loadArticle() {
  if (!id) {
    titleEl.textContent = "記事が見つかりません";
    return;
  }

  const { data, error } = await supabase.from("articles").select("*").eq("id", id).single();

  if (error || !data) {
    titleEl.textContent = "記事の読み込みに失敗しました";
    console.error(error);
    return;
  }

  titleEl.textContent = data.title;
  infoEl.textContent = `最終更新: ${new Date(data.updated_at).toLocaleString()} / 形式: ${data.format}`;

  if (data.format === "markdown") {
    contentEl.innerHTML = marked.parse(data.content || "");
  } else {
    contentEl.innerHTML = data.content || "<p>内容がありません</p>";
  }
}

await loadArticle();

// ✏️ 編集ボタン
document.getElementById("editBtn").addEventListener("click", () => {
  window.location.href = `editor.html?id=${id}`;
});

// 🔙 戻るボタン
document.getElementById("backBtn").addEventListener("click", () => {
  window.location.href = "home.html";
});
