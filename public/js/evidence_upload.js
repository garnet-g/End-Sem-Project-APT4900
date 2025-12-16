document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("upload-form");
  form.addEventListener("submit", async e => {
    e.preventDefault();
    const formData = new FormData(form);
    formData.append("officerId", localStorage.getItem("userId"));

    const res = await fetch("/api/evidence/upload", {
      method: "POST",
      body: formData
    });
    const data = await res.json();
    if (data.success) alert(`Uploaded! Evidence ID: ${data.evidenceId}`);
    else alert("Upload failed");
  });
});
