import Proyecto from "../models/Proyecto.js";
import Tarea from "../models/Tarea.js";
import Usuario from '../models/Usuario.js'
import { validateEmail } from "../helpers/validateEmail.js";


const obtenerProyectos = async (req, res) => {
    //* obtenermos los proyectos de Proyecto donde el "creador" sea igual al usuario que hace el request , pero no envies las tareas
    const proyectos = await Proyecto.find({
        '$or': [
            { 'colaboradores': { $in: req.usuario } },  //* buscamos o colabores que sean igual a req.usuario
            { 'creador': { $in: req.usuario } }, //* o el creador sea igual a req.usuario
        ]
    }).select("-tareas")
    if (!proyectos) {
        const error = new Error('No hay proyectos disponibles')
        return res.status(404).json({ msg: error.message })
    }
    res.json(proyectos)
};

const nuevoProyecto = async (req, res) => {

    const proyecto = new Proyecto(req.body) //* creamos un nuevo Proyecto , sacando de mongoose y mandandole los datos nombre , cliente y descripcion
    proyecto.creador = req.usuario._id //* le agregamos el creador , el _id que genera mongoose y que se envia en el request

    try {
        const proyectoAlmacenado = await proyecto.save() //* lo guardamos 
        res.json(proyectoAlmacenado) //* enviamos lo guardado en una respuesta
    } catch (error) {
        console.log(error)
    }

};

const obtenerProyecto = async (req, res) => {
    const { id } = req.params //* sacamos el id de la url

    //* si no nos envian un id o el largo del id no es 24
    if (!id || id.length != 24) {
        const error = new Error('Debe enviar un id o el id no es correcto')
        return res.status(404).json({ msg: error.message })
    }
    //* const proyecto = await Proyecto.findById(id).populate("tareas").populate('colaboradores', "nombre email") 
    //* buscamos en proyecto el id , completamos las referencias a tareas y completamos las referencia a colaboradores , solamente pedimos el nombre y el email a la BD

    //* si queremos obtener el completado , esta definido en Tarea.js al no estar definido en Proyecto

    //* path indica que el campo se va a reemplazar (tareas) , por el populate de completado , en el cual seleccionamos el nombre y el email
    const proyecto = await Proyecto.findById(id).populate({ path: 'tareas', populate: { path: 'completado', select: "nombre email" }, })
        .populate("colaboradores", "nombre email")

    //* si no tenemos respuesta 
    if (!proyecto) {
        const error = new Error('No Encontrado')
        return res.status(404).json({ msg: error.message })
    }


    //* si el proyecto buscado no esta creado por la misma persona que lo busca , nos tirara un error
    if (proyecto.creador.toString() !== req.usuario._id.toString() && !proyecto.colaboradores.some(colaborador => colaborador._id.toString() === req.usuario._id.toString())) {
        const error = new Error('Accion No Válida')
        return res.status(401).json({ msg: error.message })
    }

    res.json(proyecto)
};

const editarProyecto = async (req, res) => {
    const { id } = req.params //* sacamos el id de la url

    //* si no nos envian un id o el largo del id no es 24
    if (!id || id.length != 24) {
        const error = new Error('Debe enviar un id o el id no es correcto')
        return res.status(404).json({ msg: error.message })
    }


    const proyecto = await Proyecto.findById(id) //* buscamos en proyecto el id

    //* si no tenemos respuesta 
    if (!proyecto) {
        const error = new Error('No Encontrado')
        return res.status(404).json({ msg: error.message })
    }
    //* si el proyecto buscado no esta creado por la misma persona que lo busca , nos tirara un error
    if (proyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error('Accion No Válida')
        return res.status(401).json({ msg: error.message })
    }

    proyecto.nombre = req.body.nombre || proyecto.nombre //* si es enviado en el request un nombre actualizamos el valor por el nombre enviado , en caso contrario usa el nombre que ya tiene la base de datos
    proyecto.descripcion = req.body.descripcion || proyecto.descripcion
    proyecto.fechaEntrega = req.body.fechaEntrega || proyecto.fechaEntrega
    proyecto.cliente = req.body.cliente || proyecto.cliente


    try {
        const proyectoAlmacenado = await proyecto.save() //* guardamos
        /*  res.status(200).json(`Proyecto actualizado correctamente :  ${proyectoAlmacenado}`) //* mostramos los datos actualizados */
        res.json(proyectoAlmacenado)
    } catch (error) {
        console.log(error)
    }
};

