import express from 'express'
import { registrar, autenticar, confirmar, olvidePassword, comprobarToken, nuevoPassword, perfil } from '../controllers/UsuarioController.js';
import checkAuth from '../middleware/checkAuth.js';




const router = express.Router();

//* Autenticacion , Registro y Confirmacion de Usuarios



//* el post / , seria a la url api/usuarios
//* api/usuarios
router.post('/', registrar) //* crear un usuario

//* api/usuarios/login
router.post('/login', autenticar)


//* api/usuarios/confirmar/:token
router.get('/confirmar/:token', confirmar) //* el :token es dinamico

//* api/usuarios/olvide-password
router.post('/olvide-password', olvidePassword)

//* api/usuarios/olvide-password/:token
//* router.get('/olvide-password/:token', comprobarToken)

//* api/usuarios/olvide-password/:token
//* router.post('/olvide-password/:token', nuevoPassword)

//* ya que se usan 2 veces la misma url "api/usuarios/olvide-password/:token" , se puede agrupar para tener mejor lectura del codigo de la siguiente manera : 

router.route('/olvide-password/:token').get(comprobarToken).post(nuevoPassword)

//* usamos el middleware checkAuth , despues de ejecutarse exitosamente , ejecutara la funcion perfil
router.get('/perfil', checkAuth, perfil)

export default router;