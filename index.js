const express = require('express')
const app = express()

app.get('/', (req, res) => {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    res.send(`<p>Hello World!</br>Your IP is: ${ip}</p>`)
})

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

module.exports = app;