// ✅ runCombinedFlipbookExport.js
// 🧠 Unified script: controls, exports, and receives flipbook frames from anim_preview

window.runCombinedFlipbookExport = function () {
  console.log("🚀 Starting combined flipbook export");

  const collectedFrames = [];
  let currentFrame = 0;
  let totalFrames = 0;

  // 📥 Frame receiver
  function handleMessage(event) {
    if (event.data instanceof ArrayBuffer) {
      collectedFrames.push(event.data);
      console.log("📥 Received frame #" + collectedFrames.length);

      currentFrame++;
      if (currentFrame < totalFrames) {
        exportFrame(currentFrame);
      } else {
        window.removeEventListener("message", handleMessage);
        finishFlipbook();
      }
    } else if (typeof event.data === "string" && event.data.startsWith("[flipbook]")) {
      const msg = event.data.replace("[flipbook] ", "").trim();
      if (msg.startsWith("📦")) {
        console.log("🧮 Frame Count:", msg);
      } else if (msg.startsWith("❌")) {
        console.warn("⚠️ Flipbook Error:", msg);
      } else {
        console.log("📩 Flipbook Plugin Message:", msg);
      }
    }
  }

  window.addEventListener("message", handleMessage);

  // 🧠 Inject main export script into Photopea
  const initScript = `
    (function () {
      try {
        var doc = app.activeDocument;
        var group = null;

        for (var i = 0; i < doc.layers.length; i++) {
          var layer = doc.layers[i];
          if (layer.typename === "LayerSet" && layer.name === "anim_preview") {
            group = layer;
            break;
          }
        }

        if (!group) {
          app.echoToOE("[flipbook] ❌ anim_preview not found");
          return;
        }

        for (var i = 0; i < doc.layers.length; i++) {
          doc.layers[i].visible = (doc.layers[i] === group);
        }
        group.visible = true;
        app.refresh();

        app.echoToOE("[flipbook] 📦 anim_preview contains " + group.layers.length + " frames.");
        app.echoToOE("[flipbook] ✅ anim_preview created - done");
      } catch (e) {
        app.echoToOE("[flipbook] ❌ JS ERROR: " + e.message);
      }
    })();
  `;

  parent.postMessage(initScript, "*");

  // ⏳ Give time to set up, then read frame count and start
  setTimeout(() => {
    const frameCountScript = `
      (function () {
        var doc = app.activeDocument;
        var group = null;

        for (var i = 0; i < doc.layers.length; i++) {
          if (doc.layers[i].typename === "LayerSet" && doc.layers[i].name === "anim_preview") {
            group = doc.layers[i];
            break;
          }
        }

        if (!group || group.layers.length === 0) {
          app.echoToOE("[flipbook] ❌ No frames found in anim_preview");
          return;
        }

        window._flipbookTotal = group.layers.length;
        window._flipbookGroupName = "anim_preview";
        window._flipbookIndex = 0;
        app.echoToOE("[flipbook] 📦 " + window._flipbookTotal + " frames");
        doc.saveToOE("png");
      })();
    `;
    parent.postMessage(frameCountScript, "*");

    // start export loop after 500ms
    setTimeout(() => {
      totalFrames = 0;
      const countAndStartScript = `
        (function () {
          var doc = app.activeDocument;
          var group = null;
          for (var i = 0; i < doc.layers.length; i++) {
            if (doc.layers[i].typename === "LayerSet" && doc.layers[i].name === "anim_preview") {
              group = doc.layers[i];
              break;
            }
          }
          if (!group) return;
          var count = group.layers.length;
          app.echoToOE("[flipbook] 📦 anim_preview contains " + count + " frames.");
        })();
      `;
      parent.postMessage(countAndStartScript, "*");

      // Now call exportFrame for frame 0
      exportFrame(0);
    }, 500);
  }, 300);

  // 🔁 Export single frame at given index
  function exportFrame(index) {
    const script = `
      (function () {
        var doc = app.activeDocument;
        var group = null;
        for (var i = 0; i < doc.layers.length; i++) {
          if (doc.layers[i].typename === "LayerSet" && doc.layers[i].name === "anim_preview") {
            group = doc.layers[i];
            break;
          }
        }

        if (!group) {
          app.echoToOE("[flipbook] ❌ anim_preview not found during export");
          return;
        }

        for (var j = 0; j < group.layers.length; j++) {
          group.layers[j].visible = false;
        }

        var layer = group.layers[${index}];
        if (!layer) {
          app.echoToOE("[flipbook] ❌ Frame ${index} missing");
          return;
        }

        layer.visible = true;
        app.refresh();
        doc.saveToOE("png");
      })();
    `;

    parent.postMessage(script, "*");
  }

  // ✅ Viewer launcher
  function finishFlipbook() {
    console.log("📸 Flipbook: Received " + collectedFrames.length + " frames.");
    if (collectedFrames.length === 0) {
      alert("❌ No flipbook frames received.");
      return;
    }

    const html = generateFlipbookHTML(collectedFrames);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const win = window.open();
    win.document.open();
    win.document.write(html);
    win.document.close();
  }
};
