var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Prueba Examen' });
});

router.get('/testleaflet', function(req, res, next) {
  res.render('testleaflet', { title: 'Prueba instalación' });
});

// Ruta para guardar puntos en el archivo GeoJSON
router.post('/guardar', function(req, res) {
  const { nombre, lat, lon } = req.body;
  const filePath = path.join(__dirname, '../public/hoteles.geojson');
  
  // Leer el archivo actual
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send('Error al leer el archivo');
    }
    
    try {
      const geoJSON = JSON.parse(data);
      
      // Añadir el nuevo punto
      geoJSON.features.push({
        type: "Feature",
        geometry: { 
          type: "Point", 
          coordinates: [parseFloat(lon), parseFloat(lat)] 
        },
        properties: { 
          name: nombre 
        }
      });
      
      // Guardar el archivo actualizado
      fs.writeFile(filePath, JSON.stringify(geoJSON, null, 2), 'utf8', (err) => {
        if (err) {
          return res.status(500).send('Error al guardar el archivo');
        }
        res.status(200).send('Punto guardado correctamente');
      });
    } catch (error) {
      res.status(500).send('Error al procesar el archivo JSON');
    }
  });
});

// Ruta para eliminar puntos del archivo GeoJSON
router.post('/eliminar', function(req, res) {
  const { lat, lon } = req.body;
  const filePath = path.join(__dirname, '../public/hoteles.geojson');
  
  // Leer el archivo actual
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send('Error al leer el archivo');
    }
    
    try {
      const geoJSON = JSON.parse(data);
      
      // Filtrar y quitar el punto que coincida con lat y lon
      geoJSON.features = geoJSON.features.filter(feature => {
        const coords = feature.geometry.coordinates;
        return !(Math.abs(coords[1] - lat) < 0.0001 && Math.abs(coords[0] - lon) < 0.0001);
      });
      
      // Guardar el archivo actualizado
      fs.writeFile(filePath, JSON.stringify(geoJSON, null, 2), 'utf8', (err) => {
        if (err) {
          return res.status(500).send('Error al guardar el archivo');
        }
        res.status(200).send('Punto eliminado correctamente');
      });
    } catch (error) {
      res.status(500).send('Error al procesar el archivo JSON');
    }
  });
});

// Ruta para actualizar puntos en el archivo GeoJSON
router.post('/actualizar', function(req, res) {
  const { original, nuevo } = req.body;
  const filePath = path.join(__dirname, '../public/hoteles.geojson');
  
  // Leer el archivo actual
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send('Error al leer el archivo');
    }
    
    try {
      const geoJSON = JSON.parse(data);
      
      // Buscar el punto a modificar
      let puntoModificado = false;
      geoJSON.features.forEach(feature => {
        const coords = feature.geometry.coordinates;
        // Comparamos con una pequeña tolerancia para evitar problemas con decimales
        if (Math.abs(coords[1] - original.lat) < 0.0001 && 
            Math.abs(coords[0] - original.lon) < 0.0001) {
          // Actualizamos los datos
          feature.properties.name = nuevo.nombre;
          feature.geometry.coordinates = [nuevo.lon, nuevo.lat];
          puntoModificado = true;
        }
      });
      
      if (!puntoModificado) {
        return res.status(404).send('Punto no encontrado');
      }
      
      // Guardar el archivo actualizado
      fs.writeFile(filePath, JSON.stringify(geoJSON, null, 2), 'utf8', (err) => {
        if (err) {
          return res.status(500).send('Error al guardar el archivo');
        }
        res.status(200).send('Punto actualizado correctamente');
      });
    } catch (error) {
      res.status(500).send('Error al procesar el archivo JSON');
    }
  });
});

module.exports = router;
