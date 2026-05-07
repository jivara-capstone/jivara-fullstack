import { Router } from "express";
import * as auditLogController from "../controllers/audit-log.controller";
import { authenticateToken, authorizeRoles } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticateToken);

/**
 * @swagger
 * tags:
 *   name: Audit Logs
 *   description: Riwayat akses dan perubahan data untuk admin
 */

router.get("/", authorizeRoles("admin"), auditLogController.listAuditLogs);

export default router;
