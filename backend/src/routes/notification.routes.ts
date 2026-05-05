import { Router } from "express";
import * as notificationController from "../controllers/notification.controller";
import { authenticateToken, authorizeRoles } from "../middleware/auth.middleware";
import {
  validateNotificationId,
  validateNotificationSend,
  validatePushSubscribe,
} from "../validators/notification.validator";

const router = Router();

router.use(authenticateToken);

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Push notification dan riwayat reminder pasien
 */

/**
 * @swagger
 * /api/notifications/subscribe:
 *   post:
 *     summary: Daftarkan subscription push browser pasien
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Push subscription berhasil didaftarkan
 */
router.post("/subscribe", authorizeRoles("patient", "nurse", "admin"), validatePushSubscribe, notificationController.subscribe);

/**
 * @swagger
 * /api/notifications/send:
 *   post:
 *     summary: Kirim atau buat notifikasi pasien
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Notifikasi berhasil dibuat
 */
router.post("/send", authorizeRoles("nurse", "admin"), validateNotificationSend, notificationController.send);

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Ambil riwayat notifikasi
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Riwayat notifikasi berhasil diambil
 */
router.get("/", authorizeRoles("patient", "nurse", "admin"), notificationController.list);

/**
 * @swagger
 * /api/notifications/{id}/read:
 *   patch:
 *     summary: Tandai notifikasi sudah dibaca
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notifikasi berhasil ditandai sudah dibaca
 */
router.patch("/:id/read", authorizeRoles("patient", "nurse", "admin"), validateNotificationId, notificationController.markAsRead);

export default router;
