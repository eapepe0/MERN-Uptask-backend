import { emailRegistro, emailOlvidePassword } from "../helpers/email.js"
import generarId from "../helpers/generarId.js"
import generarJWT from "../helpers/generarJWT.js"
import UsuarioUpTask from "../models/Usuario.js"




const registrar = async (req, res) => {
    //* evitar registros duplicados
    const { email } = req.body
    const existeUsuario = await UsuarioUpTask.findOne({ email })

    if (existeUsuario) {
        const error = new Error('Usuario ya registrado')
        return res.status(400).json({ msg: error.message })
    }

    try {
        const usuario = new UsuarioUpTask(req.body) //* creamos un nuevo usuario usando el esquema que esta en models/Usuario
        usuario.token = generarId() //* generamos un token random 
        const usuarioAlmacenado = await usuario.save() //* guardamos el usuario en la base de datos , con el await detenemos la ejecucion hasta que sea guardado

        console.log(usuario)
        emailRegistro({
            email: usuario.email,
            nombre: usuario.nombre,
            token: usuario.token
        })
        res.json({ msg: "Usuario creado correctamente! =).  Revisa tu email para confirmar la cuenta." })
    }
    catch (error) {
        console.log(error)
    }

}



const autenticar = async (req, res) => {

    const { email, password } = req.body
    //* comprobar si el usuario existe
    const usuario = await UsuarioUpTask.findOne({ email })

    if (!usuario) {
        const error = new Error("El email no esta registrado")
        return res.status(400).json({ msg: error.message })
    }


    //* comprobar si el usuario esta confirmado
    if (!usuario.confirmado) {
        const error = new Error("El email no esta confirmado")
        return res.status(400).json({ msg: error.message })
    }


    //* comprobar su password
    if (await usuario.comprobarPassword(password)) {
        //* devolvemos un json con los datos
        res.json({
            id: usuario.id,
            nombre: usuario.nombre,
            email: usuario.email,
            token: generarJWT(usuario._id)
        })
    } else {
        //* mostramos un error
        const error = new Error("El password no es correcto")
        return res.status(400).json({ msg: error.message })
    }

}



const confirmar = async (req, res) => {
    const { token } = req.params //* extraemos el token enviado por la url , se llama token por que asi lo llamamos en usuarioRoutes

    const usuarioConfirmar = await UsuarioUpTask.findOne({ token }) //* buscamos el token de un solo uso , el cual generamos cuando creamos el usuario

    if (!usuarioConfirmar) { //* si no encontramos el token la BD tiramos un error
        const error = new Error("El token es invalido")
        return res.status(403).json({ msg: error.message })
    }
    //* si lo encontramos
    try {
        usuarioConfirmar.confirmado = true //* cambiamos el estado false ( definido cuando creamos el usuario ) a true
        usuarioConfirmar.token = '' //* borramos el token de un solo uso

        await usuarioConfirmar.save() //* guardamos el usuario en la base de datos , con el await detenemos la ejecucion hasta que sea guardado

        return res.status(200).json({ msg: "Usuario confirmado correctamente" })
    } catch (error) {
        console.log(error)
    }



}


const olvidePassword = async (req, res) => {

    const { email } = req.body //* nos envian el mail con el que se registraron

    const usuario = await UsuarioUpTask.findOne({ email }) //* buscamos el email en la BD

    //* si no existe marcamos un error
    if (!usuario) {
        const error = new Error('Usuario no existe')
        return res.status(400).json({ msg: error.message })
    }
    //* si existe
    try {
        usuario.token = generarId() //* generamos un nuevo token de un solo uso el cual sera enviado por mail para que el usuario pueda cambiar el password
        await usuario.save() //* guardamos 

        //* enviamos el mail

        emailOlvidePassword({
            email: usuario.email,
            nombre: usuario.nombre,
            token: usuario.token
        })


        res.json({ msg: "Hemos enviado un email con las instrucciones" })

    } catch (error) {
        console.log(error)
    }
}


const comprobarToken = async (req, res) => {
    const { token } = req.params //* extraemos el token enviado por la url , se llama token por que asi lo llamamos en usuarioRoutes

    const tokenValido = await UsuarioUpTask.findOne({ token }) //* buscamos el token de un solo uso , el cual generamos cuando creamos el usuario

    if (!tokenValido) { //* si no encontramos el token la BD tiramos un error
        const error = new Error("El token es invalido")
        return res.status(404).json({ msg: error.message })
    } else { //* si lo encontramos 
        res.json({ msg: "Token valido y el Usuario existe" })
    }
}

const nuevoPassword = async (req, res) => {
    const { token } = req.params //* extraemos el token enviado por la url , se llama token por que asi lo llamamos en usuarioRoutes
    const { password } = req.body //* nos envian el mail con el que se registraron


    const usuario = await UsuarioUpTask.findOne({ token }) //* buscamos el token de un solo uso , el cual generamos cuando creamos el usuario

    if (!usuario) { //* si no encontramos el token la BD tiramos un error
        const error = new Error("El token es invalido")
        return res.status(404).json({ msg: error.message })
    } else {
        usuario.password = password; //* en esta linea al modificar el password , y al tener en nuestro usuarioSchema esta linea !this.isModified("password") , vuelve a generar el password hasheado
        usuario.token = ''; //* borramos el token de un solo uso
        try {
            await usuario.save() //* guardamos en la base de datos
            res.json({ msg: "Password modificado correctamente" })
        } catch (error) {
            console.log(error)
        }
    }
}


const perfil = async (req, res) => {
    const { usuario } = req //* el usuario es pasado en el request por el middleware checkAuth
    res.json(usuario)
}

export { registrar, autenticar, confirmar, olvidePassword, comprobarToken, nuevoPassword, perfil }