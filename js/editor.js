import { supabase, requireAuth } from "./api.js";
await requireAuth();

const params = new URLSearchParams(window.location.search);
const articleId = params.get("id");

const titleEl = document.getElementById("title");
const previewEl = document.getElementById("preview");
const modeMarkdownBtn = document.getElementById("modeMarkdown");
const modeRichBtn = document.getElementById("modeRich");

let mode = "markdown";
let easyMDE;
let currentContent = "";

// 🧩 Markdown Editor 初期化
function initMarkdownEditor(content = "") {
  if (easyMDE) easyMDE.toTextArea(); // 既存破棄
  easyMDE = new EasyMDE({
    element: document.getElementById("content"),
    initialValue: content,
    spellChecker: false,
    autosave: false,
    placeholder: "ここにMarkdownを書きます…",
    toolbar: [
      "bold", "italic", "heading", "|",
      "quote", "unordered-list", "ordered-list", "|",
      "link", "image", "table", "|",
      "preview", "side-by-side", "fullscreen"
    ]
  });

  easyMDE.codemirror.on("change", () => updatePreview(easyMDE.value()));
  updatePreview(content);
}

// 🧩 TinyMCE 初期化
function initRichEditor(content = "") {
  tinymce.remove(); // 重複防止
  tinymce.init({
    selector: "#content",
    height: 500,
    menubar: true,
    plugins:
      "advlist autolink lists link image charmap preview anchor " +
      "searchreplace visualblocks code fullscreen insertdatetime media table help wordcount",
    toolbar:
      "undo redo | styles | bold italic underline forecolor backcolor | " +
      "alignleft aligncenter alignright alignjustify | " +
      "bullist numlist outdent indent | removeformat | link image | preview",
    setup: (editor) => {
      editor.on("init", () => editor.setContent(content));
      editor.on("keyup change", () => updatePreview(editor.getContent()));
    }
  });
  updatePreview(content);
}

// 🧠 プレビュー更新
function updatePreview(content) {
  if (mode === "markdown") {
    previewEl.innerHTML = marked.parse(content || "");
  } else {
    previewEl.innerHTML = content || "";
  }
}

// 🎛️ モード切り替え
modeMarkdownBtn.addEventListener("click", () => {
  mode = "markdown";
  modeMarkdownBtn.classList.add("active");
  modeRichBtn.classList.remove("active");
  currentContent = tinymce.get("content")?.getContent() || "";
  tinymce.remove();
  initMarkdownEditor(currentContent);
});

modeRichBtn.addEventListener("click", () => {
  mode = "rich";
  modeRichBtn.classList.add("active");
  modeMarkdownBtn.classList.remove("active");
  if (easyMDE) currentContent = easyMDE.value();
  initRichEditor(currentContent);
});

// 🧠 記事読み込み
if (articleId) {
  const { data } = await supabase.from("articles").select("*").eq("id", articleId).single();
  if (data) {
    titleEl.value = data.title;
    currentContent = data.content || "";
    mode = data.format || "markdown";

    if (mode === "rich") {
      modeRichBtn.classList.add("active");
      modeMarkdownBtn.classList.remove("active");
      initRichEditor(currentContent);
    } else {
      initMarkdownEditor(currentContent);
    }
  }
} else {
  initMarkdownEditor();
}

// 💾 保存処理
document.getElementById("saveBtn").addEventListener("click", async () => {
  const title = titleEl.value.trim();
  let content = "";

  if (mode === "markdown") {
    content = easyMDE.value();
  } else {
    content = tinymce.get("content").getContent();
  }

  if (!title || !content) {
    alert("タイトルと本文を入力してください。");
    return;
  }

  const payload = {
    title,
    content,
    format: mode,
    updated_at: new Date().toISOString(),
  };

  let result;
  if (articleId) {
    result = await supabase.from("articles").update(payload).eq("id", articleId);
  } else {
    payload.created_at = new Date().toISOString();
    result = await supabase.from("articles").insert([payload]);
  }

  if (result.error) {
    alert("保存エラー: " + result.error.message);
  } else {
    alert("✅ 保存しました！");
    window.location.href = "home.html";
  }
});

// 🔙 戻る
document.getElementById("backBtn").addEventListener("click", () => {
  window.location.href = "home.html";
});
