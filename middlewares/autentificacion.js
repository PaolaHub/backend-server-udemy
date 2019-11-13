var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;

// ==============================
//  Verificar token
// ==============================
exports.verificaToken = function(request, response, next) {

    var token = request.query.token;

    jwt.verify(token, SEED, (error, decoded) => {

        if (error) {
            return response.status(401).json({
                ok: false,
                mensaje: 'Token incorrecto',
                errors: error
            })
        }

        request.usuario = decoded.usuario;

        next();
        // return response.status(200).json({
        //     ok: true,
        //     decoded: decoded
        // })
    });

}

// ==============================
//  Verificar ADMIN
// ==============================
exports.verificaADMIN_ROLE = function(request, response, next) {


    var usuario = request.usuario;

    if (usuario.role === 'ADMIN_ROLE') {
        next();
        return;
    } else {
        return response.status(401).json({
            ok: false,
            mensaje: 'Token incorrecto - No es administrador',
            errors: { message: 'No es administrador. No puede hacer eso' }
        })
    }
}

// ==============================
//  Verificar ADMIN o Mismo Usuario
// ==============================
exports.verificaADMIN_ROLE_o_MismoUsuario = function(request, response, next) {


    var usuario = request.usuario;
    // Este id viene de la petición put('/:id), porque este middelware esta hecho solo para el put.
    var id = request.params.id;

    if (usuario.role === 'ADMIN_ROLE' || usuario._id === id) {
        next();
        return;
    }

    return response.status(401).json({
        ok: false,
        mensaje: 'Token incorrecto - No es administrador ni es el mismo usuario',
        errors: { message: 'No es administrador. No puede hacer eso' }
    });
}