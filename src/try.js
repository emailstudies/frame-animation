function exportGif() {
  const script = `
  (function () {
    var doc = app.activeDocument;
    if (!doc) {
      alert("❌ No active document.");
      return;
    }

    // ✅ Find anim_* folders regardless of parent
    var animFolders = [];
    for (var i = 0; i < doc.layerSets.length; i++) {
      var g = doc.layerSets[i];
      if (!g.locked && g.name.startsWith("anim_")) {
        animFolders.push(g);
      }
    }

    if (animFolders.length === 0) {
      alert("❌ No folders starting with 'anim_' found.");
      return;
    }

    // ✅ Determine max number of frames
    var maxFrames = 0;
    for (var i = 0; i < animFolders.length; i++) {
      var count = animFolders[i].layers.length;
      if (count > maxFrames) maxFrames = count;
    }

    alert("✅ Found " + animFolders.length + " animation folders. Max frames: " + maxFrames);
  })();
  `;

  window.parent.postMessage(script.trim(), "*");
}
