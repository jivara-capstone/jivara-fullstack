import { Router } from "express";
import * as activityReadController from "../controllers/activity-read.controller";
import { authenticateToken, authorizeRoles } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticateToken);

/**
 * @swagger
 * tags:
 *   name: Activity Reads
 *   description: Status baca log aktivitas per user
 */

/**
 * @swagger
 * /api/v1/activity-reads:
 *   get:
 *     summary: Ambil daftar aktivitas yang sudah dibaca user saat ini
 *     tags: [Activity Reads]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Daftar aktivitas terbaca berhasil diambil
 */
router.get("/", authorizeRoles("patient", "nurse", "admin", "super_admin", "superadmin"), activityReadController.listActivityReads);

/**
 * @swagger
 * /api/v1/activity-reads:
 *   post:
 *     summary: Tandai satu atau banyak aktivitas sebagai dibaca
 *     tags: [Activity Reads]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - activityIds
 *             properties:
 *               activityIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Aktivitas berhasil ditandai dibaca
 */
router.post("/", authorizeRoles("patient", "nurse", "admin", "super_admin", "superadmin"), activityReadController.markActivitiesRead);

export default router;
