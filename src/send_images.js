document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("previewSelectedBtn");

  btn.onclick = () => {
    const script = `App.echoToOE("Hello from Photopea plugin")`;
    parent.postMessage(script, "*");  // ✅ Send raw string
  };

  window.addEventListener("message", (e) => {
    if (typeof e.data === "string") {
      console.log("📩 Got message from Photopea:", e.data);
      alert("✅ Got from Photopea: " + e.data);
    }
  });
});
