function handleAddAnimation() {
  const userInput = document.getElementById("animFolderInput").value.trim();
  if (!userInput) {
    alert("Please enter a folder name.");
    return;
  }

  const folderName = `anim_${userInput}`;
  const script = `
    var doc = app.activeDocument;
    var group = doc.layerTree.addLayerGroup("${folderName}");
    group.addLayer("Frame 1");
  `;

  window.parent.postMessage(script, "*");
}
