var express = require('express');

var app = express();

// Este path ya viene con Node, no hay que instalar nada.
const path = require('path');
const fs = require('fs');


app.get('/:tipo/:img', (req, res, next) => {

    // El tipo tiene que ser igual al nombre de las carpetas que están en el uploads.
    var tipo = req.params.tipo;
    var img = req.params.img;

    var pathImagen = path.resolve(__dirname, `../uploads/${ tipo }/${img}`);

    if (fs.existsSync(pathImagen)) {
        res.sendFile(pathImagen);
    } else {
        var pathNoImagen = pathImagen = path.resolve(__dirname, '../assets/no-img.jpg');
        res.sendFile(pathImagen);
    }
});

module.exports = app;