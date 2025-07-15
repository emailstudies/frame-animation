function testSetTimeout() {
  const script =
    '(function () {\n' +
    '  let count = 0;\n' +
    '  function tick() {\n' +
    '    count++;\n' +
    '    app.activeDocument.activeLayer.name = "Tick " + count;\n' +
    '    if (count < 5) setTimeout(tick, 300);\n' +
    '  }\n' +
    '  tick();\n' +
    '})();';
  window.parent.postMessage(script, "*");
}
