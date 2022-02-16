const express = require('express')
const app = express()
const path = require('path');

app.get('/', (req, res) => {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const xip = req.headers['x-client-ip']
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
  <li>Your public IP: <spam id="publicIP"></spam></li>
  <li>Your public IP: ${ip}</li>
  <li>Your public IP: ${xip}</li>
  </ul>
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
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self' 'unsafe-inline' https://vanguard.com.ar/wp-json/show-remote-ip/v1/get-ip;"
    );
    
    res.send(body)
})

app.use('/public', express.static(path.join(__dirname, 'public'))); //  "public" off of current is root

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

module.exports = app;