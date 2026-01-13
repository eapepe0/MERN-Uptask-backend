import SibApiV3Sdk from 'sib-api-v3-sdk'


/* export const emailRegistroViejoSMTP = async (datos) => {
    const { nombre, email, token } = datos

    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    }); */

    //* informacion del email
   /*  const info = await transport.sendMail(
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
} */

export const emailRegistro = async ( datos ) => {
    const { nombre, email, token } = datos

    const client = SibApiV3Sdk.ApiClient.instance
    client.authentications['api-key'].apiKey = process.env.EMAIL_API_KEY

    const api = new SibApiV3Sdk.TransactionalEmailsApi()

    await api.sendTransacEmail({
    sender: { email: "cuentas@uptask.com", name: "UpTask" },
    to: [{ email }],
    subject: "Uptask - Confirma tu cuenta",
    htmlContent: `
    <p>Hola ${nombre}, comprueba tu cuenta en UpTask</p>
    <p>Tu cuenta esta casi lista, solo debes comprobarla en el siguiente enlace :</p>

    <a href="${process.env.FRONTEND_URL}/confirmar/${token}">
        Confirmar cuenta
    </a>

    <p>Si tu no creaste esta cuenta , puedes ignorar el mensaje</p>
    `
  })
}

export const emailOlvidePassword = async (datos) => {
    const { nombre, email, token } = datos

    const client = SibApiV3Sdk.ApiClient.instance
    client.authentications['api-key'].apiKey = process.env.EMAIL_API_KEY

    const api = new SibApiV3Sdk.TransactionalEmailsApi()

    await api.sendTransacEmail({
    sender: { email: "cuentas@uptask.com", name: "UpTask" },
    to: [{ email }],
    subject: "Uptask - Reestablece tu password",
    htmlContent: `
        <p>Hola ${nombre}, has solicitado reestablecer tu password</p>
        <p>Haz click en el siguiente enlace para generar un nuevo password :</p>
            
        <a href="${process.env.FRONTEND_URL}/olvide-password/${token}">Reestablece tu Password</a>

        <p>Si tu no solicitaste reestablecer tu password , puedes ignorar el mensaje</p>
    `
  })
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

/* export const emailOlvidePasswordViejo = async (datos) => {
    const { nombre, email, token } = datos

    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
 */
    //* informacion del email
    /* const info = await transport.sendMail(
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
}  */