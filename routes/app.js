var express = require('express');

var app = express();

// Peticion a la raiz del servicio
app.get('/', (request, response, next) => {
    response.status(200).json({
        ok: true,
        mensaje: 'Petición realizada correctamente'
    })
});

module.exports = app;