function exportGif() {
  const script = `
    (function () {
      var doc = app.activeDocument;
      if (!doc) {
        alert("No active document.");
        return;
      }

      console.log("📁 Document found:", doc.name);

      // Force refresh layer state
      app.activeDocument = doc;

      // Step 1: Check if 'anim_e' exists
      for (var i = 0; i < doc.layers.length; i++) {
        var layer = doc.layers[i];
        if (layer.typename === "LayerSet" && layer.name === "anim_e") {
          alert("❌ Folder 'anim_e' already exists. Please delete it before running this.");
          return;
        }
      }
      console.log("✅ No existing 'anim_e' folder found.");

      // Step 2: Create anim_e at top using ActionDescriptor
      var groupDesc = new ActionDescriptor();
      var ref = new ActionReference();
      ref.putClass(stringIDToTypeID("layerSection"));
      groupDesc.putReference(charIDToTypeID("null"), ref);

      var props = new ActionDescriptor();
      props.putString(charIDToTypeID("Nm  "), "anim_e");
      groupDesc.putObject(charIDToTypeID("Usng"), stringIDToTypeID("layerSection"), props);

      executeAction(charIDToTypeID("Mk  "), groupDesc, DialogModes.NO);

      var animFolder = doc.activeLayer;
      var topLayer = doc.layers[0];
      animFolder.move(topLayer, ElementPlacement.PLACEBEFORE);
      console.log("✅ 'anim_e' folder created and moved to top.");

      // Step 3: Get first layer from each anim_* folder
      var dupes = [];
      for (var i = 0; i < doc.layers.length; i++) {
        var layer = doc.layers[i];
        if (layer.typename === "LayerSet" && layer.name.indexOf("anim_") === 0 && layer.name !== "anim_e") {
          for (var j = 0; j < layer.layers.length; j++) {
            var inner = layer.layers[j];
            if (!inner.locked && inner.typename !== "LayerSet" && inner.visible) {
              var dup = inner.duplicate();
              dup.name = "_a_" + inner.name;
              dupes.push(dup);
              console.log("✅ Duplicated from:", layer.name, "→", inner.name);
              break; // only first visible, unlocked layer
            }
          }
        }
      }

      if (dupes.length < 2) {
        alert("❌ Need at least 2 layers to merge. Found: " + dupes.length);
        return;
      }

      console.log("✅ Total layers to merge:", dupes.length);

      // Step 4: Move dupes to top in reverse order
      for (var i = dupes.length - 1; i >= 0; i--) {
        dupes[i].move(doc, ElementPlacement.PLACEATBEGINNING);
        console.log("📌 Moved to top:", dupes[i].name);
      }

      // Step 5: Select all the duplicate layers
      for (var i = 0; i < dupes.length; i++) {
        dupes[i].selected = true;
      }

      // Step 6: Merge selected layers
      try {
        var merged = dupes[dupes.length - 1].merge();
        merged.name = "_a_Merged_Frame_1";
        console.log("✅ Layers merged successfully:", merged.name);

        // Step 7: Move merged layer into anim_e
        merged.move(animFolder, ElementPlacement.INSIDE);
        console.log("✅ Merged layer moved inside 'anim_e'");
      } catch (e) {
        alert("❌ Merge failed. Check if layers are top-level and selected.");
        console.log("❌ Merge error:", e);
      }

      alert("✅ Merged first layers from all anim_* folders into 'anim_e'. Check console for details.");
    })();
  `;

  window.parent.postMessage(script, "*");
}
