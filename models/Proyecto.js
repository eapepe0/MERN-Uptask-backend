import mongoose from "mongoose";

const proyectosSchema = mongoose.Schema(
    {
        nombre: {
            type: String,
            trim: true,
            required: true,
        },
        descripcion: {
            type: String,
            trim: true,
            required: true,
        },
        fechaEntrega: {
            type: Date,
            default: Date.now(),
        },
        cliente: {
            type: String,
            trim: true,
            required: true,
        },
        tareas: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "TareaUpTask"
            }
        ],
        creador: { //* es un objeto unico
            type: mongoose.Schema.Types.ObjectId, //*  de tipo ObjectoId , que seria el _id de un usuario
            ref: "UsuarioUpTask", //* y hace referencia a la coleccion UsuarioUpTask
        },//* colaboradores , al ser un array , por que pueden ser varios usuarios (ObjectId)
        colaboradores: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "UsuarioUpTask",
            },
        ],
    },
    {
        timestamps: true,
    }
);

const Proyecto = mongoose.model('ProyectoUpTask', proyectosSchema)


export default Proyecto