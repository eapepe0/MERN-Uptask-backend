import mongoose from "mongoose";

const tareaSchema = mongoose.Schema({
    nombre: {
        type: String,
        trim: true,
        required: true
    },
    descripcion: {
        type: String,
        trim: true,
        required: true
    },
    estado: {
        type: Boolean,
        default: false
    },
    fechaEntrega: {
        type: Date,
        default: Date.now()
    },
    prioridad: {
        type: String,
        required: true,
        enum: ["Baja", "Media", "Alta"]
    },
    proyecto: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ProyectoUpTask",
    },
    completado: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UsuarioUpTask",
    },
},
    {
        timestamps: true

    }
)

const Tarea = mongoose.model("TareaUpTask", tareaSchema)

export default Tarea

