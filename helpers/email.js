import nodemailer from 'nodemailer'


export const emailRegistro = async (datos) => {
    const { nombre, email, token } = datos

    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    //* informacion del email
    const info = await transport.sendMail(
        {
            from: '"UpTask - Administrador de Proyectos" <cuentas@uptask.com>',
            to: email,
            subject: "Uptask - Confirma tu cuenta",
            text: "Comprueba tu cuenta en UpTask",
            html: `<p>Hola ${nombre}, comprueba tu cuenta en UpTask</p>
            <p>Tu cuenta esta casi lista, solo debes comprobarla en el siguiente enlace :</p>
            
            <a href="${process.env.FRONTEND_URL}/confirmar/${token}">Comprobar tu cuenta</a>

            <p>Si tu no creaste esta cuenta , puedes ignorar el mensaje</p>`
        })
}


export const emailOlvidePassword = async (datos) => {
    const { nombre, email, token } = datos

    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    //* informacion del email
    const info = await transport.sendMail(
        {
            from: '"UpTask - Administrador de Proyectos" <cuentas@uptask.com>',
            to: email,
            subject: "Uptask - Reestablece tu password",
            text: "Reestablece tu Password",
            html: `<p>Hola ${nombre}, has solicitado reestablecer tu password</p>
            <p>Haz click en el siguiente enlace para generar un nuevo password :</p>
            
            <a href="${process.env.FRONTEND_URL}/olvide-password/${token}">Reestablece tu Password</a>

            <p>Si tu no solicitaste reestablecer tu password , puedes ignorar el mensaje</p>`
        })
} 