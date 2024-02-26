import express from 'express'

import dotenv from 'dotenv';
dotenv.config()

import cors from 'cors'

import conectarDB from './config/db.js'; //* si el archivo es creado por el usuario agregar el ".js"
import usuarioRoutes from './routes/usuarioRoutes.js'
import proyectoRoutes from './routes/proyectoRoutes.js'
import tareaRoutes from './routes/tareaRoutes.js'



const app = express();
app.use(express.json()) //* nos permite trabajar con request del tipo json 

conectarDB();
//* configurar cors
//* lista blanca
const whitelist = [process.env.FRONTEND_URL];

const corsOptions = {
    origin: function (origin, callback) {
        if (whitelist.includes(origin)) {
            //* puede consultar la api
            callback(null, true)
        } else {
            //* no esta permitido el request
            callback(new Error("Error de CORS"))
        }
    }
}

app.use(cors(corsOptions))

//* routing

app.use("/api/usuarios", usuarioRoutes)
app.use("/api/proyectos", proyectoRoutes)
app.use("/api/tareas", tareaRoutes)










//*  servidor
const PORT = process.env.PORT || 4000

const servidor = app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`)
});

//* socket.io

import { Server } from 'socket.io';

const io = new Server(servidor, {
    pingTimeout: 60000,
    cors: {
        origin: process.env.FRONTEND_URL
    }
})

io.on('connection', (socket) => {
    console.log("Conectado a socket.io")

    //* definir los eventos de socket io

    //* unimos al usuario al room proyecto
    socket.on('abrir proyecto', (proyecto) => {
        socket.join(proyecto)
    })

    //* evento nueva tarea , toma una tarea
    //* extraemos el proyecto de la tarea
    //* emitimos un evento 'tarea agregada' a todos los clientes que esten en el mismo room
    socket.on('nueva tarea', (tarea) => {
        const proyecto = tarea.proyecto
        socket.to(proyecto).emit('tarea agregada', tarea)
    })

    //* eliminar tarea toma una tarea , le emitimos a todos los conectado al room proyecto , 'tarea eliminada'
    socket.on('eliminar tarea', (tarea) => {
        const proyecto = tarea.proyecto
        socket.to(proyecto).emit('tarea eliminada', tarea)

    })

    socket.on('actualizar tarea', (tarea) => {
        const proyecto = tarea.proyecto._id
        socket.to(proyecto).emit('tarea actualizada', tarea)

    })

    socket.on('cambiar estado', tarea => {
        const proyecto = tarea.proyecto._id
        socket.to(proyecto).emit('nuevo estado', tarea)
    })
})