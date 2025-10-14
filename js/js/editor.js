import { supabase } from "./api.js";

const params = new URLSearchParams(window.location.search);
const articleId = params.get("id");

const titleInput = document.getElementById("title");
const contentInput = document.getElementById("content");
const saveBtn = document.getElementById("saveBtn");
const historyBtn = document.getElementById("historyBtn");

// 🧭 履歴ページへ移動
historyBtn.addEventListener("click", () => {
  if (articleId) {
    window.location.href = `history.html?id=${articleId}`;
  } else {
    alert("このページにはまだ履歴がありません。記事を保存してください。");
  }
});

// 📝 記事データ読み込み
async function loadArticle() {
  if (!articleId) return;
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .eq("id", articleId)
    .single();

  if (error) {
    console.error(error);
    alert("記事を読み込めませんでした。");
    return;
  }

  titleInput.value = data.title;
  contentInput.value = data.content;
}

// 💾 記事を保存（新規 or 更新）
saveBtn.addEventListener("click", async () => {
  const title = titleInput.value.trim();
  const content = contentInput.value.trim();

  if (!title || !content) {
    alert("タイトルと本文を入力してください。");
    return;
  }

  if (articleId) {
    // 更新
    const { error } = await supabase
      .from("articles")
      .update({ title, content })
      .eq("id", articleId);

    if (error) {
      console.error(error);
      alert("保存に失敗しました。");
    } else {
      alert("記事を更新しました。");
    }
  } else {
    // 新規作成
    const { data: userData } = await supabase.auth.getUser();
    const user_id = userData?.user?.id;

    const { error } = await supabase
      .from("articles")
      .insert([{ title, content, user_id }]);

    if (error) {
      console.error(error);
      alert("記事の作成に失敗しました。");
    } else {
      alert("記事を作成しました。");
      window.location.href = "home.html";
    }
  }
});

loadArticle();
