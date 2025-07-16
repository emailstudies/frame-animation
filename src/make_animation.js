function handleAddAnimation() {
  const script = `
    try {
      var doc = app.activeDocument;
      var sel = doc.activeLayer;

      if (!sel) {
        alert("❗ Nothing is selected.");
        return;
      }

      // Your folder creation logic would follow here...
      alert("✅ Something is selected: " + sel.name);
    } catch (e) {
      alert("❌ Script Error: " + e.message);
    }
  `;

  window.parent.postMessage(script, "*");
}
