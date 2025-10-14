import { supabase } from "./api.js";

const params = new URLSearchParams(window.location.search);
const articleId = params.get("id");

let editor;

// ✅ TinyMCE 初期化（画像アップロード対応）
tinymce.init({
  selector: "#editor",
  height: 450,
  menubar: false,
  plugins: "image link lists table code",
  toolbar:
    "undo redo | styles | bold italic underline | alignleft aligncenter alignright | bullist numlist | image link | code",
  images_upload_handler: async (blobInfo) => {
    // Supabase Storage にアップロード
    const file = blobInfo.blob();
    const fileName = `uploads/${Date.now()}-${file.name}`;

    const { error } = await supabase.storage.from("wiki-images").upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    });

    if (error) {
      console.error("画像アップロード失敗:", error.message);
      throw new Error("アップロードに失敗しました");
    }

    // 公開URLを返す
    const { data: publicUrlData } = supabase.storage.from("wiki-images").getPublicUrl(fileName);
    return publicUrlData.publicUrl;
  },
  setup: (ed) => (editor = ed),
});

const titleInput = document.getElementById("title");
const saveBtn = document.getElementById("saveBtn");
const previewBtn = document.getElementById("previewBtn");
const preview = document.getElementById("preview");

// 🧠 記事を読み込み
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
    alert("✅ 保存しました！");
    window.location.href = "home.html";
  }
});

// 👁️ プレビュー
previewBtn.addEventListener("click", () => {
  const html = editor.getContent();
  preview.innerHTML = html;
  preview.style.display = "block";
});
