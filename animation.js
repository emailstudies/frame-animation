(function () {
  if (!app || !app.activeDocument) {
    alert("No active document.");
    return;
  }

  var doc = app.activeDocument;

  // Find all anim folders
  var animFolders = doc.layerSets.filter(f => f.name.toLowerCase().startsWith("anim") && !f.allLocked);
  if (animFolders.length === 0) {
    alert("❌ No 'anim' folders found.");
    return;
  }

  // Determine max frames
  var maxFrames = Math.max(...animFolders.map(f => f.artLayers.length));

  var result = "";

  for (var i = 0; i < maxFrames; i++) {
    result += `Frame ${i + 1}:\n`;
    for (var j = 0; j < animFolders.length; j++) {
      var folder = animFolders[j];
      var frameIndex = folder.artLayers.length - 1 - i; // bottom is Frame 1
      if (frameIndex >= 0) {
        var layer = folder.artLayers[frameIndex];
        result += `  ${folder.name} > ${layer.name}\n`;
      } else {
        result += `  ${folder.name} > [No layer]\n`;
      }
    }
    result += "\n";
  }

  alert(result || "No frames to show.");
})();
