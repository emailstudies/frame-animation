// ✅ flipbook_logic.js — Combined logic (Photopea + plugin side)

let totalFrames = 0;
let currentIndex = 0;
const collectedFrames = [];

window.runCombinedFlipbookExport = function () {
  currentIndex = 0;
  collectedFrames.length = 0;

  const initScript = `
    (function () {
      try {
        var doc = app.activeDocument;
        var group = null;
        for (var i = 0; i < doc.layers.length; i++) {
          if (doc.layers[i].typename === "LayerSet" && doc.layers[i].name === "anim_preview") {
            group = doc.layers[i];
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
        app.refresh();
        app.echoToOE("[flipbook] 📦 " + group.layers.length + " frames");
        app.echoToOE("[flipbook] ✅ anim_preview created - done");
      } catch (e) {
        app.echoToOE("[flipbook] ❌ Init error: " + e.message);
      }
    })();
  `;

  parent.postMessage(initScript, "*");
};

function showFrameScript(index) {
  return `
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

        if (!group || ${index} >= group.layers.length) {
          app.echoToOE("[flipbook] ✅ done");
          return;
        }

        for (var j = 0; j < group.layers.length; j++) {
          group.layers[j].visible = false;
        }

        var layer = group.layers[${index}];
        layer.visible = true;
        doc.activeLayer = layer;
        app.refresh();

        app.echoToOE("[flipbook] 👁️ frame ready " + ${index});
      } catch (e) {
        app.echoToOE("[flipbook] ❌ JS ERROR: " + e.message);
      }
    })();
  `;
}

const saveScript = `
  (function () {
    try {
      app.activeDocument.saveToOE("png");
    } catch (e) {
      app.echoToOE("[flipbook] ❌ Save error: " + e.message);
    }
  })();
`;

window.addEventListener("message", (event) => {
  if (event.data instanceof ArrayBuffer) {
    collectedFrames.push(event.data);
    console.log("📥 Received frame #" + collectedFrames.length);

    if (collectedFrames.length === totalFrames) {
      console.log("✅ All frames received");
      openFlipbook(collectedFrames);
    } else {
      requestNextFrame();
    }
  } else if (typeof event.data === "string") {
    const msg = event.data.trim();
    console.log("📩 Flipbook Plugin Message:", msg);

    if (msg.startsWith("[flipbook] 📦")) {
      totalFrames = parseInt(msg.match(/\d+/)[0], 10);
    }

    if (msg === "[flipbook] ✅ anim_preview created - done") {
      requestNextFrame();
    }

    if (msg.startsWith("[flipbook] 👁️ frame ready")) {
      setTimeout(() => {
        parent.postMessage(saveScript, "*");
      }, 200);
    }
  }
});

function requestNextFrame() {
  parent.postMessage(showFrameScript(currentIndex), "*");
  currentIndex++;
}

function openFlipbook(frames) {
  const html = generateFlipbookHTML(frames);
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank");
}
