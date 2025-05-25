const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Parse JSON bodies (as sent by webhook)
app.use(express.json());

// Vote webhook route (DiscordBotList.com)
app.post('/dblwebhook', (req, res) => {
  console.log('Vote received!', req.body);
  res.sendStatus(200); // Respond to the site
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Webhook server listening on port ${port}`);
});
