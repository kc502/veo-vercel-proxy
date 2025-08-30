    const fetch = require('node-fetch');

    module.exports = async (req, res) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

      if (req.method === 'OPTIONS') {
        return res.status(200).end();
      }

      const { apiKey, prompt, negativePrompt, aspectRatio, personGeneration, model } = req.body;

      if (!apiKey || !prompt) {
        return res.status(400).send('API key and prompt are required.');
      }

      const proxyUrl = 'https://corsproxy.io/?'; 
      const targetUrl = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:predictLongRunning`;
      
      try {
        const startResp = await fetch(proxyUrl + encodeURIComponent(targetUrl), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
          body: JSON.stringify({
            instances: [{ prompt }],
            parameters: {
              aspectRatio,
              ...(negativePrompt ? { negativePrompt } : {}),
              ...(personGeneration ? { personGeneration } : {})
            }
          })
        });

        if (!startResp.ok) {
          const errorText = await startResp.text();
          return res.status(startResp.status).send(`Start failed: ${startResp.statusText}\n${errorText}`);
        }

        const op = await startResp.json();
        res.status(200).json({ operationName: op.name });

      } catch (error) {
        console.error('API call failed:', error);
        res.status(500).send(`Error: ${error.message}`);
      }
    };

