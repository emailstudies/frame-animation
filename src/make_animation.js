function handleAddAnimation() {
  const script = `
    try {
      alert("✅ Script injected successfully into Photopea.");
    } catch (e) {
      alert("❌ Script error: " + e.message);
    }
  `;

  window.parent.postMessage(script, "*");
}
