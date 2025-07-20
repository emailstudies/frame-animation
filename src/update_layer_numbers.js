const script = `
var doc = app.activeDocument;

for (var i = 0; i < doc.layers.length; i++) {
  var folder = doc.layers[i];

  if (!folder.isGroup || folder.name.indexOf("anim_") !== 0) continue;

  var frameLayers = [];

  for (var j = 0; j < folder.layers.length; j++) {
    var layer = folder.layers[j];
    if (!layer.isGroup) frameLayers.push(layer); // only push non-folder layers
  }

  var max = frameLayers.length;
  if (max === 0) continue;

  var baseName = frameLayers[max - 1].name; // bottom-most frame layer

  for (var k = 0; k < max; k++) {
    var frameNum = k + 1;
    frameLayers[k].name = frameNum + "/" + max + " " + baseName;
  }
}

alert("Layer Numbers Updated");
`;
window.parent.postMessage(script, "*");
