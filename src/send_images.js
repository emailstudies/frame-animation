// src/send_frames.js

document.getElementById("previewSelectionBtn").onclick = () => {
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
