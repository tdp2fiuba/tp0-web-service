let csv = require('csv-parser')
let fs = require('fs')
const path = require('path')

module.exports = (() => {
    let cities = []
    const parseCity = (fields) => {
        return {
            id: fields.id,
            name: fields.nm,
            latitude: fields.lat,
            longitude: fields.lon,
            country: fields.countryCode
        }
    }

    const loadCities = () => {
        console.log("Parsing cities...")
        fs.createReadStream(path.resolve(__dirname, '../static/city_list.txt'))
            .pipe(csv({ separator: '\t' }))
            .on('headers', (headers) => {
                console.log('Headers: ' + headers.join(" "))
            })
            .on('data', (row) => {
                if (row.nm !== "") {
                    cities.push(parseCity(row))
                }
                if (cities.length % 500 === 0) {
                    console.log("Parsed " + cities.length + " cities")
                }
            })
            .on('end', () => {
                cities = cities.sort((cityA, cityB) => {  
                    if (cityA.name > cityB.name) {
                        return 1
                    } else if (cityA.name === cityB.name) {
                        return 0
                    } else {
                        return -1
                    }
                })
                console.log("Finished parsing cities.") 
            })
    }
    const getCities = (page, count) => {
        page = parseInt(page) || 1
        count = parseInt(count) || 10
        return cities.slice((page - 1) * count, (page - 1) * count + count)
    }
    const getCityById = (id) => {
        return cities.find((city) => { return city.id === id })
    }

    loadCities()

    return {
        getCities: getCities,
        getCityById: getCityById
    }
})()

