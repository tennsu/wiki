import { supabase } from "./api.js";

const params = new URLSearchParams(window.location.search);
const articleId = params.get("id");

let editor;

// ✅ TinyMCE初期化
tinymce.init({
  selector: "#editor",
  height: 400,
  menubar: false,
  plugins: "link image lists table code",
  toolbar: "undo redo | bold italic underline | alignleft aligncenter alignright | bullist numlist | link image | code",
  setup: (ed) => (editor = ed),
});

const titleInput = document.getElementById("title");
const saveBtn = document.getElementById("saveBtn");
const previewBtn = document.getElementById("previewBtn");
const preview = document.getElementById("preview");

// 🧠 記事読み込み（編集時）
async function loadArticle() {
  if (!articleId) return;

  const { data, error } = await supabase.from("articles").select("*").eq("id", articleId).single();
  if (error) {
    console.error("読み込み失敗:", error);
    return;
  }

  titleInput.value = data.title;
  editor.setContent(data.content);
}

tinymce.on("AddEditor", async () => {
  await loadArticle();
});

// 💾 保存
saveBtn.addEventListener("click", async () => {
  const title = titleInput.value.trim();
  const content = editor.getContent();

  if (!title || !content) {
    alert("タイトルと内容を入力してください。");
    return;
  }

  let result;
  if (articleId) {
    result = await supabase.from("articles").update({ title, content, updated_at: new Date() }).eq("id", articleId);
  } else {
    result = await supabase.from("articles").insert([{ title, content, created_at: new Date(), updated_at: new Date() }]);
  }

  if (result.error) {
    alert("保存に失敗しました: " + result.error.message);
  } else {
    alert("保存しました！");
    window.location.href = "home.html";
  }
});

// 👁️ プレビュー
previewBtn.addEventListener("click", () => {
  const html = editor.getContent();
  preview.innerHTML = html;
  preview.style.display = "block";
});
