document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("previewSelectionBtn");
  if (!btn) {
    console.error("❌ Button #previewSelectionBtn not found in DOM.");
    return;
  }

  btn.onclick = () => {
    parent.postMessage({
      type: "sendScript",
      script: `App.echoToOE("Hello from Photopea");`
    }, "*");
  };

  window.addEventListener("message", (event) => {
    const data = event.data;

    if (typeof data === "string") {
      console.log("📩 Got message from Photopea:", data);
      alert("✅ Photopea says: " + data);
    }
  });
});
