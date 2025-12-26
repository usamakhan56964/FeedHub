import express from 'express';

const router = express.Router();

// Mock webhook endpoint (simulates WhatsApp / social platform callback)
router.post('/whatsapp', (req, res) => {
  // Log incoming payload for debugging and verification
  console.log('🔥 WEBHOOK ROUTE HIT');
  console.log('BODY:', JSON.stringify(req.body, null, 2));

  // Respond immediately to acknowledge receipt
  res.status(200).json({ success: true });
});

// Export router so it can be mounted in the main app
export default router;
