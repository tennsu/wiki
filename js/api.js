// js/api.js
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

// あなたのSupabaseプロジェクト情報を設定
const SUPABASE_URL = "https://YOUR_PROJECT.supabase.co";
const SUPABASE_KEY = "YOUR_PUBLIC_ANON_KEY";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// 記事一覧取得
export async function getArticles() {
  const { data, error } = await supabase.from("articles").select("*").order("updated_at", { ascending: false });
  if (error) throw error;
  return data;
}

// 記事取得
export async function getArticle(title) {
  const { data, error } = await supabase.from("articles").select("*").eq("title", title).single();
  if (error) throw error;
  return data;
}

// 記事追加
export async function addArticle(article) {
  const { error } = await supabase.from("articles").insert([article]);
  if (error) throw error;
}

// 記事更新
export async function updateArticle(title, data) {
  const { error } = await supabase.from("articles").update(data).eq("title", title);
  if (error) throw error;
}
