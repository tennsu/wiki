import { supabase } from "./api.js";

const params = new URLSearchParams(window.location.search);
const id = params.get("id");

const titleEl = document.getElementById("articleTitle");
const contentEl = document.getElementById("articleContent");

async function loadArticle() {
  const { data, error } = await supabase.from("articles").select("*").eq("id", id).single();

  if (error || !data) {
    titleEl.textContent = "記事が見つかりません";
    console.error(error);
    return;
  }

  titleEl.textContent = data.title;
  contentEl.innerHTML = data.content; // TinyMCE出力HTMLをそのまま表示
}

await loadArticle();

document.getElementById("editBtn").addEventListener("click", () => {
  window.location.href = `editor.html?id=${id}`;
});

document.getElementById("backBtn").addEventListener("click", () => {
  window.location.href = "home.html";
});
