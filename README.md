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

Tiene 2 endpoints:

* `/api/cities` es el endpoint que devuelve el listado de ciudades. Puede usarse de dos formas

  * `/api/cities` devuelve el listado completo de ciudades. Son 74000+, por lo que por default sólo se devuelven las primeras 10. Para más, usar el siguiente

  * `/api/cities?page=pg&count=cnt` devuelve el listado de ciudades paginado, donde `pg` es la página (por default, la 1) y `cnt` es la cantidad de ciudades (por default, 10)

Las ciudades tienen la estructura:

````
{
  id: id de la ciudad en OpenWeatherMap,
  name: nombre de la ciudad en OpenWeatherMap,
  lat: latitud,
  lon: longitud,
  country: código del país de la ciudad
}
````
