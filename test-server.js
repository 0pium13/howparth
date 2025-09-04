// Minimal test server to diagnose issues
console.log('Starting minimal test server...');

const express = require('express');
const app = express();
const PORT = 3002;

app.get('/health', (req, res) => {
  res.json({ status: 'OK', port: PORT });
});

app.listen(PORT, () => {
  console.log(`✅ Test server running on port ${PORT}`);
  console.log(`🔗 Test: curl http://localhost:${PORT}/health`);
});
