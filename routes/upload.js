var express = require('express');

// Librería externa, hay que descargarla con npm.
const fileUpload = require('express-fileupload');

// Esto no hay que descargarselo, viene ya en node.
// Solo escribimos y lo usamos
var fs = require('fs');

var app = express();

// default options
app.use(fileUpload());

var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');

// Peticion a la raiz del servicio
app.put('/:tipo/:id', (req, res, next) => {

    var tipo = req.params.tipo;
    var id = req.params.id;

    // Tipo de colección
    var tipoValidos = ['hospitales', 'medicos', 'usuarios'];
    if (tipoValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Tipo de colección no válida',
            errors: { message: 'Tipo de colección no válida' }
        });
    }

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            mensaje: 'No selecciono nada',
            errors: { message: 'Debe de seleccionar una imagen' }
        });
    }

    // Obtener nombre del archivo
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado[nombreCortado.length - 1];

    // Sólo estas extensiones aceptamos
    var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if (extensionesValidas.indexOf(extensionArchivo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Extensión no válida',
            errors: { message: 'Las extensiones válidas son: ' + extensionesValidas.join(', ') }
        });
    }

    // Nombre de archivo personalizado 
    var nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${extensionArchivo}`;

    // Mover el archivo del temporal al path
    var path = `./uploads/${tipo}/${nombreArchivo}`;

    archivo.mv(path, (error) => {
        if (error) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al mover archivo',
                errors: error
            });
        }
    });

    subirPorTipo(tipo, id, nombreArchivo, res);

    // Comentamos esta respuesta porque no queremos que salga por aquí,
    // si no por la funcion subirPorTipo.
    // res.status(200).json({
    //     ok: true,
    //     mensaje: 'Archivo movido',
    //     extensionArchivo: extensionArchivo
    // })
});

//res : Porque yo quiero sacar la respuesta en formato json desde esta funcion
function subirPorTipo(tipo, id, nombreArchivo, res) {

    if (tipo === 'usuarios') {

        Usuario.findById(id, (error, usuario) => {

            if (error) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar usuario',
                    errors: error
                });
            }

            if (!usuario) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El usuario con el id' + id + ' no existe',
                    errors: { message: 'No existe un usuario con ese ID' }
                });
            }

            // Buscamos el path viejo de la imagen.
            var pathViejo = './uploads/usuarios/' + usuario.img;

            // Validamos que existe el archivo y lo borramos
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
            }

            usuario.img = nombreArchivo;

            usuario.save((error, usuarioActualizado) => {

                if (error) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'La imagen de usuario no se ha podido guardar en el registro',
                        errors: error
                    });
                }

                usuarioActualizado.password = ':)';

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de usuario actualizada',
                    usuario: usuarioActualizado
                })
            });
        });

    }
    if (tipo === 'medicos') {

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
                    mensaje: 'El medico con el id' + id + ' no existe',
                    errors: { message: 'No existe un medico con ese ID' }
                });
            }

            // Buscamos el path viejo de la imagen.
            var pathViejo = './uploads/medicos/' + medico.img;

            // Validamos que existe el archivo y lo borramos
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
            }

            medico.img = nombreArchivo;

            medico.save((error, medicoActualizado) => {
                if (error) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'La imagen del medico no se ha podido guardar en el registro',
                        errors: error
                    });
                }

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen del medico actualizada',
                    medico: medicoActualizado
                })
            });
        });
    }
    if (tipo === 'hospitales') {

        Hospital.findById(id, (error, hospital) => {

            if (error) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar el hospital',
                    errors: error
                });
            }

            if (!hospital) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El hospital con el id' + id + ' no existe',
                    errors: { message: 'No existe un hospital con ese ID' }
                });
            }

            // Buscamos el path viejo de la imagen.
            var pathViejo = './uploads/hospitales/' + hospital.img;

            // Validamos que existe el archivo y lo borramos
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
            }

            hospital.img = nombreArchivo;

            hospital.save((error, hospitalActualizado) => {
                if (error) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'La imagen del hospital no se ha podido guardar en el registro',
                        errors: error
                    });
                }

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen del hospital actualizada',
                    hospital: hospitalActualizado
                })
            });
        });
    }
}

module.exports = app;