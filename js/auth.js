import { supabase } from "./api.js";

const emailInput = document.getElementById("email");
const passInput = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");
const signupBtn = document.getElementById("signupBtn");

loginBtn.addEventListener("click", async () => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: emailInput.value,
    password: passInput.value,
  });
  if (error) {
    alert("ログイン失敗: " + error.message);
  } else {
    alert("ログイン成功！");
    window.location.href = "index.html";
  }
});

signupBtn.addEventListener("click", async () => {
  const { data, error } = await supabase.auth.signUp({
    email: emailInput.value,
    password: passInput.value,
  });
  if (error) {
    alert("登録失敗: " + error.message);
  } else {
    alert("登録メールを確認してください！");
  }
});
