var express = require('express');
var bcrypt = require('bcryptjs');

var mdAutenticacion = require('../middlewares/autentificacion');

var app = express();

var Usuario = require('../models/usuario');

// ==============================
//  Obtener todos los usuarios
// ==============================
app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    // Esta es una manera de devolver los parámetros que queramos y no todos.
    Usuario.find({}, 'nombre email img role')
        .skip(desde)
        .limit(5)
        .exec(
            (error, usuarios) => {
                if (error) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando usuarios',
                        errors: error
                    })
                }

                Usuario.count({}, (error, conteo) => {
                    res.status(200).json({
                        ok: true,
                        usuarios: usuarios,
                        usuarioToken: req.usuario,
                        total: conteo
                    })
                });
            });
});


// ==============================
//  Actualizar un nuevo usuario
// ==============================

app.put('/:id', mdAutenticacion.verificaToken, (request, response, next) => {

    var id = request.params.id;
    var body = request.body;

    Usuario.findById(id, (error, usuario) => {

        if (error) {
            return response.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: error
            });
        }

        if (!usuario) {
            return response.status(400).json({
                ok: false,
                mensaje: 'El usuario con el id' + id + ' no existe',
                errors: { message: 'No existe un usuario con ese ID' }
            });
        }

        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save((error, usuarioGuardado) => {
            if (error) {
                return response.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar usuarios',
                    errors: error
                });
            }

            // Esta es otra manera de modificar los datos que se le van a pasar.
            // OJO que no estamos guardando la carita feliz, porque la estamos
            // definiendo en el callback. La funcion save ya se hizo.
            usuarioGuardado.password = ':)';

            response.status(200).json({
                ok: true,
                usuario: usuarioGuardado
            });
        });
    });
});

// ==============================
//  Crear un nuevo usuario
// ==============================

app.post('/', mdAutenticacion.verificaToken, (req, response) => {

    var body = req.body;

    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    usuario.save((error, usuarioGuardado) => {

        if (error) {
            return response.status(400).json({
                ok: false,
                mensaje: 'Error al crear usuarios',
                errors: error
            });
        }
        response.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
            usuarioToken: req.usuario
        });

    });
});


// ==============================
//  Borrar un nuevo usuario
// ==============================

// OJO! el nombre que definamos en la ruta es el mismo que tenemos que usar
// cuando llamamos a los params.
app.delete('/:este_id', mdAutenticacion.verificaToken, (request, response, next) => {

    var id = request.params.este_id;

    Usuario.findByIdAndDelete(id, (error, usuarioBorrado) => {

        if (error) {
            return response.status(500).json({
                ok: false,
                mensaje: 'Error al borrar usuario',
                errors: error
            });
        }

        if (!usuarioBorrado) {
            return response.status(400).json({
                ok: false,
                mensaje: 'No existe un usuario con ese id',
                errors: { message: 'No existe un usuario con ese id' }
            });
        }



        response.status(200).json({
            ok: true,
            usuario: usuarioBorrado,
            usuarioToken: req.usuario
        });
    });
});

module.exports = app;