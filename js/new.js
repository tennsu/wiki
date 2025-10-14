import { supabase } from "./api.js";

let editor;

// ✅ TinyMCE初期化
tinymce.init({
  selector: "#editor",
  height: 400,
  menubar: false,
  plugins: "link image lists table code",
  toolbar:
    "undo redo | bold italic underline | alignleft aligncenter alignright | bullist numlist | link image | code",
  setup: (ed) => (editor = ed),
});

const titleInput = document.getElementById("title");
const saveBtn = document.getElementById("saveBtn");
const previewBtn = document.getElementById("previewBtn");
const backBtn = document.getElementById("backBtn");
const preview = document.getElementById("preview");

// 💾 保存処理
saveBtn.addEventListener("click", async () => {
  const title = titleInput.value.trim();
  const content = editor.getContent();

  if (!title || !content) {
    alert("タイトルと本文を入力してください。");
    return;
  }

  const { data: sessionData } = await supabase.auth.getSession();
  const user = sessionData?.session?.user;

  if (!user) {
    alert("ログインが必要です。");
    window.location.href = "index.html";
    return;
  }

  const { error } = await supabase.from("articles").insert([
    {
      title,
      content,
      created_at: new Date(),
      updated_at: new Date(),
      author_id: user.id,
      author_email: user.email,
    },
  ]);

  if (error) {
    alert("保存に失敗しました: " + error.message);
  } else {
    alert("✅ 記事を作成しました！");
    window.location.href = "home.html";
  }
});

// 👁️ プレビュー
previewBtn.addEventListener("click", () => {
  const html = editor.getContent();
  preview.innerHTML = html;
  preview.style.display = "block";
});

// ← 戻る
backBtn.addEventListener("click", () => {
  window.location.href = "home.html";
});
