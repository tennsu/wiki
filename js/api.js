// js/api.js
// ===============================
// Supabase接続・Auth・記事API・Storage関連の完全版
// ===============================

import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

// ------------------------------------------------------------
// 1️⃣ Supabase接続設定
// ------------------------------------------------------------
const SUPABASE_URL = "https://wosacylvqpjcrpzbnuhv.supabase.co";  // ← あなたのURLに変更
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indvc2FjeWx2cXBqY3JwemJudWh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0MDU1MDYsImV4cCI6MjA3NTk4MTUwNn0.9QegaNoCIwwVKZ8g1-GR0n2ahMurqCk2D5p3zO1fOBE";               // ← あなたのanon keyに変更

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ------------------------------------------------------------
// 2️⃣ Auth（認証）関連
// ------------------------------------------------------------

// 🔸 新規登録
export async function signUp(email, password) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

// 🔸 ログイン
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

// 🔸 ログアウト
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// 🔸 現在のセッション取得
export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

// ------------------------------------------------------------
// 3️⃣ 記事関連 (articlesテーブル)
// ------------------------------------------------------------

// 🔹 記事を全件取得（一覧表示用）
export async function getArticles() {
  const { data, error } = await supabase
    .from("articles")
    .select("id, title, description, created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

// 🔹 単一記事を取得
export async function getArticle(id) {
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

// 🔹 記事を追加（新規作成）
export async function addArticle(article) {
  const { error } = await supabase.from("articles").insert(article);
  if (error) throw error;
}

// 🔹 記事を更新（編集ページ）
export async function updateArticle(id, data) {
  const { error } = await supabase
    .from("articles")
    .update(data)
    .eq("id", id);
  if (error) throw error;
}

// 🔹 記事を削除
export async function deleteArticle(id) {
  const { error } = await supabase.from("articles").delete().eq("id", id);
  if (error) throw error;
}

// ------------------------------------------------------------
// 4️⃣ 画像アップロード (Storage: imagesバケット)
// ------------------------------------------------------------

// 🔹 ファイルをSupabase Storageにアップロードして公開URLを返す
export async function uploadImage(file) {
  if (!file) throw new Error("ファイルが選択されていません");

  const fileName = `${Date.now()}_${file.name}`;
  const { error } = await supabase.storage.from("images").upload(fileName, file);
  if (error) throw error;

  const { data } = supabase.storage.from("images").getPublicUrl(fileName);
  return data.publicUrl;
}

// ------------------------------------------------------------
// 5️⃣ 認証保護ヘルパー（ログイン確認）
// ------------------------------------------------------------
export async function requireAuth(redirectTo = "auth.html") {
  const { data } = await supabase.auth.getSession();
  if (!data.session) {
    alert("ログインが必要です");
    window.location.href = redirectTo;
  }
}

// ------------------------------------------------------------
// 6️⃣ 記事＋ユーザー紐付け（任意で拡張用）
// ------------------------------------------------------------
// 記事投稿時に user_id を自動保存したい場合
export async function addArticleWithUser(article) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("ログインが必要です");
  const { user } = session;

  const { error } = await supabase.from("articles").insert({
    ...article,
    user_id: user.id,
  });
  if (error) throw error;
}
