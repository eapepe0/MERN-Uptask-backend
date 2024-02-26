import express from "express";

import {
    obtenerProyecto,
    obtenerProyectos,
    nuevoProyecto,
    editarProyecto,
    eliminarProyecto,
    eliminarColaborador,
    agregarColaborador,
    buscarColaborador,

} from "../controllers/proyectoController.js";

import checkAuth from "../middleware/checkAuth.js";

const router = express.Router();

//* url : /api/proyectos
router
    .route("/")
    .get(checkAuth, obtenerProyectos)
    .post(checkAuth, nuevoProyecto);

router
    .route("/:id")
    .get(checkAuth, obtenerProyecto)
    .put(checkAuth, editarProyecto)
    .delete(checkAuth, eliminarProyecto);

/* router.get("/tareas/:id", checkAuth, obtenerTareas); */
router.post('/colaboradores', checkAuth, buscarColaborador)
router.post("/colaboradores/:id", checkAuth, agregarColaborador);
router.post("/eliminar-colaborador/:id", checkAuth, eliminarColaborador);

export default router;
