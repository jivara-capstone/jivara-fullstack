import { Router } from "express";
import * as prescriptionController from "../controllers/prescription.controller";
import { authenticateToken, authorizeRoles } from "../middleware/auth.middleware";
import {
  validatePrescriptionCreate,
  validatePrescriptionId,
  validatePrescriptionUpdate,
} from "../validators/prescription.validator";

const router = Router();

router.use(authenticateToken);

/**
 * @swagger
 * tags:
 *   name: Prescriptions
 *   description: Manajemen resep pasien
 */

/**
 * @swagger
 * /api/prescriptions:
 *   get:
 *     summary: Ambil daftar resep pasien
 *     tags: [Prescriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: patient_id
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Daftar resep berhasil diambil
 */
router.get("/", authorizeRoles("nurse", "admin"), prescriptionController.listPrescriptions);

/**
 * @swagger
 * /api/prescriptions/{id}:
 *   get:
 *     summary: Ambil detail resep
 *     tags: [Prescriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Detail resep berhasil diambil
 */
router.get("/:id", authorizeRoles("nurse", "admin"), validatePrescriptionId, prescriptionController.getPrescription);

/**
 * @swagger
 * /api/prescriptions:
 *   post:
 *     summary: Buat resep baru
 *     tags: [Prescriptions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Resep berhasil dibuat
 */
router.post("/", authorizeRoles("nurse", "admin"), validatePrescriptionCreate, prescriptionController.createPrescription);

/**
 * @swagger
 * /api/prescriptions/{id}:
 *   put:
 *     summary: Perbarui resep
 *     tags: [Prescriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Resep berhasil diperbarui
 */
router.put("/:id", authorizeRoles("nurse", "admin"), validatePrescriptionId, validatePrescriptionUpdate, prescriptionController.updatePrescription);

/**
 * @swagger
 * /api/prescriptions/{id}:
 *   delete:
 *     summary: Hapus resep
 *     tags: [Prescriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Resep berhasil dihapus
 */
router.delete("/:id", authorizeRoles("nurse", "admin"), validatePrescriptionId, prescriptionController.deletePrescription);

export default router;
