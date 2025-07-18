function handleCreateFolder() {
  const script = `
    try {
      var desc = new ActionDescriptor();
      var ref = new ActionReference();
      ref.putClass(stringIDToTypeID("layerSection")); // "layerSection" means folder
      desc.putReference(charIDToTypeID("null"), ref);

      // Optional: give the folder a name
      var nameDesc = new ActionDescriptor();
      nameDesc.putString(stringIDToTypeID("name"), "anim_1");
      desc.putObject(stringIDToTypeID("using"), stringIDToTypeID("layerSection"), nameDesc);

      // ✅ No parent specified → will be added at root
      executeAction(charIDToTypeID("Mk  "), desc, DialogModes.NO);
    } catch (e) {
      alert("Error: " + e.message);
    }
  `;
  window.parent.postMessage(script, "*");
}
