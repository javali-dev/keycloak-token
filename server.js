const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const port = 3000;

const KEYCLOAK_CLIENT_ID = "core-backend-service";
const KEYCLOAK_CLIENT_SECRET = "Sdh3rN9eADGbIIpyN69CpuALEvrcQ4Qe"; // your client secret
const KEYCLOAK_REALM = "phisiomatic";
const KEYCLOAK_SERVER_URL = "http://localhost:8100";
const REDIRECT_URI = "http://localhost:3000/callback"; // your client's redirect URI

app.get('/login', (req, res) => {
  const authUrl = `${KEYCLOAK_SERVER_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/auth?client_id=${encodeURIComponent(KEYCLOAK_CLIENT_ID)}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=openid`;
  res.redirect(authUrl);
});

app.get('/callback', async (req, res) => {
  const { code } = req.query;
  try {
    const response = await axios.post(`${KEYCLOAK_SERVER_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/token`, new URLSearchParams({
      client_id: KEYCLOAK_CLIENT_ID,
      client_secret: KEYCLOAK_CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code',
      code,
    }), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const { access_token, refresh_token, id_token } = response.data;

    res.send(`
      <html>
        <head>
          <title>Access Token</title>
          <script>
            function copyToClipboard() {
              const text = document.getElementById('accessToken').textContent;
              navigator.clipboard.writeText(text).then(() => {
                alert('Access token copied to clipboard');
              }, (err) => {
                console.error('Could not copy text: ', err);
              });
            }

            function reloadPage() {
              window.location.href = '/reload';
            }
          </script>
        </head>
        <body>
          <h1>Access Token</h1>
          <p id="accessToken">${access_token}</p>
          <button onclick="copyToClipboard()">Copy Access Token</button>
          <button onclick="reloadPage()">Reload and Regenerate Token</button>
        </body>
      </html>
    `);
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
});

app.get('/reload', (req, res) => {
  res.redirect('/login');
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
