// flipbook_logic.js

document.addEventListener("DOMContentLoaded", function () {
  var btn = document.getElementById("previewSelectedBtn");

  if (!btn) {
    console.error("❌ Button not found: #previewSelectedBtn");
    return;
  }

  btn.onclick = function () {
    var script =
      "(function () {\n" +
      "  try {\n" +
      "    var doc = app.activeDocument;\n" +
      "    if (!doc) {\n" +
      "      app.echoToOE('❌ No active document.');\n" +
      "      return;\n" +
      "    }\n" +
      "    var group = null;\n" +
      "    for (var i = 0; i < doc.layers.length; i++) {\n" +
      "      if (doc.layers[i].name === 'anim_preview' && doc.layers[i].typename === 'LayerSet') {\n" +
      "        group = doc.layers[i];\n" +
      "        break;\n" +
      "      }\n" +
      "    }\n" +
      "    if (!group || group.layers.length < 2) {\n" +
      "      app.echoToOE('❌ anim_preview not found or less than 2 layers');\n" +
      "      return;\n" +
      "    }\n" +
      "    for (var f = 0; f < 2; f++) {\n" +
      "      for (var j = 0; j < group.layers.length; j++) {\n" +
      "        group.layers[j].visible = false;\n" +
      "      }\n" +
      "      group.layers[f].visible = true;\n" +
      "      var tempDoc = app.documents.add(doc.width, doc.height, doc.resolution, 'export_frame_' + f, NewDocumentMode.RGB);\n" +
      "      app.activeDocument = doc;\n" +
      "      group.layers[f].duplicate(tempDoc, ElementPlacement.PLACEATBEGINNING);\n" +
      "      app.activeDocument = tempDoc;\n" +
      "      tempDoc.saveToOE('png');\n" +
      "      app.echoToOE('[flipbook] ✅ Frame ' + f + ' exported');\n" +
      "      tempDoc.close(SaveOptions.DONOTSAVECHANGES);\n" +
      "    }\n" +
      "    app.echoToOE('[flipbook] ✅ All frames sent.');\n" +
      "  } catch (e) {\n" +
      "    app.echoToOE('❌ ERROR: ' + e.message);\n" +
      "  }\n" +
      "})();";

    parent.postMessage(script, "*");
    console.log("📤 Sent flipbook export script to Photopea.");
  };

  // Frame receiver + flipbook builder
  var receivedFrames = [];

  window.addEventListener("message", function (event) {
    if (event.data instanceof ArrayBuffer) {
      console.log("📥 Received frame", receivedFrames.length + 1);
      receivedFrames.push(event.data);

      if (receivedFrames.length === 2) {
        // All frames received, build preview
        var urls = receivedFrames.map(function (buf) {
          return URL.createObjectURL(new Blob([buf], { type: "image/png" }));
        });

        var htmlContent = "\
<!DOCTYPE html>\n\
<html>\n\
<head>\n\
  <title>Flipbook Preview</title>\n\
  <style>\n\
    body {\n\
      margin: 0;\n\
      background: black;\n\
      display: flex;\n\
      align-items: center;\n\
      justify-content: center;\n\
      height: 100vh;\n\
    }\n\
    canvas {\n\
      image-rendering: pixelated;\n\
    }\n\
  </style>\n\
</head>\n\
<body>\n\
  <canvas id=\"flipCanvas\"></canvas>\n\
  <script>\n\
    var urls = " + JSON.stringify(urls) + ";\n\
    var canvas = document.getElementById('flipCanvas');\n\
    var ctx = canvas.getContext('2d');\n\
    var images = [];\n\
    var frame = 0;\n\
\n\
    function loadImages(index) {\n\
      index = index || 0;\n\
      if (index >= urls.length) {\n\
        playFlipbook();\n\
        return;\n\
      }\n\
      var img = new Image();\n\
      img.onload = function() {\n\
        images.push(img);\n\
        if (images.length === 1) {\n\
          canvas.width = img.width;\n\
          canvas.height = img.height;\n\
        }\n\
        loadImages(index + 1);\n\
      };\n\
      img.src = urls[index];\n\
    }\n\
\n\
    function playFlipbook() {\n\
      setInterval(function() {\n\
        ctx.clearRect(0, 0, canvas.width, canvas.height);\n\
        ctx.drawImage(images[frame], 0, 0);\n\
        frame = (frame + 1) % images.length;\n\
      }, 500);\n\
    }\n\
\n\
    loadImages();\n\
  <\/script>\n\
</body>\n\
</html>";

        var blob = new Blob([htmlContent], { type: "text/html" });
        var win = window.open();
        if (win) {
          win.document.write(htmlContent);
          win.document.close();
        } else {
          alert("⚠️ Popup blocked! Please allow popups and try again.");
        }

        receivedFrames = []; // Reset for next run
      }
    } else if (typeof event.data === "string") {
      console.log("📩 Message from Photopea:", event.data);
      if (event.data.indexOf("[flipbook]") === 0) {
        console.log(event.data);
      } else {
        alert(event.data);
      }
    }
  });
});
