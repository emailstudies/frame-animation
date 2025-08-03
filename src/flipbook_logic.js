function exportPreviewFramesToFlipbook() {
  const script = `
    (function () {
      try {
        var doc = app.activeDocument;
        var output = [];

        output.push("📄 Active document: " + doc.name);
        output.push("🔍 Scanning for 'anim_preview'...");

        var found = false;

        for (var i = 0; i < doc.layers.length; i++) {
          var layer = doc.layers[i];
          if (layer.typename === "LayerSet") {
            output.push("📁 Found folder: " + layer.name);
          }

          if (layer.typename === "LayerSet" && layer.name === "anim_preview") {
            found = true;
            output.push("✅ Found anim_preview with " + layer.layers.length + " layers.");
            break;
          }
        }

        if (!found) {
          output.push("❌ anim_preview not found");
        }

        app.echoToOE(output.join("\\n"));
      } catch (e) {
        app.echoToOE("❌ Script error: " + e.message);
      }
    })();
  `;
  parent.postMessage(script, "*");
}
