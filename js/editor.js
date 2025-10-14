import { supabase, requireAuth } from "./api.js";
await requireAuth();

const params = new URLSearchParams(window.location.search);
const articleId = params.get("id");

const titleEl = document.getElementById("title");
const modeSelect = document.getElementById("mode");

let easyMDE = null;
let usingTiny = true;

// 🎛️ エディタの初期化関数
function initEditor(mode) {
  // 既存エディタの破棄
  if (easyMDE) { easyMDE.toTextArea(); easyMDE = null; }
  if (tinymce.activeEditor) tinymce.remove();

  if (mode === "tinymce") {
    usingTiny = true;
    tinymce.init({
      selector: "#content",
      height: 500,
      menubar: true,
      plugins: "lists link image code table",
      toolbar: "undo redo | bold italic underline | alignleft aligncenter alignright | bullist numlist | link image | code",
      language: "ja"
    });
  } else {
    usingTiny = false;
    easyMDE = new EasyMDE({
      element: document.getElementById("content"),
      spellChecker: false,
      autosave: false,
      status: false
    });
  }
}

// 初期状態（TinyMCE）
initEditor("tinymce");

// 切り替え時
modeSelect.addEventListener("change", (e) => {
  initEditor(e.target.value);
});

// 記事読み込み
if (articleId) {
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .eq("id", articleId)
    .single();

  if (data) {
    titleEl.value = data.title;
    setTimeout(() => {
      if (usingTiny) tinymce.activeEditor.setContent(data.content);
      else easyMDE.value(data.content);
    }, 500);
  }
}

// 💾 保存
document.getElementById("saveBtn").addEventListener("click", async () => {
  const title = titleEl.value.trim();
  const content = usingTiny
    ? tinymce.activeEditor.getContent()
    : easyMDE.value();

  if (!title || !content) {
    alert("タイトルと本文を入力してください");
    return;
  }

  const payload = { title, content, updated_at: new Date().toISOString() };
  let result;

  if (articleId) {
    result = await supabase.from("articles").update(payload).eq("id", articleId);
  } else {
    payload.created_at = new Date().toISOString();
    result = await supabase.from("articles").insert([payload]);
  }

  if (result.error) alert("保存失敗: " + result.error.message);
  else {
    alert("✅ 保存しました！");
    window.location.href = "home.html";
  }
});

document.getElementById("backBtn").addEventListener("click", () => {
  window.location.href = "home.html";
});
