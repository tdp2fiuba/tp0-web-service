let express = require("express")
let app = express()

const port = process.env.PORT || 8080

let routes = require('./routes')

app.set('json replacer', (key, value) => {
    if (typeof value === 'undefined') {
        return null
    }
    return value
})

app.use('/api', routes)

app.listen(port, () => {
    console.log("Escuchando en puerto " + port)
})