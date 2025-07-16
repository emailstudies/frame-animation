function mergeFrames() {
  const script = `
    (function () {
      alert("hello");
    })();
  `.trim();

  window.parent.postMessage(script, "*");
}

function exportGif() {
  const script = `
(function () {
  if (!app || !app.activeDocument) {
    alert("No active document.");
    return;
  }

  var doc = app.activeDocument;

  // Collect all anim folders manually
  var animFolders = [];
  for (var i = 0; i < doc.layerSets.length; i++) {
    var folder = doc.layerSets[i];
    if (folder.name.toLowerCase().startsWith("anim") && !folder.allLocked) {
      animFolders.push(folder);
    }
  }

  if (animFolders.length === 0) {
    alert("❌ No 'anim' folders found.");
    return;
  }

  // Determine the maximum number of frames (layers in folders)
  var maxFrames = 0;
  for (var i = 0; i < animFolders.length; i++) {
    maxFrames = Math.max(maxFrames, animFolders[i].artLayers.length);
  }

  var result = "";

  for (var i = 0; i < maxFrames; i++) {
    result += "Frame " + (i + 1) + ":\\n";
    for (var j = 0; j < animFolders.length; j++) {
      var folder = animFolders[j];
      var frameIndex = folder.artLayers.length - 1 - i; // bottom = Frame 1
      if (frameIndex >= 0) {
        var layer = folder.artLayers[frameIndex];
        result += "  " + folder.name + " > " + layer.name + "\\n";
      } else {
        result += "  " + folder.name + " > [No layer]\\n";
      }
    }
    result += "\\n";
  }

  alert(result || "No frames to show.");
})();`.trim();

  window.parent.postMessage(script, "*");
}
