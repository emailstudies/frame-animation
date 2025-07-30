function openMagicCut() {
  const script = `app.showWindow("magiccut");`;
  window.parent.postMessage(script, "*");
  console.log("📤 Sent request to open Magic Cut");
}
