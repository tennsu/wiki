import { supabase } from "./api.js";

const emailEl = document.getElementById("email");
const passwordEl = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");
const signupBtn = document.getElementById("signupBtn");
const messageEl = document.getElementById("message");
const loadingEl = document.getElementById("loading");

async function showMessage(text, color = "#c00") {
  messageEl.style.color = color;
  messageEl.textContent = text;
}

function setLoading(loading) {
  loadingEl.style.display = loading ? "block" : "none";
  loginBtn.disabled = loading;
  signupBtn.disabled = loading;
}

loginBtn.addEventListener("click", async () => {
  setLoading(true);
  await showMessage("");

  const email = emailEl.value.trim();
  const password = passwordEl.value.trim();

  if (!email || !password) {
    await showMessage("メールとパスワードを入力してください。");
    setLoading(false);
    return;
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    await showMessage("ログイン失敗：" + error.message);
  } else {
    await showMessage("ログイン成功！", "#0a0");
    setTimeout(() => (window.location.href = "home.html"), 1000);
  }
  setLoading(false);
});

signupBtn.addEventListener("click", async () => {
  setLoading(true);
  await showMessage("");

  const email = emailEl.value.trim();
  const password = passwordEl.value.trim();

  if (!email || !password) {
    await showMessage("メールとパスワードを入力してください。");
    setLoading(false);
    return;
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password
  });

  if (error) {
    await showMessage("登録失敗：" + error.message);
  } else {
    await showMessage("確認メールを送信しました！", "#0a0");
  }

  setLoading(false);
});
