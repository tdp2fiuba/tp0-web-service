let path = require('path')
let config = require(path.resolve(__dirname, '../config'))
let request = require('request-promise')
let _ = require('lodash')
let Cities = require('./cities')

const zeroKelvin = 273.15
const millisecondsInDay = 1000 * 60 * 60 * 24
const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const url = 'http://api.openweathermap.org/data/2.5/forecast?id={id}&APPID=' + config.key
const timezone = 'http://api.timezonedb.com/v2/get-time-zone?key=' + config.tzKey + '&format=json&by=position&lat={lat}}&lng={lon}'

module.exports = (() => {

    const parseForecast = (forecast, timezoneDiff) => {
        let parsedForecast = { days: [] }

        // Se pasan las fechas a hora local
        forecast.list = forecast.list.map((day) => {
            day.datetimeOld = new Date(day.dt * 1000)
            day.dt = day.dt + timezoneDiff
            day.datetimeNew = new Date(day.dt * 1000)
            return day
        })

        // Se muestran dos pronósticos: el del día (a las 12hs) y el de la noche (a las 24hs)
        // Se agrupa primero por fecha, luego se busca el pronóstico a las 12hs y a las 24hs entre los valores para cada día
        let daysForecast = _.groupBy(forecast.list, (dayForecast) => { 
            let date = new Date(dayForecast.dt * 1000) // de UNIX timestamp a ES timestamp

            // Si es la entrada correspondiente a la hora local 0, la juntamos con los registros del día anterior para hacer la hora "24"
            // Si no hay, usamos el de las 23hs hora local del día actual o el de las 01hs del día siguiente
            let dateHoursLocal = date.getUTCHours()
            if (dateHoursLocal === 0 || dateHoursLocal === 1 || dateHoursLocal === 2) {
                date.setUTCDate(date.getUTCDate() - 1)
            }
            return date.getUTCFullYear().toString() + (date.getUTCMonth() + 1).toString() + date.getUTCDate().toString() 
        })
        
        Object.keys(daysForecast).forEach((day) => {

            // Se busca el registro de las 12hs, hora local, o el de las 11hs o 13hs si el otro no existe
            let midday = daysForecast[day].find((time) => { 
                let hour = new Date(time.dt * 1000).getUTCHours()
                return (hour === 12 || hour === 11 || hour === 13)
            })
            // Se busca el registro de las 24hs, hora local, o el de las 23hs o 01hs del día siguiente si el otro no existe
            let midnight = daysForecast[day].find((time) => { 
                let hour = new Date(time.dt * 1000).getUTCHours()
                return (hour === 0 || hour === 23 || hour === 1)
            })
            
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

            // Fecha del pronóstico
            let dateFull = new Date(daysForecast[day][0].dt * 1000)
            if (dateFull.getUTCHours() === 0) {
                dateFull.setUTCDate(dateFull.getUTCDate() - 1)
            }

            let simplifiedDate = new Date(dateFull.getUTCFullYear(), dateFull.getUTCMonth(), dateFull.getUTCDate())
            
            // Fecha actual
            let now = new Date;
            let utcNow = new Date(
                new Date(now.getUTCFullYear(),now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds()).getTime() 
                + (timezoneDiff * 1000)
            );
            let simplifiedNow = new Date(utcNow.getFullYear(), utcNow.getMonth(), utcNow.getDate())
            
            if (simplifiedDate.getTime() === simplifiedNow.getTime()) {
                dayForecast.date = "Hoy"
            } else if ((Math.abs(simplifiedDate.getTime() - simplifiedNow.getTime())) / millisecondsInDay === 1) {
                dayForecast.date = "Mañana"
            } else {
                dayForecast.date = daysOfWeek[simplifiedDate.getUTCDay()] + " " + simplifiedDate.getUTCDate() + "/" + (simplifiedDate.getUTCMonth() + 1)
            }

            parsedForecast.days.push(dayForecast)
        })
        return parsedForecast
    }

    const getForecast = (id) => {
        return new Promise((resolve, reject) => {
            let city = Cities.getCityById(id)
            request.get(timezone.replace('{lat}', city.latitude).replace('{lon}', city.longitude), (error, response, body) => {
                if (error) {
                    console.dir(error)
                    reject(error)
                } else {
                    let timezoneData = JSON.parse(body)                    
                    request.get(url.replace('{id}', id), (error, response, body) => {
                        if (error) {
                            console.dir(error)
                            reject(error)
                        } else {
                            resolve(parseForecast(JSON.parse(body), timezoneData.gmtOffset))
                        }
                    })
                }
            })
            
        })
    }

    return {
        getForecast: getForecast
    }
})()