import mongoose from "mongoose";
import bcrypt from "bcrypt"



const usuarioSchema = mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    token: {
        type: String
    },
    confirmado: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
})



//* este codigo se ejecuta antes de guardar los datos en la BD => ( const usuario = new UsuarioUpTask(req.body) const usuarioAlmacenado = await usuario.save() )
usuarioSchema.pre('save', async function (next) {

    if (!this.isModified("password")) { //* permite saber si un campo ha sido modificado desde que se cargó el documento desde la base de datos.
        next() //*  la función retorna inmediatamente sin hashear el password nuevamente , ssto se hace para evitar que se haga un hash adicional de un hash existente
    }
    //* generamos un numero random 10 veces ( mientras mas veces mas seguro , pero ocupa recursos del servidor )
    const salt = await bcrypt.genSalt(10);

    //* arriba usamos function para poder usar el this, el cual hace referencia al objeto usuario , usado en usuario.save() , seria el password de usuario...
    this.password = await bcrypt.hash(this.password, salt)  //* hasheamos el password de usuario con la salt generada 
})



//* agregamos un metodo a usuarioSchema de la siguiente manera
usuarioSchema.methods.comprobarPassword = async function (passwordEnviadoPorElUsuario) {
    return await bcrypt.compare(passwordEnviadoPorElUsuario, this.password) //* comparamos el usuario enviado por el usuario y el password guardado en la BD , devuelve true o false
}
const UsuarioUpTask = mongoose.model("UsuarioUpTask", usuarioSchema);

export default UsuarioUpTask