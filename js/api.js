// js/api.js
const SUPABASE_URL = "https://YOUR-PROJECT.supabase.co";
const SUPABASE_KEY = "YOUR_PUBLIC_ANON_KEY";
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// 一覧取得
export async function getArticles() {
  const { data, error } = await supabase
    .from("articles")
    .select("id, title, description, updated_at")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return data;
}

// 記事1件取得
export async function getArticle(title) {
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .eq("title", title)
    .single();
  if (error) throw error;
  return data;
}

// 作成
export async function createArticle(article) {
  const { error } = await supabase.from("articles").insert([
    {
      title: article.title,
      description: article.description,
      markdown: article.markdown,
      infobox: article.infobox || {},
    },
  ]);
  if (error) throw error;
  return true;
}

// 更新
export async function updateArticle(title, article) {
  const { error } = await supabase
    .from("articles")
    .update({
      description: article.description,
      markdown: article.markdown,
      infobox: article.infobox || {},
      updated_at: new Date().toISOString(),
    })
    .eq("title", title);
  if (error) throw error;
  return true;
}

// 削除
export async function deleteArticle(title) {
  const { error } = await supabase.from("articles").delete().eq("title", title);
  if (error) throw error;
  return true;
}
