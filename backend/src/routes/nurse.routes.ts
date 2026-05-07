import { Router } from "express";
import * as nurseController from "../controllers/nurse.controller";
import { authenticateToken, authorizeRoles } from "../middleware/auth.middleware";
import { validateNurseCreate, validateNurseId, validateNurseUpdate } from "../validators/nurse.validator";

const router = Router();

router.use(authenticateToken);

/**
 * @swagger
 * tags:
 *   name: Nurses
 *   description: Manajemen akun perawat untuk admin
 */

router.get("/", authorizeRoles("admin"), nurseController.listNurses);
router.get("/:id", authorizeRoles("admin"), validateNurseId, nurseController.getNurse);
router.post("/", authorizeRoles("admin"), validateNurseCreate, nurseController.createNurse);
router.put("/:id", authorizeRoles("admin"), validateNurseId, validateNurseUpdate, nurseController.updateNurse);
router.delete("/:id", authorizeRoles("admin"), validateNurseId, nurseController.deactivateNurse);

export default router;
