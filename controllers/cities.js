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
                cities.push(parseCity(row))
                if (cities.length % 500 === 0) {
                    console.log("Parsed " + cities.length + " cities")
                }
            })
            .on('end', () => console.log("Finished parsing cities."))
    }
    const getCities = (page, count) => {
        page = parseInt(page) || 1
        count = parseInt(count) || 10
        return cities.slice((page - 1) * count, (page - 1) * count + count)
    }

    loadCities()

    return {
        getCities: getCities
    }
})()

