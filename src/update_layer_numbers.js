function handleUpdateLayerNumbers() {
  const script = `
    var doc = app.activeDocument;
    var msg = "";

    for (var i = 0; i < doc.layers.length; i++) {
      var folder = doc.layers[i];
      msg += "Layer " + i + ": " + folder.name + " | isGroup: " + folder.isGroup + "\\n";
    }

    alert(msg);
  `;

  window.parent.postMessage(script, "*");
}
