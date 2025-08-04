window.getStepwiseDemoExportScript = function () {
  return `
    (function () {
      const DELAY = 500; // ms delay between frames

      if (!window.__demoExport__) {
        const doc = app.activeDocument;
        const demoFolder = doc.layers.find(l => l.name === "demo" && l.type === 'group');
        if (!demoFolder) {
          app.echoToOE("[demo] ❌ Error: Demo folder not found.");
          return;
        }
        window.__demoExport__ = {
          index: 0,
          total: demoFolder.layers.length,
          originalDocId: doc.id,
          demoFolderName: demoFolder.name,
        };
        app.echoToOE("[demo] ✅ Ready to export " + demoFolder.layers.length + " frames.");
        exportNext();
      } else {
        exportNext();
      }

      function exportNext() {
        const state = window.__demoExport__;
        if (state.index >= state.total) {
          app.echoToOE("[demo] ✅ All " + state.total + " frames exported.");
          delete window.__demoExport__;
          return;
        }

        const doc = app.documents.find(d => d.id === state.originalDocId);
        app.openDocument(doc.id);

        const demoFolder = doc.layers.find(l => l.name === state.demoFolderName && l.type === 'group');
        if (!demoFolder) {
          app.echoToOE("[demo] ❌ Demo folder missing.");
          delete window.__demoExport__;
          return;
        }

        // Duplicate document for export
        doc.duplicate().then(dup => {
          app.openDocument(dup.id);
          const dupDoc = app.activeDocument;
          const dupDemo = dupDoc.layers.find(l => l.name === state.demoFolderName && l.type === 'group');

          // Remove all layers except the current frame
          for (let i = dupDemo.layers.length - 1; i >= 0; i--) {
            if (i !== state.index) {
              dupDemo.layers[i].remove();
            }
          }

          dupDoc.flatten();
          dupDoc.saveToOE("png");
          app.echoToOE("[demo] ✅ Frame " + (state.index + 1) + " exported.");

          dupDoc.close();

          state.index++;
          setTimeout(exportNext, DELAY);
        });
      }
    })();
  `;
};
