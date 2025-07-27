document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("previewSelectedBtn");

  if (!btn) {
    console.error("❌ Button with ID 'previewSelectedBtn' not found.");
    return;
  }

  btn.onclick = () => {
    // This is the script we are sending TO Photopea
    const script = `app.echoToOE("✅ done")`;  // Must be a string!
    parent.postMessage(script, "*");          // Send script to Photopea
    console.log("📤 Sent script to Photopea.");
  };

  // Receive messages BACK from Photopea
  window.addEventListener("message", (event) => {
    if (typeof event.data === "string") {
      console.log("📩 Message from Photopea:", event.data);
      alert("📥 Photopea says: " + event.data);
    }
  });
});
