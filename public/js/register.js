document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("register-form");
  if (!form) return;

  form.addEventListener("submit", async e => {
    e.preventDefault();
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const fullName = document.getElementById("fullName").value.trim();
    const userRole = document.getElementById("userRole").value;

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, fullName, userRole })
      });
      const data = await res.json();
      alert(data.message);
      if (data.success) window.location.href = "login.html";
    } catch (err) {
      alert("Server error");
      console.error(err);
    }
  });
});
