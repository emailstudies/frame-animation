// Helper: Get the layer name
function getLayerName(sel) {
  return sel.name || "(Unnamed)";
}

// Helper: Check if layer is a group (folder)
function isLayerGroup(sel) {
  return !!sel.layers;
}

// Helper: Check if the layer is locked
function isLayerLocked(sel) {
  return sel.allLocked;
}

// Helper: Get the parent name, or null if root
function getLayerParentName(sel, doc) {
  return sel.parent === doc ? null : sel.parent.name;
}

// Helper: Check if the layer is at root level
function isRootLevel(sel, doc) {
  return sel && sel.parent === doc;
}

// Main handler function
export function handleAddAnimation() {
  const script = `
    try {
      var doc = app.activeDocument;
      var sel = doc.activeLayer;

      function getLayerName(sel) {
        return sel.name || "(Unnamed)";
      }

      function isLayerGroup(sel) {
        return !!sel.layers;
      }

      function isLayerLocked(sel) {
        return sel.allLocked;
      }

      function getLayerParentName(sel, doc) {
        return sel.parent === doc ? null : sel.parent.name;
      }

      function isRootLevel(sel, doc) {
        return sel && sel.parent === doc;
      }

      if (!sel || !getLayerName(sel)) {
        alert("❗ Nothing is selected.");
      } else {
        var msg = "";
        msg += "Layer name: " + getLayerName(sel) + "\\n";
        msg += "islayergroup: " + (isLayerGroup(sel) ? "it is a folder" : "it is not a folder") + "\\n";
        msg += "islayerlocked: " + (isLayerLocked(sel) ? "it is locked" : "it is not locked") + "\\n";

        var parent = getLayerParentName(sel, doc);
        msg += "getlayerparentname: the parent name is " + (parent ? parent : "root") + "\\n";

        msg += "isrootlevel: " + (isRootLevel(sel, doc) ? "it is at root" : "it is not at root") + "\\n";

        alert(msg);
      }
    } catch (e) {
      alert("❌ Script error: " + e.message);
    }
  `;

  window.parent.postMessage(script, "*");
}
