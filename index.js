const express = require('express')
const app = express()
const path = require('path');

app.get('/', (req, res) => {

  // Enabled query to remote site.
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self' 'unsafe-inline' https://vanguard.com.ar/wp-json/show-remote-ip/v1/get-ip;"
  );

  //
  const all = req.headers 
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  let viewewrIP = ''
  if ( req.headers['cloudfront-viewer-address'] ) {
    viewewrIP = req.headers['cloudfront-viewer-address'].split(':')[0]
  }

  const body = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CloudFront + Vercel</title>  
    <link rel="icon" type="image/ico" href="/public/images/favicon.ico"> 
    <link rel="shortcut icon" type="image/ico" href="/public/images/favicon.ico"> 
    <link rel="stylesheet" href="public/css/style.css">
  </head>
  <body>
  
  <ul>
    <li>
      <spam class="title">Your public IP:</spam> <spam id="publicIP"></spam>
    </li>
    <li>
      <spam class="title">x-forwarded-for:</spam> ${ip}
    </li>
    <li>
      <spam class="title">cloudfront-viewer-address:</spam> ${viewewrIP}
    </li>
  </ul>

  <textarea>${JSON.stringify(all, null, 2)}</textarea>
  
  <script>
  fetch('https://vanguard.com.ar/wp-json/show-remote-ip/v1/get-ip')
    .then(response => response.json())
    .then(data => {
      document.getElementById('publicIP').textContent = data
    });
  </script>
  
  </body>
</html>
    `
    
    res.send(body)
})

app.use('/public', express.static(path.join(__dirname, 'public'))); //  "public" off of current is root

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

module.exports = app;