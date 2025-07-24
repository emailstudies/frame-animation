function exportGif() {
  const script = `
    (function () {
      var doc = app.activeDocument;
      if (!doc) {
        alert("❌ No active document.");
        return;
      }

      // Setup reusable helpers once
      if (typeof __frameMergeHelpers__ === 'undefined') {
        function findAnimFolders() {
          return doc.layers.filter(l => l.name.startsWith("anim_") && l.layers);
        }

        function getOrCreateAnimPreviewFolder() {
          var exists = doc.layers.find(l => l.name === "anim_preview" && l.layers);
          if (exists) return exists;

          var desc = new ActionDescriptor();
          var ref = new ActionReference();
          ref.putClass(stringIDToTypeID("layerSection"));
          desc.putReference(charIDToTypeID("null"), ref);
          var nameDesc = new ActionDescriptor();
          nameDesc.putString(charIDToTypeID("Nm  "), "anim_preview");
          desc.putObject(charIDToTypeID("Usng"), stringIDToTypeID("layerSection"), nameDesc);
          executeAction(charIDToTypeID("Mk  "), desc, DialogModes.NO);
          return doc.layers[0]; // top-most
        }

        function duplicateLayerById(layerId) {
          var desc = new ActionDescriptor();
          var ref = new ActionReference();
          ref.putIdentifier(charIDToTypeID("Lyr "), layerId);
          desc.putReference(charIDToTypeID("null"), ref);
          executeAction(charIDToTypeID("Dplc"), desc, DialogModes.NO);
          return doc.activeLayer;
        }

        function selectLayersById(ids) {
          var desc = new ActionDescriptor();
          var list = new ActionList();
          for (var i = 0; i < ids.length; i++) {
            var ref = new ActionReference();
            ref.putIdentifier(charIDToTypeID("Lyr "), ids[i]);
            list.putReference(ref);
          }
          desc.putList(charIDToTypeID("null"), list);
          desc.putBoolean(charIDToTypeID("MkVs"), false);
          executeAction(charIDToTypeID("slct"), desc, DialogModes.NO);
        }

        function mergeSelectedLayers() {
          executeAction(charIDToTypeID("Mrg2"), undefined, DialogModes.NO);
          return doc.activeLayer;
        }

        function moveLayerToGroup(layerId, groupId) {
          var desc = new ActionDescriptor();
          var ref = new ActionReference();
          ref.putIdentifier(charIDToTypeID("Lyr "), layerId);
          desc.putReference(charIDToTypeID("null"), ref);
          var toRef = new ActionReference();
          toRef.putIdentifier(charIDToTypeID("Lyr "), groupId);
          desc.putReference(charIDToTypeID("T   "), toRef);
          desc.putBoolean(charIDToTypeID("Adjs"), false);
          desc.putInteger(charIDToTypeID("Vrsn"), 5);
          executeAction(charIDToTypeID("move"), desc, DialogModes.NO);
        }

        __frameMergeHelpers__ = {
          findAnimFolders,
          getOrCreateAnimPreviewFolder,
          duplicateLayerById,
          selectLayersById,
          mergeSelectedLayers,
          moveLayerToGroup
        };
      }

      // Main merge routine (can run multiple times)
      var folders = __frameMergeHelpers__.findAnimFolders();
      if (folders.length < 2) {
        alert("❌ Need at least two anim_* folders.");
        return;
      }

      var maxFrames = folders.reduce((m, f) => Math.max(m, f.layers.length), 0);
      var previewGroup = __frameMergeHelpers__.getOrCreateAnimPreviewFolder();

      for (var frameIndex = 0; frameIndex < maxFrames; frameIndex++) {
        var idsToMerge = [];

        for (var i = 0; i < folders.length; i++) {
          var folder = folders[i];
          var layer = folder.layers[frameIndex] || folder.layers[0];
          if (!layer || layer.locked) continue;
          var dup = __frameMergeHelpers__.duplicateLayerById(layer.id);
          idsToMerge.push(dup.id);
        }

        if (idsToMerge.length === 0) continue;

        __frameMergeHelpers__.selectLayersById(idsToMerge);
        var merged = __frameMergeHelpers__.mergeSelectedLayers();
        merged.name = "_a_Frame " + (frameIndex + 1);
        __frameMergeHelpers__.moveLayerToGroup(merged.id, previewGroup.id);
      }

      console.log("✅ All frames merged into 'anim_preview'");
    })();
  `;

  window.parent.postMessage(script, "*");
}
