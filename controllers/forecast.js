let path = require('path')
let config = require(path.resolve(__dirname, '../config'))
let request = require('request-promise')
let _ = require('lodash')

const zeroKelvin = 273.15
const millisecondsInDay = 1000 * 60 * 60 * 24
const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const url = 'http://api.openweathermap.org/data/2.5/forecast?id={id}&APPID=' + config.key

module.exports = (() => {

    const parseForecast = (forecast) => {
        let parsedForecast = { days: [] }

        // Se muestran dos pronósticos: el del día (a las 12hs) y el de la noche (a las 24hs)
        // Se agrupa primero por fecha, luego se busca el pronóstico a las 12hs y a las 24hs entre los valores para cada día
        let daysForecast = _.groupBy(forecast.list, (dayForecast) => { 
            let date = new Date(dayForecast.dt * 1000) // de UNIX timestamp a ES timestamp

            // Si es la entrada correspondiente a la hora 0, la juntamos con los registros del día anterior para hacer la hora "24"
            if (date.getHours() === 0) {
                date.setDate(date.getDate() - 1)
            }
            return date.getFullYear().toString() + (date.getMonth() + 1).toString() + date.getDate().toString() 
        })
        
        Object.keys(daysForecast).forEach((day) => {
            // Fecha del pronóstico
            let dateFull = new Date(daysForecast[day][0].dt * 1000)
            let simplifiedDate = new Date(dateFull.getFullYear(), dateFull.getMonth(), dateFull.getDate())
            // Fecha actual
            let simplifiedNow = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())
            
            // Se busca el registro de las 12hs
            let midday = daysForecast[day].find((time) => { return new Date(time.dt * 1000).getHours() === 12 })
            // Se busca el registro de las 24hs
            let midnight = daysForecast[day].find((time) => { return new Date(time.dt * 1000).getHours() === 0 })
            
            let dayForecast = {
                tempDay: midday ? midday.main.temp - zeroKelvin : null,
                tempNight: midnight ? midnight.main.temp - zeroKelvin : null,
                weatherDayMain: midday ? midday.weather[0].main : null,
                weatherDayDesc: midday ? midday.weather[0].description : null,
                weatherDayIcon: midday ? midday.weather[0].icon : null,
                weatherNightMain: midnight ? midnight.weather[0].main : null,
                weatherNightDesc: midnight ? midnight.weather[0].description : null,
                weatherNightIcon: midnight ? midnight.weather[0].icon : null,
                humidityDay: midday ? midday.main.humidity : null,
                humidityNight: midnight ? midnight.main.humidity: null,

            }

            if (simplifiedDate.getTime() === simplifiedNow.getTime()) {
                dayForecast.date = "Hoy"
            } else if ((Math.abs(simplifiedDate.getTime() - simplifiedNow.getTime())) / millisecondsInDay === 1) {
                dayForecast.date = "Mañana"
            } else {
                dayForecast.date = daysOfWeek[simplifiedDate.getDay()] + " " + simplifiedDate.getDate() + "/" + (simplifiedDate.getMonth() + 1)
            }

            parsedForecast.days.push(dayForecast)
        })
        return parsedForecast
    }

    const getForecast = (id) => {
        return new Promise((resolve, reject) => {
            request.get(url.replace('{id}', id), (error, response, body) => {
                if (error) {
                    console.dir(error)
                    reject(error)
                } else {
                    resolve(parseForecast(JSON.parse(body)))
                }
            })
        })
    }

    return {
        getForecast: getForecast
    }
})()