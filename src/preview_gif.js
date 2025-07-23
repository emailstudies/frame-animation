function previewGif() {
  const previewWindow = window.open("canvas_preview.html", "_blank");

  const script = `
    (function () {
      var doc = app.activeDocument;
      if (!doc) return;

      var animGroup = null;
      for (var i = 0; i < doc.layers.length; i++) {
        var group = doc.layers[i];
        if (group.typename === "LayerSet" && group.name.indexOf("anim_") === 0) {
          animGroup = group;
          break;
        }
      }

      if (!animGroup) {
        alert("❌ No anim_* folder found.");
        return;
      }

      // Hide all layers
      for (var j = 0; j < animGroup.layers.length; j++) {
        animGroup.layers[j].visible = false;
      }

      // Save each layer to OE and push into result
      var results = [];
      for (var k = 0; k < animGroup.layers.length; k++) {
        var layer = animGroup.layers[k];
        if (layer.typename !== "ArtLayer" || layer.locked || !layer.visible) continue;

        layer.visible = true;
        app.activeDocument.activeLayer = layer;
        var png = app.activeDocument.saveToOE("png");  // ⚠️ synchronous in this context
        results.push({ name: layer.name, data: png });
        layer.visible = false;
      }

      if (animGroup.layers.length > 0) {
        animGroup.layers[0].visible = true;
        app.activeDocument.activeLayer = animGroup.layers[0];
      }

      window.postMessage({ type: "frameImages", frames: results }, "*");
    })();
  `;

  window.parent.postMessage(script, "*");

  window.addEventListener("message", function handle(e) {
    if (e.data?.type === "frameImages") {
      previewWindow.postMessage({ type: "frameImages", frames: e.data.frames }, "*");
      window.removeEventListener("message", handle);
    }
  });
}
