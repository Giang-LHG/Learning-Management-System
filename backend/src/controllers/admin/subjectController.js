// controllers/subjectController.js
const Subject = require('../../models/Subject');
const { Types } = require('mongoose');

// Tạo môn học mới
const createSubject = async (req, res) => {
    try {
        const { code, name, description, prerequisites } = req.body;
        const createdBy = req.user.id; // Giả sử user ID được lấy từ middleware xác thực

        const newSubject = new Subject({
            code,
            name,
            description: description || '',
            prerequisites: prerequisites || [],
            status: 'approved',
            createdBy
        });

        const savedSubject = await newSubject.save();
        res.status(201).json({
            success: true,
            message: 'Môn học đã được tạo thành công!',
            subject: savedSubject
        });
    } catch (error) {
        if (error.name === 'MongoError' && error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Mã môn học đã tồn tại trong hệ thống'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Lỗi khi tạo môn học',
            error: error.message
        });
    }
};

// Lấy tất cả môn học (có phân trang và lọc)
const getAllSubjects = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, search } = req.query;
        const filter = {};

        if (status) filter.status = status;
        if (search) {
            filter.$or = [
                { code: { $regex: search, $options: 'i' } },
                { name: { $regex: search, $options: 'i' } }
            ];
        }

        const subjects = await Subject.find(filter)
            .populate('createdBy', 'username email')
            .populate('prerequisites', 'code name')
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        const total = await Subject.countDocuments(filter);

        res.status(200).json({
            success: true,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit),
            subjects
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách môn học',
            error: error.message
        });
    }
};

// Lấy chi tiết môn học theo ID
const getSubjectById = async (req, res) => {
    try {
        const subject = await Subject.findById(req.params.id)
            .populate('createdBy', 'username email')
            .populate('prerequisites', 'code name');

        if (!subject) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy môn học'
            });
        }

        res.status(200).json({
            success: true,
            subject
        });
    } catch (error) {
        if (error.kind === 'ObjectId') {
            return res.status(400).json({
                success: false,
                message: 'ID môn học không hợp lệ'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy thông tin môn học',
            error: error.message
        });
    }
};

// Cập nhật thông tin môn học
const updateSubject = async (req, res) => {
    try {
        const { code, name, description, prerequisites } = req.body;


        const subject = await Subject.findById(req.params.id);
        if (!subject) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy môn học'
            });
        }

        // Kiểm tra trùng mã môn học (trừ chính nó)
        if (code && code !== subject.code) {
            const existingSubject = await Subject.findOne({ code });
            if (existingSubject) {
                return res.status(400).json({
                    success: false,
                    message: 'Mã môn học đã tồn tại'
                });
            }
        }

        // Trong updateSubject (sau khi tìm được subject)
        // if (subject.createdBy.toString() !== req.user.id) {
        //     return res.status(403).json({
        //         success: false,
        //         message: 'Bạn không có quyền chỉnh sửa môn học này'
        //     });
        // }

        const updateData = {
            code: code || subject.code,
            name: name || subject.name,
            description: description || subject.description,
            prerequisites: prerequisites || subject.prerequisites
        };

        const updatedSubject = await Subject.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        ).populate('prerequisites', 'code name');

        res.status(200).json({
            success: true,
            message: 'Cập nhật môn học thành công',
            subject: updatedSubject
        });
    } catch (error) {
        if (error.name === 'MongoError' && error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Mã môn học đã tồn tại'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Lỗi khi cập nhật môn học',
            error: error.message
        });
    }
};

// Xóa môn học
const deleteSubject = async (req, res) => {
    try {
        const subject = await Subject.findByIdAndDelete(req.params.id);

        if (!subject) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy môn học'
            });
        }
        // Trong deleteSubject (sau khi tìm được subject)
        // if (subject.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
        //     return res.status(403).json({
        //         success: false,
        //         message: 'Bạn không có quyền xóa môn học này'
        //     });
        // }

        res.status(200).json({
            success: true,
            message: 'Môn học đã được xóa thành công'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi xóa môn học',
            error: error.message
        });
    }
};

// Duyệt môn học (Admin)
const approveSubject = async (req, res) => {
    try {
        const subject = await Subject.findByIdAndUpdate(
            req.params.id,
            {
                status: 'approved',
                rejectionReason: ''
            },
            { new: true }
        );

        if (!subject) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy môn học'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Môn học đã được duyệt',
            subject
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi duyệt môn học',
            error: error.message
        });
    }
};

// Từ chối môn học (Admin)
const rejectSubject = async (req, res) => {
    try {
        const { reason } = req.body;

        if (!reason) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp lý do từ chối'
            });
        }

        const subject = await Subject.findByIdAndUpdate(
            req.params.id,
            {
                status: 'rejected',
                rejectionReason: reason
            },
            { new: true }
        );

        if (!subject) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy môn học'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Môn học đã bị từ chối',
            subject
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi từ chối môn học',
            error: error.message
        });
    }
};

module.exports = {
    createSubject,
    getAllSubjects,
    getSubjectById,
    updateSubject,
    deleteSubject,
    approveSubject,
    rejectSubject
};