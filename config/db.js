import mongoose from "mongoose";

const conectarDB = async () => {
    try {
        const connection = await mongoose.connect(process.env.MONGO_URI) //* extraemos la url del archivo .env

        const url = `${connection.connection.host} : ${connection.connection.port}`
        console.log(`MongoDB conectado en : ${url}`)
    } catch (error) {
        console.log(`error : ${error.message}`);
        process.exit(1) //* cierra el processo si falla la conexion a la DB
    }
}

export default conectarDB