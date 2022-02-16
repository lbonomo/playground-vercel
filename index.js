const express = require('express')
const app = express()

app.get('/', (req, res) => {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const xip = req.headers['x-client-ip']
    res.send(`<p>Hello World!</br>Your IP is: ${ip} / ${xip}</p>`)
})

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

module.exports = app;