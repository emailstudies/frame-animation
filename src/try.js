function exportGif() {
  const script = `
    (function () {
      var doc = app.activeDocument;
      if (!doc) {
        alert("No active document.");
        return;
      }

      // Step 1: Check if anim_e exists
      for (var i = 0; i < doc.layers.length; i++) {
        var layer = doc.layers[i];
        if (layer.name === "anim_e" && layer.typename === "LayerSet") {
          alert("❌ 'anim_e' folder already exists. Please delete it first.");
          return;
        }
      }

      // Step 2: Create anim_e at root using ActionDescriptor
      var groupDesc = new ActionDescriptor();
      var ref = new ActionReference();
      ref.putClass(stringIDToTypeID("layerSection"));
      groupDesc.putReference(charIDToTypeID("null"), ref);

      var props = new ActionDescriptor();
      props.putString(charIDToTypeID("Nm  "), "anim_e");
      groupDesc.putObject(charIDToTypeID("Usng"), stringIDToTypeID("layerSection"), props);
      executeAction(charIDToTypeID("Mk  "), groupDesc, DialogModes.NO);

      var animE = app.activeDocument.activeLayer;
      var topLayer = doc.layers[0];
      animE.move(topLayer, ElementPlacement.PLACEBEFORE);

      // Step 3: Find and duplicate first layer from all anim_* folders
      var duplicated = [];

      for (var i = doc.layers.length - 1; i >= 0; i--) {
        var group = doc.layers[i];
        if (group.typename !== "LayerSet") continue;
        if (group.name.indexOf("anim_") !== 0 || group.name === "anim_e") continue;

        if (group.layers.length === 0) continue;

        var firstLayer = group.layers[group.layers.length - 1]; // topmost in UI
        if (!firstLayer || firstLayer.typename === "LayerSet" || firstLayer.locked) continue;

        doc.activeLayer = firstLayer;
        var dup = firstLayer.duplicate();
        dup.name = "_a_" + firstLayer.name;
        dup.move(animE, ElementPlacement.INSIDE);
        duplicated.push(dup.name);
      }

      if (duplicated.length < 2) {
        alert("❌ Need at least 2 layers to merge. Found: " + duplicated.length);
        return;
      }

      // Step 4: Merge all layers in anim_e
      app.activeDocument.activeLayer = animE.layers[0];
      for (var i = 1; i < animE.layers.length; i++) {
        animE.layers[i].merge();
      }

      animE.layers[0].name = "_a_merged_1";

      console.log("📦 Merged layers:", duplicated);
      console.log("✅ Merged output → _a_merged_1");

    })();
  `;

  window.parent.postMessage(script, "*");
}
