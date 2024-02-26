
import jwt from "jsonwebtoken"
import UsuarioUpTask from "../models/Usuario.js";


const checkAuth = async (req, res, next) => {

    let token //* variable donde vamos a guardar el token
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) { //* si enviamos en el header con autorizacion y si es un Bearer
        try {
            token = req.headers.authorization.split(" ")[1]; //* dividimos la palabra Bearer del token

            const decodificado = jwt.verify(token, process.env.JWT_SECRET); //* verificamos que el token que nos envian sea valido , de aca podemos sacar el id , el iat y la expiracion

            //* buscamos en la base de datos el id decodificado del token y que nos devuelva el usuario pero sin el password , sin el confirmado, sin el token , etc,
            //* el resultado lo ponemos en el request
            req.usuario = await UsuarioUpTask.findById(decodificado.id).select("-password -confirmado -token -createAt -updatedAt -__v")

            return next() //* vamos al siguiente middleware, en este caso (perfil)
        } catch (error) {
            return res.status(404).json({ msg: "Hubo un error" })
        }
    }

    //* si el token no es enviado en el request
    if (!token) {
        const error = new Error("Token no valido")
        return res.status(401).json({ msg: error.message })
    }
    next();
}

export default checkAuth