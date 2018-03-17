let express = require('express')
let router = express.Router()
let Cities = require('./controllers/cities')
let Forecast = require('./controllers/forecast')

console.log("Registro de endpoints de la API")

console.log("/cities --> devuelve el listado de ciudades con sus IDs")
console.log("   /cities?page={x}&count={y} --> retorna las x ciudades de la página y (la primera página es 1)")
router.get('/cities', (req, res) => {
    res.json(Cities.getCities(req.param('page'), req.param('count')))
})

console.log("/forecast --> devuelve el pronóstico para los próximos 5 días para una ciudad")
router.get('/forecast', (req, res) => {
    Forecast.getForecast(req.param('id')).then((forecast) => {
        res.json(forecast)
    }).catch((error) => {
        res.status(404).send(error)
    })
})

module.exports = router