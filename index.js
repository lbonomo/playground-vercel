const express = require('express')
const app = express()


app.use(express.static('public'))


app.get('/', (req, res) => {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    console.log(`Client IP: ${ip}`)
    res.send('Hello World!')
})

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

module.exports = app;