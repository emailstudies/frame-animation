document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("previewSelectedBtn");

  btn.onclick = () => {
    const script = `App.echoToOE("✅ Hello from Photopea")`;
    parent.postMessage(script, "*");
    console.log("📤 Sent simple hello script to Photopea.");
  };

  window.addEventListener("message", (e) => {
    if (typeof e.data === "string") {
      console.log("📩 From Photopea:", e.data);
      alert("📬 " + e.data);
    }
  });
});
