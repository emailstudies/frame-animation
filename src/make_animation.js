function handleAddAnimation() {
  const userInput = document.getElementById("animFolderInput").value.trim();
  if (!userInput) {
    alert("Please enter a folder name.");
    return;
  }

  const folderName = `anim_${userInput}`;

  const script = `
    // Create a group named "${folderName}"
    var desc1 = new ActionDescriptor();
    var ref1 = new ActionReference();
    ref1.putClass(stringIDToTypeID("layerSection"));
    desc1.putReference(charIDToTypeID("null"), ref1);

    var desc2 = new ActionDescriptor();
    desc2.putString(charIDToTypeID("Nm  "), "${folderName}");
    desc1.putObject(charIDToTypeID("Usng"), stringIDToTypeID("layerSection"), desc2);

    app.doAction("make", desc1);

    // Select the newly created group
    var group = app.activeDocument.activeLayer;

    // Create a new layer named "Frame 1"
    var desc3 = new ActionDescriptor();
    var ref2 = new ActionReference();
    ref2.putClass(charIDToTypeID("Lyr "));
    desc3.putReference(charIDToTypeID("null"), ref2);

    var desc4 = new ActionDescriptor();
    desc4.putString(charIDToTypeID("Nm  "), "Frame 1");
    desc3.putObject(charIDToTypeID("Usng"), charIDToTypeID("Lyr "), desc4);

    app.doAction("make", desc3);

    // Move the layer into the group
    var newLayer = app.activeDocument.activeLayer;
    newLayer.move(group, ElementPlacement.INSIDE);
  `;

  window.parent.postMessage(script, "*");
}
