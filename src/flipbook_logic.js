function exportPreviewFramesToFlipbook() {
  const script = `
    try {
      var doc = app.activeDocument;
      var animFolder = null;

      for (var i = 0; i < doc.layerSets.length; i++) {
        if (doc.layerSets[i].name === "anim_preview") {
          animFolder = doc.layerSets[i];
          break;
        }
      }

      if (animFolder) {
        app.echoToOE("✅ anim_preview exists");
      } else {
        app.echoToOE("❌ anim_preview not found");
      }
    } catch (e) {
      app.echoToOE("❌ " + e.message);
    }
  `;

  parent.postMessage(script, "*");

  window.addEventListener("message", function handleResponse(event) {
    if (typeof event.data === "string") {
      console.log("📩 Message from Photopea:", event.data);
      window.removeEventListener("message", handleResponse);
    }
  });
}
