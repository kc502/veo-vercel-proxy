    const fetch = require('node-fetch');

    module.exports = async (req, res) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

      if (req.method === 'OPTIONS') {
        return res.status(200).end();
      }

      const { operationName, apiKey } = req.body;

      if (!operationName || !apiKey) {
        return res.status(400).send('Operation name and API key are required.');
      }

      const proxyUrl = 'https://corsproxy.io/?';
      const targetUrl = `https://generativelanguage.googleapis.com/v1beta/${operationName}`;

      try {
        const pollResp = await fetch(proxyUrl + encodeURIComponent(targetUrl), {
          headers: { 'x-goog-api-key': apiKey }
        });

        if (!pollResp.ok) {
          const errorText = await pollResp.text();
          return res.status(pollResp.status).send(`Poll failed: ${pollResp.statusText}\n${errorText}`);
        }

        const status = await pollResp.json();
        res.status(200).json(status);

      } catch (error) {
        console.error('Polling failed:', error);
        res.status(500).send(`Error: ${error.message}`);
      }
    };

