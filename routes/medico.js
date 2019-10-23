var express = require('express');

var mdAutenticacion = require('../middlewares/autentificacion');

var app = express();

var Medico = require('../models/medico');

// Petición GET
app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Medico.find()
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec((error, medicos) => {
            if (error) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al cargar los medicos',
                    errors: error
                });
            }

            Medico.count({}, (error, conteo) => {
                res.status(200).json({
                    ok: true,
                    medicos: medicos,
                    total: conteo
                });
            });
        });

});

// PETICION POST
app.post('/', mdAutenticacion.verificaToken, (req, res, next) => {

    var body = req.body;

    var medico = new Medico({
        nombre: body.nombre,
        usuario: req.usuario._id,
        hospital: body.hospital
    });

    medico.save((error, medicoGuardado) => {
        if (error) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al crear un medico',
                errors: error
            });
        }

        res.status(200).json({
            ok: true,
            medico: medicoGuardado
        });

    });

});

// Peticion PUT
app.put('/:id', mdAutenticacion.verificaToken, (req, res, next) => {

    var id = req.params.id;
    var body = req.body;

    Medico.findById(id, (error, medico) => {
        if (error) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar medico',
                errors: error
            });
        }

        if (!medico) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un medico con ese id',
                errors: error
            });
        }

        medico.nombre = body.nombre;
        medico.usuario = req.usuario._id;
        medico.hospital = body.hospital;

        medico.save((error, medicoActualizado) => {
            if (error) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al actualizar el medico'
                });
            }

            res.status(200).json({
                ok: true,
                medico: medico
            });
        })
    });
});

app.delete('/:id', mdAutenticacion.verificaToken, (req, res, next) => {

    var id = req.params.id;

    Medico.findByIdAndDelete(id, (error, medicoBorrado) => {
        if (error) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar medico',
                errors: error
            });
        }

        if (!medicoBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un medico con ese id',
                errors: error
            });
        }

        res.status(200).json({
            ok: true,
            medico: medicoBorrado
        });
    });


});


module.exports = app;