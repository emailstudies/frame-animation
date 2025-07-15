function exportGif() {
  const script =
    'await app.runMenuCommand("toTimeline");\n' +
    'await app.runMenuCommand("exportAsGif");';
  window.parent.postMessage(script, "*");
}
