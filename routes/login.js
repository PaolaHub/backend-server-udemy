var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;

var app = express();

var Usuario = require('../models/usuario');

app.post('/', (request, response, next) => {

    var body = request.body;

    Usuario.findOne({ email: body.email }, (error, usuarioDB) => {

        if (error) {
            return response.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuarios',
                errors: error
            });
        }

        if (!usuarioDB) {
            return response.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - email',
                errors: error
            });
        }

        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return response.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - password',
                errors: error
            });
        }

        // Ya estamos en un punto que encontramos el usuario
        // Crear un token!!!
        // Ese tocken adicionalmente debriamos de enviar a todas las peticiones que requieran autentificacion
        // jsonwebtoken de github
        // jwt.io

        // 1. PAYLOAD. Tenemos que poner la data que queremos colocar en el token, se conoce como el payload
        // 2. SEED. Algo que nos ayude a hacer unico a nuestro token.
        // 3. Fecha de expiración en segundos. 4 horas
        usuarioDB.password = ':)';
        var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 })

        response.status(200).json({
            ok: true,
            usuario: usuarioDB,
            token: token,
            id: usuarioDB._id
        });
    });


});


// Para exportarlo
module.exports = app;