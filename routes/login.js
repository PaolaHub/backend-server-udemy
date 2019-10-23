var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;
var CLIENT_ID = require('../config/config').CLIENT_ID;

var app = express();

var Usuario = require('../models/usuario');

const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    //const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];
    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
}

// =================================
// Autenticación de Google
// =================================

// Google recomienda que las peticiones se hagan por POST

app.post('/google', async(req, res, next) => {

    var token = req.body.token;

    var googleUser = await verify(token).catch((error) => {
        res.status(402).json({
            ok: false,
            mensaje: 'Token no válido',
            errors: error
        });
    });

    Usuario.findOne({ email: googleUser.email }, (error, usuarioDB) => {
        if (error) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al buscar usuarios',
                errors: error
            });
        }

        if (usuarioDB) {

            if (!usuarioDB.google) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Debe usar su autenticación normal',
                    errors: error
                });
            } else {
                // Generar un nuevo token y verificarlo
                var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 });

                res.status(200).json({
                    ok: true,
                    usuario: usuarioDB,
                    token: token,
                    id: usuarioDB._id
                });
            }
        } else {
            // El usuario no existe hay que crearlo.
            var usuario = new Usuario({
                nombre: googleUser.nombre,
                email: googleUser.email,
                img: googleUser.img,
                google: true,
                password: ':)'
            });

            usuario.save((error, usuarioDB) => {

                if (error) {
                    return response.status(500).json({
                        ok: false,
                        mensaje: 'Error al crear usuarios',
                        errors: error
                    });
                }
                // Generar un nuevo token y verificarlo
                var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 });

                res.status(200).json({
                    ok: true,
                    usuario: usuarioDB,
                    token: token,
                    id: usuarioDB._id
                });
            });
        }
    });
});

// Volvemos a la documentación de google



// =================================
// Autenticación normal
// =================================

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