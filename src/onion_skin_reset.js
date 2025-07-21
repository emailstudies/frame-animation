function resetOnionSkin() {
  const script = `
    (function () {
      var doc = app.activeDocument;
      if (!doc) {
        alert("No active document.");
        return;
      }

      // Loop through all anim_* folders
      for (var i = 0; i < doc.layers.length; i++) {
        var group = doc.layers[i];
        if (group.typename === "LayerSet" && group.name.startsWith("anim_")) {
          var layers = group.layers;
          if (layers.length === 0) continue;

          // Topmost layer gets 100% opacity
          try {
            if (layers[0].typename !== "LayerSet") {
              layers[0].opacity = 100;
            }
          } catch (e) {}

          // All other layers get 0% opacity
          for (var j = 1; j < layers.length; j++) {
            var layer = layers[j];
            if (layer.typename !== "LayerSet") {
              try {
                layer.opacity = 0;
              } catch (e) {}
            }
          }
        }
      }

      alert("Onion Skin reset for all anim_ folders. In each, only top most layer at 100% opacity; all other layers at 0% opacity");
    })();
  `;

  window.parent.postMessage(script, "*");
}
