function previewGif() {
  const previewWindow = window.open("canvas_preview.html", "_blank");

  // Build a script to run inside Photopea
  const script = `
    (async function () {
      var doc = app.activeDocument;
      if (!doc) return;

      var animGroup = null;
      for (var i = 0; i < doc.layers.length; i++) {
        var group = doc.layers[i];
        if (group.typename === "LayerSet" && group.name.startsWith("anim_")) {
          animGroup = group;
          break;
        }
      }

      if (!animGroup) {
        alert("❌ No anim_* folder found.");
        return;
      }

      var result = [];
      for (var j = 0; j < animGroup.layers.length; j++) {
        var layer = animGroup.layers[j];
        if (layer.typename === "ArtLayer" && !layer.locked && layer.visible) {
          // Hide all other layers
          for (var k = 0; k < animGroup.layers.length; k++) {
            animGroup.layers[k].visible = false;
          }
          layer.visible = true;
          app.activeDocument.activeLayer = layer;

          var data = await app.activeDocument.saveToOE("png");
          result.push({ name: layer.name, data: data });

          layer.visible = false;
        }
      }

      app.activeDocument.activeLayer = animGroup.layers[0];
      animGroup.layers[0].visible = true;

      window.postMessage({ type: "frameImages", frames: result }, "*");
    })();
  `;

  window.parent.postMessage(script, "*");

  // Handle image frame data and forward it to the preview window
  window.addEventListener("message", function handleMessage(e) {
    if (e.data?.type === "frameImages") {
      previewWindow.postMessage({ type: "frameImages", frames: e.data.frames }, "*");
      window.removeEventListener("message", handleMessage);
    }
  });
}