const eliminarProyecto = async (req, res) => {
    const { id } = req.params //* sacamos el id de la url

    //* si no nos envian un id o el largo del id no es 24
    if (!id || id.length != 24) {
        const error = new Error('Debe enviar un id o el id no es correcto')
        return res.status(404).json({ msg: error.message })
    }
    const proyecto = await Proyecto.findById(id) //* buscamos en proyecto el id

    //* si no tenemos respuesta 
    if (!proyecto) {
        const error = new Error('No Encontrado')
        return res.status(404).json({ msg: error.message })
    }
    //* si el proyecto buscado no esta creado por la misma persona que lo busca , nos tirara un error
    if (proyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error('Accion No Válida')
        return res.status(401).json({ msg: error.message })
    }

    try {
        const proyectoEliminado = await proyecto.deleteOne()
        res.status(200).json({ msg: `Proyecto eliminado correctamente` }) //* mostramos los datos actualizados
    } catch (error) {
        console.log(error)
    }
};

const buscarColaborador = async (req, res) => {
    const { email } = req.body

    if (!email || !validateEmail(email)) {
        const error = new Error('Debe enviar un email o un email valido')
        return res.status(404).json({ msg: error.message })
    }
    const usuario = await Usuario.findOne({ email }).select('-confirmado -createdAt -password -token -updatedAt -__v')
    if (!usuario) {
        const error = new Error('Usuario no encontrado')
        return res.status(404).json({ msg: error.message })
    }

    res.json(usuario)
}

const agregarColaborador = async (req, res) => {
    //* sacamos el id de la url
    const { id } = req.params

    //* si no nos envian un id o el largo del id no es 24
    if (!id || id.length != 24) {
        const error = new Error('Debe enviar un id o el id no es correcto')
        return res.status(404).json({ msg: error.message })
    }

    //* buscamos en proyecto el id
    const proyecto = await Proyecto.findById(id)

    //* si no tenemos respuesta 
    if (!proyecto) {
        const error = new Error('No Encontrado')
        return res.status(404).json({ msg: error.message })
    }
    //* si el proyecto buscado no esta creado por la misma persona que lo busca , nos tirara un error
    if (proyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error('Accion No Válida')
        return res.status(401).json({ msg: error.message })
    }

    //* extraemos el email del request
    const { email } = req.body;

    //* buscamos el email en la BD , pero le sacamos un par de cosas
    const usuario = await Usuario.findOne({ email }).select("-confirmado -createdAt -password -token -updatedAt -__v")

    //* si no existe el usuario
    if (!usuario) {
        const error = new Error("Usuario no encontrado")
        return res.status(404).json({ msg: error.message })
    }
    //* si el creador se quiere agregar como colaborador
    if (proyecto.creador.toString() === usuario._id.toString()) {
        const error = new Error('El admin no puede ser colaborador')
        return res.status(401).json({ msg: error.message })
    }

    //* revisemos que no este ya agregado al proyecto
    if (proyecto.colaboradores.includes(usuario._id)) {
        const error = new Error('El usuario ya pertenece al proyecto')
        return res.status(401).json({ msg: error.message })
    }

    //* ahora podemos agregar
    proyecto.colaboradores.push(usuario._id)
    await proyecto.save()
    res.json({ msg: "Colaborador agregado correctamente" })

}

const eliminarColaborador = async (req, res) => {

    //* sacamos el id de la url
    const { id } = req.params

    //* si no nos envian un id o el largo del id no es 24
    if (!id || id.length != 24) {
        const error = new Error('Debe enviar un id o el id no es correcto')
        return res.status(404).json({ msg: error.message })
    }

    //* buscamos en proyecto el id
    const proyecto = await Proyecto.findById(id)

    //* si no tenemos respuesta 
    if (!proyecto) {
        const error = new Error('No Encontrado')
        return res.status(404).json({ msg: error.message })
    }
    //* si el proyecto buscado no esta creado por la misma persona que lo busca , nos tirara un error
    if (proyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error('Accion No Válida')
        return res.status(401).json({ msg: error.message })
    }


    //* si todo esto esta bien , se puede eliminar el colaborador 

    proyecto.colaboradores.pull(req.body.id)
    await proyecto.save()
    res.json({ msg: "Colaborador eliminado correctamente" })



};

const obtenerTareas = async (req, res) => {
    const { id } = req.params //* sacamos el id de la url

    //* si no nos envian un id o el largo del id no es 24
    if (!id || id.length != 24) {
        const error = new Error('Debe enviar un id o el id no es correcto')
        return res.status(404).json({ msg: error.message })
    }
    const proyecto = await Proyecto.findById(id) //* buscamos en proyecto el id

    //* si no tenemos respuesta 
    if (!proyecto) {
        const error = new Error('No Encontrado')
        return res.status(404).json({ msg: error.message })
    }

    //* buscamos  una tarea donde el proyecto es igual al id pasado
    const tareas = await Tarea.find().where("proyecto").equals(id)

    res.json(tareas)

};

export {
    agregarColaborador,
    buscarColaborador,
    editarProyecto,
    eliminarColaborador,
    eliminarProyecto,
    nuevoProyecto,
    obtenerProyecto,
    obtenerProyectos,
    obtenerTareas,
};
