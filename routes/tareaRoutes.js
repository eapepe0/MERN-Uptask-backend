import express from "express";

import checkAuth from "../middleware/checkAuth.js";
import {
    agregarTarea,
    obtenerTarea,
    actualizarTarea,
    eliminarTarea,
    cambiarEstado,
} from "../controllers/tareaController.js";

const router = express.Router();

//* /api/tareas
router.post("/", checkAuth, agregarTarea);

//* /api/tareas/id
router
    .route("/:id")
    .get(checkAuth, obtenerTarea)
    .put(checkAuth, actualizarTarea)
    .delete(checkAuth, eliminarTarea);

//* /api/tareas/estado/id
router.post("/estado/:id", checkAuth, cambiarEstado)

export default router;
