// routes/subjectRoute.js
const express = require('express');
const router = express.Router();
const subjectController = require('../../controllers/admin/subjectController');
const authMiddleware = require('../../middlewares/authMiddleware');
const adminMiddleware = require('../../middlewares/adminMiddleware');
const { check } = require('express-validator');

// Middleware xác thực người dùng
const requireAuth = authMiddleware.requireAuth;
// Middleware kiểm tra quyền admin
const requireAdmin = adminMiddleware.requireAdmin;

/**
 * @route POST /subjects
 * @description Tạo môn học mới
 * @access Private (Giảng viên)
 */
router.post(
  '/',
  [
    requireAuth,
    [
      check('code', 'Mã môn học là bắt buộc').not().isEmpty(),
      check('code', 'Mã môn học phải từ 3-20 ký tự').isLength({ min: 3, max: 20 }),
      check('name', 'Tên môn học là bắt buộc').not().isEmpty(),
      check('name', 'Tên môn học phải từ 5-100 ký tự').isLength({ min: 5, max: 100 }),
      check('description', 'Mô tả không quá 500 ký tự').optional().isLength({ max: 500 }),
      check('prerequisites', 'Môn học tiên quyết không hợp lệ').optional().isArray()
    ]
  ],
  subjectController.createSubject
);

/**
 * @route GET /subjects
 * @description Lấy danh sách môn học (có phân trang, lọc và tìm kiếm)
 * @access Public
 */
router.get(
  '/',
  [
    check('page', 'Số trang phải là số').optional().isInt({ min: 1 }),
    check('limit', 'Giới hạn bản ghi phải là số').optional().isInt({ min: 1, max: 100 }),
    check('status', 'Trạng thái không hợp lệ').optional().isIn(['pending', 'approved', 'rejected'])
  ],
  subjectController.getAllSubjects
);

/**
 * @route GET /subjects/:id
 * @description Lấy chi tiết môn học theo ID
 * @access Public
 */
router.get(
  '/:id',
  [check('id', 'ID không hợp lệ').isMongoId()],
  subjectController.getSubjectById
);

/**
 * @route PUT /subjects/:id
 * @description Cập nhật thông tin môn học
 * @access Private (Giảng viên - chỉ người tạo)
 */
router.put(
  '/:id',
  [
    requireAuth,
    check('id', 'ID không hợp lệ').isMongoId(),
    check('code', 'Mã môn học phải từ 3-20 ký tự').optional().isLength({ min: 3, max: 20 }),
    check('name', 'Tên môn học phải từ 5-100 ký tự').optional().isLength({ min: 5, max: 100 }),
    check('description', 'Mô tả không quá 500 ký tự').optional().isLength({ max: 500 }),
    check('prerequisites', 'Môn học tiên quyết không hợp lệ').optional().isArray()
  ],
  subjectController.updateSubject
);

/**
 * @route DELETE /subjects/:id
 * @description Xóa môn học
 * @access Private (Giảng viên - chỉ người tạo hoặc Admin)
 */
router.delete(
  '/:id',
  [
    requireAuth,
    check('id', 'ID không hợp lệ').isMongoId()
  ],
  subjectController.deleteSubject
);

/**
 * @route PATCH /subjects/:id/approve
 * @description Duyệt môn học
 * @access Private (Admin)
 */
router.patch(
  '/:id/approve',
  [
    requireAuth,
    requireAdmin,
    check('id', 'ID không hợp lệ').isMongoId()
  ],
  subjectController.approveSubject
);

/**
 * @route PATCH /subjects/:id/reject
 * @description Từ chối môn học
 * @access Private (Admin)
 */
router.patch(
  '/:id/reject',
  [
    requireAuth,
    requireAdmin,
    check('id', 'ID không hợp lệ').isMongoId(),
    check('reason', 'Lý do từ chối là bắt buộc').not().isEmpty(),
    check('reason', 'Lý do không quá 200 ký tự').isLength({ max: 200 })
  ],
  subjectController.rejectSubject
);

module.exports = router;