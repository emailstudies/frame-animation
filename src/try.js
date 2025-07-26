function exportGif() {
  const script = `
    (function () {
      try {
        var doc = app.activeDocument;
        if (!doc) {
          alert("No active document.");
          return;
        }

        console.log("📁 Document found:", doc.name);

        // Step 1: Check if anim_e exists
        for (var i = 0; i < doc.layers.length; i++) {
          var layer = doc.layers[i];
          if (layer.typename === "LayerSet" && layer.name === "anim_e") {
            alert("❌ Folder 'anim_e' already exists. Please delete it before running this.");
            return;
          }
        }
        console.log("✅ No existing 'anim_e' folder found.");

        // Step 2: Create anim_e at top
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

        // Step 3: Duplicate first layer from each anim_ folder
        var dupes = [];
        for (var i = 0; i < doc.layers.length; i++) {
          var group = doc.layers[i];
          if (group.typename !== "LayerSet" || group.name.indexOf("anim_") !== 0 || group.name === "anim_e") continue;

          for (var j = 0; j < group.layers.length; j++) {
            var layer = group.layers[j];
            if (!layer.locked && layer.visible && layer.typename !== "LayerSet") {
              var dup = layer.duplicate();
              dup.name = "_a_" + layer.name;
              dup.visible = true;
              dup.selected = false;
              dupes.push(dup);
              console.log("✅ Duplicated from:", group.name, "→", layer.name);
              break;
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

        // Step 5: Select dupes for merging
        for (var i = 0; i < dupes.length; i++) {
          dupes[i].selected = true;
        }

        // Step 6: Set last one as active
        doc.activeLayer = dupes[dupes.length - 1];

        // Step 7: Merge
        var merged = doc.activeLayer.merge();
        merged.name = "_a_Merged_Frame_1";
        console.log("✅ Layers merged successfully:", merged.name);

        // Step 8: Move into anim_e
        merged.move(animFolder, ElementPlacement.INSIDE);
        console.log("✅ Merged layer moved inside 'anim_e'");

        // Step 9: Deselect
        doc.activeLayer = null;

        alert("✅ Merged first layers from all anim_* folders into 'anim_e'. Check console for details.");
      } catch (e) {
        alert("❌ Script crashed: " + e.message);
        console.log("❌ Error trace:", e);
      }
    })();
  `;

  window.parent.postMessage(script, "*");
}
