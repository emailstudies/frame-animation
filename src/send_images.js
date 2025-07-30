function openMagicCut() {
  const script = `app.showWindow("exportasgif");`;
  window.parent.postMessage(script, "*");
  console.log("📤 Sent request to open Magic Cut");
}

/*
function openMagicCut() {
  const script = `app.showWindow("magiccut");`;
  window.parent.postMessage(script, "*");
  console.log("📤 Sent request to open Magic Cut");
}
*/
