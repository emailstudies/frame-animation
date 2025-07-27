document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("previewSelectedBtn");

  if (!btn) {
    console.error("❌ Button not found");
    return;
  }

  btn.onclick = () => {
    const script = `App.echoToOE("✅ Hello from plugin")`;
    parent.postMessage(script, "*");
    console.log("📤 Sent script to Photopea.");
  };

  window.addEventListener("message", (e) => {
    if (typeof e.data === "string") {
      console.log("📩 Message from Photopea:", e.data);
      alert("✅ Photopea says: " + e.data);
    }
  });
});
