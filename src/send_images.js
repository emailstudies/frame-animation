document.getElementById("previewSelectedBtn").onclick = () => {
  parent.postMessage({
    type: "sendScript",
    script: `App.echoToOE("Hello from Photopea")`
  }, "*");
};

window.addEventListener("message", (e) => {
  if (typeof e.data === "string") {
    console.log("📩 Message from Photopea:", e.data);
    alert("✅ Got from Photopea: " + e.data);
  }
});
