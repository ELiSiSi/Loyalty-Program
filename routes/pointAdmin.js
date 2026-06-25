import express from 'express';
const router = express.Router();

import { protect, restrictTo } from '../middleware/auth.js';
import {
  createPoint,
  deletePoint,
  getMyPoints,
  updatePoint,
} from '../controller/pointAdmin.js';

router.use(protect);
router.use(restrictTo('admin'));

/**
 * @swagger
 * tags:
 *   name: Points
 *   description: إدارة نظام النقاط للشركات (لأدمن الشركة فقط)
 */

/**
 * @swagger
 * /points:
 *   get:
 *     summary: جلب نظام النقاط الخاص بشركة الأدمن الحالي
 *     tags: [Points]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: تم جلب البيانات بنجاح
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 results:
 *                   type: integer
 *                   example: 1
 *                 data:
 *                   type: object
 *                   properties:
 *                     points:
 *                       type: array
 *                       items:
 *                         type: object
 *       401:
 *         description: غير مصرح لك بالدخول (التوكن غير موجود أو منتهي)
 */
router.get('/', getMyPoints);

/**
 * @swagger
 * /points:
 *   post:
 *     summary: إنشاء نظام نقاط جديد للشركة
 *     tags: [Points]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - currency
 *               - pointValue
 *               - pointsPercentage
 *             properties:
 *               name:
 *                 type: string
 *                 example: "نظام الولاء الصيفي"
 *               currency:
 *                 type: string
 *                 example: "EGP"
 *               pointValue:
 *                 type: number
 *                 example: 0.1
 *               pointsPercentage:
 *                 type: number
 *                 example: 5
 *     responses:
 *       201:
 *         description: تم إنشاء نظام النقاط بنجاح
 *       400:
 *         description: خطأ في البيانات المدخلة، أو الشركة لديها نظام نقاط بالفعل
 *       404:
 *         description: الشركة غير موجودة
 */
router.post('/', createPoint);

/**
 * @swagger
 * /points/{id}:
 *   patch:
 *     summary: تعديل بيانات نظام النقاط الحالي
 *     tags: [Points]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: معرف الـ Point ID المراد تعديله
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               currency:
 *                 type: string
 *               pointValue:
 *                 type: number
 *               pointsPercentage:
 *                 type: number
 *     responses:
 *       200:
 *         description: تم التعديل بنجاح
 *       404:
 *         description: لم يتم العثور على الـ ID أو لا تملك الصلاحية للشركة
 */
router.patch('/:id', updatePoint);

/**
 * @swagger
 * /points/{id}:
 *   delete:
 *     summary: حذف نظام نقاط معين
 *     tags: [Points]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: معرف الـ Point ID المراد حذفه
 *     responses:
 *       204:
 *         description: تم الحذف بنجاح (لا يوجد محتوى معاد)
 *       404:
 *         description: لم يتم العثور على الـ ID أو لا تملك الصلاحية للشركة
 */
router.delete('/:id', deletePoint);

export default router;
