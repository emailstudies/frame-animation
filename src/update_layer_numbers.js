async function handleUpdateLayerNumbers() {
  var doc = app.activeDocument;

  // Loop through all top-level layers to find 'anim_' folders
  for (let i = 0; i < doc.layers.length; i++) {
    let folder = doc.layers[i];

    // Skip if not a group or doesn't start with 'anim_'
    if (!folder.isGroup || !folder.name.startsWith("anim_")) continue;

    let layers = folder.layers.filter(layer => !layer.isGroup); // Only non-folder layers
    let max = layers.length;
    if (max === 0) continue;

    // Bottommost layer (last in layers[]) is the first in visual order
    let baseName = layers[max - 1].name;

    for (let j = 0; j < max; j++) {
      let frameNum = j + 1;
      layers[j].name = `${frameNum}/${max} ${baseName}`;
    }
  }

  alert("Layer Numbers Updated");
}

