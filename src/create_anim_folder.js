function createTopLevelFolder() {
  const script = `
    try {
      var desc = new ActionDescriptor();
      var ref = new ActionReference();
      ref.putClass(stringIDToTypeID("layerSection")); // "layerSection" = group/folder
      desc.putReference(charIDToTypeID("null"), ref);

      // Optional: set a name for the group
      var nameDesc = new ActionDescriptor();
      nameDesc.putString(stringIDToTypeID("name"), "New Folder");
      desc.putObject(stringIDToTypeID("using"), stringIDToTypeID("layerSection"), nameDesc);

      executeAction(charIDToTypeID("Mk  "), desc, DialogModes.NO);
    } catch (e) {
      alert("Error creating folder: " + e.message);
    }
  `;
  window.parent.postMessage(script, "*");
}
