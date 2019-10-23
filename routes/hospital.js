var express = require('express');

var mdAutenticacion = require('../middlewares/autentificacion');

var app = express();

var Hospital = require('../models/hospital');

// Petición GET 
app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Hospital.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .exec((error, hospitales) => {

            if (error) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando hospitales',
                    errors: error
                });
            }

            Hospital.count({}, (error, conteo) => {
                res.status(200).json({
                    ok: true,
                    hospitales: hospitales,
                    total: conteo
                });
            });


        });
});

// Peticion POST
app.post('/', mdAutenticacion.verificaToken, (req, res, next) => {

    var body = req.body;

    var hospital = new Hospital({
        nombre: body.nombre,
        usuario: req.usuario._id
    });

    hospital.save((error, hospitalGuardado) => {

        if (error) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al crear hospital',
                errors: error
            });
        }

        if (!hospitalGuardado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear hospital',
                errors: error
            });
        }

        res.status(201).json({
            ok: true,
            hospital: hospitalGuardado
        });
    });
});

// Peticion PUT

app.put('/:id', mdAutenticacion.verificaToken, (req, res, next) => {

    var id = req.params.id;
    var body = req.body;

    Hospital.findById(id, (error, hospital) => {

        if (error) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar hospital',
                errors: error
            });
        }

        if (!hospital) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El hospital con el id' + id + 'no existe',
                errors: { message: 'No existe un hospital con ese ID' }
            });
        }

        hospital.nombre = body.nombre;
        // Ojo ! Porque viene del request!
        hospital.usuario = req.usuario._id;

        hospital.save((error, hospitalGuardado) => {

            if (error) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar hospital',
                    errors: error
                });
            }
            res.status(200).json({
                ok: true,
                hospital: hospitalGuardado
            });
        });
    });
});

// Peticion DELETE

app.delete('/:id', mdAutenticacion.verificaToken, (req, res, next) => {

    var id = req.params.id;

    Hospital.findByIdAndDelete(id, (error, hospitalBorrado) => {
        if (error) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar hospital',
                errors: error
            });
        }

        if (!hospitalBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un hospital con ese id',
                errors: error
            });
        }

        res.status(200).json({
            ok: true,
            hospital: hospitalBorrado
        });
    });
});

module.exports = app;