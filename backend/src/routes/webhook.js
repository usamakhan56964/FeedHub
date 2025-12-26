/*import express from 'express';

const router = express.Router();

router.post('/whatsapp', (req, res) => {
  const ad = req.body;

  console.log('📩 WhatsApp webhook received ad:');
  console.log({
    title: ad.title,
    price: ad.price,
    media: ad.media?.[0]?.media_url
  });

  res.status(200).json({ success: true });
});*/

/*router.post('/whatsapp', (req, res) => {
  console.log('🔥 WEBHOOK HIT 🔥');
  console.log('BODY:', req.body);

  res.status(200).json({ success: true });
});


export default router;*/


/*router.post('/whatsapp', (req, res) => {
  console.log('🔥🔥🔥 WEBHOOK ROUTE HIT 🔥🔥🔥');
  console.log('HEADERS:', req.headers);
  console.log('BODY:', JSON.stringify(req.body, null, 2));

  res.status(200).json({ success: true });
});*/


import express from 'express';

const router = express.Router();

router.post('/whatsapp', (req, res) => {
  console.log('🔥🔥🔥 WEBHOOK ROUTE HIT 🔥🔥🔥');
  console.log('BODY:', JSON.stringify(req.body, null, 2));

  res.status(200).json({ success: true });
});

export default router;   // ✅ THIS LINE FIXES EVERYTHING


