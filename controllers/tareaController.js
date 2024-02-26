import Proyecto from "../models/Proyecto.js"
import Tarea from "../models/Tarea.js"



const agregarTarea = async (req, res) => {
    const { proyecto } = req.body

    const existeProyecto = await Proyecto.findById(proyecto)


    if (!existeProyecto) {
        const error = new Error('Proyecto No Encontrado')
        return res.status(404).json({ msg: error.message })
    }

    if (existeProyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error('No tienes los permisos necesarios para añadir tareas')
        return res.status(404).json({ msg: error.message })
    }
    try {
        const tareaAlmacenada = await Tarea.create(req.body);
        //* almacenar el id en el proyecto
        existeProyecto.tareas.push(tareaAlmacenada._id) //* pongo en el proyecto una tarea la cual tiene el _id de la tarea almacenada
        await existeProyecto.save(); //* guardamos el proyecto con la el id de la tarea 
        res.status(200).json({ msg: "Tarea almacenada correctamente", tarea: tareaAlmacenada })
    } catch (error) {
        console.log(error)
    }

}

const obtenerTarea = async (req, res) => {
    const { id } = req.params

    //* si no nos envian un id o el largo del id no es 24
    if (!id || id.length != 24) {
        const error = new Error('Debe enviar un id o el id no es correcto')
        return res.status(404).json({ msg: error.message })
    }

    //* buscamos la tarea por su id usamos populate ** explicacion abajo de todo **


    const tarea = await Tarea.findById(id).populate("proyecto")


    //* si no existe la tarea
    if (!tarea) {
        const error = new Error('Tarea No Encontrado')
        return res.status(404).json({ msg: error.message })
    }

    //* si el creador del proyecto en tarea es distinto al usuario que esta haciendo el request
    if (tarea.proyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error('Accion no valida')
        return res.status(403).json({ msg: error.message })
    }
    //* devolvemos la tarea encontrada
    return res.json(tarea)
}


const actualizarTarea = async (req, res) => {
    const { id } = req.params //* sacamos el id de la url

    if (!id || id.length != 24) {
        const error = new Error('Debe enviar un id o el id no es correcto')
        return res.status(404).json({ msg: error.message })
    }

    const tarea = await Tarea.findById(id).populate("proyecto") //* buscamos en tarea el id

    //* si no tenemos respuesta 
    if (!tarea) {
        const error = new Error('No Encontrado')
        return res.status(404).json({ msg: error.message })
    }

    //* si el tarea buscado no esta creado por la misma persona que lo busca , nos tirara un error
    if (tarea.proyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error('Accion No Válida')
        return res.status(401).json({ msg: error.message })
    }

    tarea.nombre = req.body.nombre || tarea.nombre //* si es enviado en el request un nombre actualizamos el valor por el nombre enviado , en caso contrario usa el nombre que ya tiene la base de datos
    tarea.descripcion = req.body.descripcion || tarea.descripcion
    tarea.estado = req.body.estado || tarea.estado
    tarea.fechaEntrega = req.body.fechaEntrega || tarea.fechaEntrega
    tarea.prioridad = req.body.prioridad || tarea.prioridad


    try {
        const tareaAlmacenado = await tarea.save() //* guardamos
        res.status(200).json(tareaAlmacenado) //* mostramos los datos actualizados
    } catch (error) {
        console.log(error)
    }
}


const eliminarTarea = async (req, res) => {
    const { id } = req.params //* sacamos el id de la url

    if (!id || id.length != 24) {
        const error = new Error('Debe enviar un id o el id no es correcto')
        return res.status(404).json({ msg: error.message })
    }

    const tarea = await Tarea.findById(id).populate("proyecto") //* buscamos en tarea el id

    //* si no tenemos respuesta 
    if (!tarea) {
        const error = new Error('No Encontrado')
        return res.status(404).json({ msg: error.message })
    }

    //* si el tarea buscado no esta creado por la misma persona que lo busca , nos tirara un error
    if (tarea.proyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error('Accion No Válida')
        return res.status(401).json({ msg: error.message })
    }
    try {
        const proyecto = await Proyecto.findById(tarea.proyecto)
        proyecto.tareas.pull(tarea._id)

        //* para que los 2 await no bloquen la funcion usaremos Promise.allSettled (la cual ejecuta varios await en paralelo y una vez que se ejecutan correctamente siguen el flujo de la funcion )
        //* await proyecto.save()
        //* await tarea.deleteOne()

        await Promise.allSettled([await proyecto.save(), await tarea.deleteOne()])

        res.json({ msg: "Tarea eliminada" })
    } catch (error) {
        console.log(error)
    }

}


const cambiarEstado = async (req, res) => {
    const { id } = req.params //* sacamos el id de la url

    if (!id || id.length != 24) {
        const error = new Error('Debe enviar un id o el id no es correcto')
        return res.status(404).json({ msg: error.message })
    }
    const tarea = await Tarea.findById(id).populate("proyecto")//* buscamos en tarea el id
    //* si no tenemos respuesta 
    if (!tarea) {
        const error = new Error('No Encontrado')
        return res.status(404).json({ msg: error.message })
    }

    if (tarea.proyecto.creador.toString() !== req.usuario._id.toString() && !tarea.proyecto.colaboradores.some(colaborador => colaborador._id.toString() === req.usuario._id.toString())) {
        const error = new Error('Accion No Válida')
        return res.status(401).json({ msg: error.message })
    }

    tarea.estado = !tarea.estado
    tarea.completado = req.usuario._id
    await tarea.save()

    //* volvemos a consultar la tarea asi nos devuelve los datos actualizados (en tarea completado nos devuelve el id del usuario (string)
    //* hacemos otra llamada a la BD para que haga un populate a "completado"
    const tareaActualizada = await Tarea.findById(id).populate("proyecto").populate('completado')//* buscamos en tarea el id

    res.json(tareaActualizada)
}


export {
    agregarTarea,
    obtenerTarea,
    actualizarTarea,
    eliminarTarea,
    cambiarEstado
}

//* si agregamos proyecto al populate cuando nos devuelve la respuesta
//* en lugar de ponernos proyecto : new ObjectId("jkasdjlsadjsal")
//* nos completa los datos del proyecto

//* sin populate
/**
|--------------------------------------------------
|  proyecto: new ObjectId('65af047ddabb860a43d8a231'),
|--------------------------------------------------
*/
//* con populate
/**
 |--------------------------------------------------
|  proyecto: {
| _id: new ObjectId('65af047ddabb860a43d8a231'),
| nombre: 'Diseño logotipo2',
| descripcion: 'diseñar el logo de Colosin inc 2',
| fechaEntrega: 2024-01-23T00:11:52.258Z,
| cliente: 'Colosin inc 2',
| colaboradores: [],
| creador: new ObjectId('65aec5e50887d9f3e19341bc'),
| createdAt: 2024-01-23T00:12:45.399Z,
| updatedAt: 2024-01-23T00:12:45.399Z,
| __v: 0
|},
|--------------------------------------------------
*/