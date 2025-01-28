// show.ejs ke and hae tum log ki scripts
mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
    container: "map", // container ID
    style:"mapbox://styles/mapbox/streets-v12",
    center: coordinates, // starting position [lng, lat]. Note that lat must be set between -90 and 90
    zoom: 10 // starting zoom
});

console.log(coordinates);
const marker = new mapboxgl.Marker({color: "red"})
.setLngLat(coordinates)// listing ke andar geom,etry ke andr k cordinates honge
.addTo(map);