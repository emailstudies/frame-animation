function getStepwiseDemoExportScript() {
  return `
    (function () {
      const DELAY = 500; // ms between frames

      if (!window.__demoExport__) {
        const doc = app.activeDocument;
        const demoFolder = doc.layers.find(layer => layer.name === "demo" && layer.type === 'group');
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

        app.echoToOE(\`[demo] ✅ ready for frames: \${demoFolder.layers.length}\`);
        exportNextDemoFrame(); // start process
      } else {
        exportNextDemoFrame(); // resume process
      }

      function exportNextDemoFrame() {
        const state = window.__demoExport__;
        if (state.index >= state.total) {
          app.echoToOE(\`[demo] ✅ All \${state.total} frames sent.\`);
          delete window.__demoExport__;
          return;
        }

        const doc = app.documents.find(d => d.id === state.originalDocId);
        app.openDocument(doc.id);

        const demoFolder = doc.layers.find(layer => layer.name === state.demoFolderName && layer.type === 'group');
        const layerToExport = demoFolder.layers[state.index];

        doc.duplicate().then(dup => {
          app.openDocument(dup.id);
          const dupDoc = app.activeDocument;
          const dupDemo = dupDoc.layers.find(layer => layer.name === state.demoFolderName && layer.type === 'group');

          for (let i = dupDemo.layers.length - 1; i >= 0; i--) {
            if (i !== state.index) dupDemo.layers[i].remove();
          }

          dupDoc.flatten();
          dupDoc.saveToOE("png");
          app.echoToOE(\`[demo] ✅ frame \${state.index + 1} sent\`);

          dupDoc.close();

          state.index++;
          setTimeout(exportNextDemoFrame, DELAY);
        });
      }
    })();
  `;
}
