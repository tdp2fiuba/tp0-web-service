# Instalación

Luego de bajar el código del repositorio, correr para iniciar el servidor:

````
npm install
npm run prod
````

Por default, corre en el puerto 8080. De querer cambiarlo por otro puerto:

* En ***NIX**, para una única corrida

````
PORT=XXXX npm run prod
````

* En ***NIX**, permanentemente

````
export PORT=XXXX
npm run prod
````

* En **Windows**

````
set PORT=XXXX
npm run prod
````

# Endpoints de la API

Tiene 2 endpoints

## Endpoint para las ciudades

* `/api/cities` es el endpoint que devuelve el listado de ciudades. Puede usarse de dos formas

  * `/api/cities` devuelve el listado completo de ciudades. Son 74000+, por lo que por default sólo se devuelven las primeras 10. Para más, usar el siguiente

  * `/api/cities?page=pg&count=cnt` devuelve el listado de ciudades paginado, donde `pg` es la página (por default, la 1) y `cnt` es la cantidad de ciudades (por default, 10)

* Las ciudades tienen la estructura:

````
{
  id: id de la ciudad en OpenWeatherMap,
  name: nombre de la ciudad en OpenWeatherMap,
  lat: latitud,
  lon: longitud,
  country: código del país de la ciudad
}
````

## Endpoint para el pronóstico

* `/api/forecast` es el endpoint que devuelve el pronóstico para una ciudad determinada.
* Se le debe pasar un ID por query string de la forma `/api/forecast?id={id}`, donde el ID es el ID de la ciudad que es devuelto por el endpoint de ciudades
* Los pronósticos tienen esta estructura:

````
{
 days: [  
  tempDay: temperatura promedio durante el día,
  tempNight: temperatura promedio durante la noche,
  weatherDayMain: descripción general del tiempo durante el día,
  weatherDayDesc: descripción particular del tiempo durante el día,
  weatherDayIcon: ícono representativo del tiempo durante el día,
  weatherNightMain: descripción general del tiempo durante la noche,
  weatherNightDesc: descripción particular del tiempo durante la noche,
  weatherNightIcon: ícono representativo del tiempo durante noche,
  date: fecha del día
 ]
}
````

### Notas sobre los atributos

* Los campos ´tempDay´, ´weatherDayMain´, ´weatherDayDesc´y ´weatherDayIcon´ son los atributos correspondientes a la respuesta de la API de OpenWeatherMap para el día representado que tiene en el campo ´list.main.dt´ la hora 12. ´tempDay´ corresponde a su valor ´list.main.temp´
* Idem con los campos ´tempNight´, ´weatherNightMain´, ´weatherNightDesc´y ´weatherNightIcon´, que se toman de la entrada del array `list` cuyo campo `main.dt` tenga hora 00
* El campo `date` tiene como posibles fechas "Hoy", "Mañana" o "[Día de la semana] DD/MM" (e.g. "Thu 22/3")
