let express = require("express")
let app = express()

const port = process.env.PORT || 3001

let routes = require('./routes')

app.use('/api', routes)

app.listen(port, () => {
    console.log("Escuchando en puerto " + port)
})