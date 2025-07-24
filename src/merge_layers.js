function previewGif() {
  const script = `
    (function () {
      console.log("🚀 Starting previewGif()...");

      var doc = app.activeDocument;
      if (!doc) {
        alert("❌ No active document.");
        return;
      }

      // Step 1: Collect all anim_* folders (ignore anim_preview and locked)
      console.log("🔍 Collecting anim_* folders...");
      var animFolders = [];
      for (var i = 0; i < doc.layerSets.length; i++) {
        var group = doc.layerSets[i];
        if (
          group.name.startsWith("anim_") &&
          group.name !== "anim_preview" &&
          !group.allLocked
        ) {
          animFolders.push(group);
          console.log("✅ Found folder:", group.name);
        }
      }

      if (animFolders.length === 0) {
        alert("❌ No animation folders found.");
        return;
      }

      // Step 2: Find max frame count
      var maxFrames = 0;
      for (var i = 0; i < animFolders.length; i++) {
        var len = animFolders[i].layers.length;
        if (len > maxFrames) maxFrames = len;
      }
      console.log("📊 Max frame count:", maxFrames);

      // Step 3: Create frameGroups[i] = [layer i from each anim folder]
      console.log("📦 Building frame groups...");
      var frameGroups = [];
      for (var f = 0; f < maxFrames; f++) {
        var group = [];
        for (var a = 0; a < animFolders.length; a++) {
          var folder = animFolders[a];
          var count = folder.layers.length;
          var index = count - 1 - f;
          var layer = folder.layers[index >= 0 ? index : count - 1];
          group.push(layer);
          console.log("🧩 Frame", f + 1, "→", folder.name, "→", layer.name);
        }
        frameGroups.push(group);
      }

      // Step 4: Create new document
      console.log("📄 Creating new document...");
      app.runMenuItem(stringIDToTypeID("newDocument"));
      var newDoc = app.activeDocument;

      // Step 5: Create 'anim_preview' group
      console.log("📁 Creating anim_preview folder...");
      var desc = new ActionDescriptor();
      var ref = new ActionReference();
      ref.putClass(stringIDToTypeID("layerSection"));
      desc.putReference(charIDToTypeID("null"), ref);
      var nameDesc = new ActionDescriptor();
      nameDesc.putString(charIDToTypeID("Nm  "), "anim_preview");
      desc.putObject(charIDToTypeID("Usng"), stringIDToTypeID("layerSection"), nameDesc);
      executeAction(charIDToTypeID("Mk  "), desc, DialogModes.NO);
      var previewGroup = newDoc.layerSets[0];

      // Step 6: For each frame group, duplicate → merge → rename → move into previewGroup
      for (var f = 0; f < frameGroups.length; f++) {
        var dupes = [];
        for (var i = 0; i < frameGroups[f].length; i++) {
          var dup = frameGroups[f][i].duplicate();
          dupes.push(dup);
        }

        // Deselect all in newDoc
        for (var d = 0; d < newDoc.layers.length; d++) {
          newDoc.layers[d].selected = false;
        }

        // Select the duplicates
        for (var s = 0; s < dupes.length; s++) {
          dupes[s].selected = true;
        }

        newDoc.mergeLayers();
        var merged = newDoc.activeLayer;
        merged.name = "_a_Frame " + (f + 1);
        merged.move(previewGroup, ElementPlacement.INSIDE);

        console.log("🖼️ Merged Frame", f + 1, "as:", merged.name);
      }

      alert("✅ Preview created with " + frameGroups.length + " merged frames.");
      console.log("🏁 Finished previewGif().");
    })();
  `.trim();

  // ✅ Send script string directly
  window.parent.postMessage(script, "*");
}
