document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("previewSelectedBtn");

  if (!btn) {
    console.error("❌ Button not found");
    return;
  }

  btn.onclick = () => {
    // Export the active layer as a PNG (via temporary doc)
    const script = `
      (function () {
        var doc = app.activeDocument;
        if (!doc || !doc.activeLayer) {
          app.echoToOE("❌ No active layer.");
          return;
        }

        var newDoc = app.documents.add(doc.width, doc.height);
        doc.activeLayer.duplicate(newDoc, ElementPlacement.PLACEATBEGINNING);
        newDoc.activeLayer.visible = true;
        newDoc.saveToOE("png");
        app.echoToOE("✅ Layer PNG sent.");
        newDoc.close(SaveOptions.DONOTSAVECHANGES);
      })();
    `;
    parent.postMessage(script, "*");
    console.log("📤 Sent layer export script to Photopea.");
  };

  // Listen for Photopea responses
  window.addEventListener("message", async (event) => {
    if (event.data instanceof ArrayBuffer) {
      console.log("📥 Got PNG from Photopea.");

      // Turn ArrayBuffer into Blob URL
      const blob = new Blob([event.data], { type: "image/png" });
      const url = URL.createObjectURL(blob);

      // Show in new tab (optional)
      window.open(url, "_blank");

      // Also send it back to Photopea (insert as smart layer)
      const arrayBuffer = await blob.arrayBuffer();
      parent.postMessage(arrayBuffer, "*");

      // Then send Photopea a script to place the image in the same doc
      const placeScript = `app.open("${url}", null, true);`;
      setTimeout(() => {
        parent.postMessage(placeScript, "*");
        console.log("📤 Reinserted image using app.open()");
      }, 500); // give Photopea time to receive the file
    } else if (typeof event.data === "string") {
      console.log("📩 Message from Photopea:", event.data);
      alert(event.data);
    }
  });
});
