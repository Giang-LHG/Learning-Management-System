const Subject = require('../../models/Subject');
const { Types } = require('mongoose');

/**
 * @desc Create a new subject
 * @route POST /api/subjects
 * @access Private
 */
const createSubject = async (req, res) => {
    try {
        const { code, name, description, prerequisites } = req.body;
        
        // Validate required fields
        if (!code || !name) {
            return res.status(400).json({
                success: false,
                message: 'Subject code and name are required'
            });
        }

        // Check for existing subject code
        const existingSubject = await Subject.findOne({ code });
        if (existingSubject) {
            return res.status(409).json({
                success: false,
                message: 'Subject code already exists'
            });
        }

        const newSubject = new Subject({
            code,
            name,
            description: description || '',
            prerequisites: prerequisites || [],
            status: 'pending', // Default to pending for admin approval
            createdBy: req.user.id
        });

        const savedSubject = await newSubject.save();
        
        res.status(201).json({
            success: true,
            message: 'Subject created successfully and pending approval',
            data: {
                id: savedSubject._id,
                code: savedSubject.code,
                name: savedSubject.name,
                status: savedSubject.status
            }
        });
    } catch (error) {
        console.error('Subject creation error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while creating subject'
        });
    }
};

/**
 * @desc Get all subjects with pagination and filtering
 * @route GET /api/subjects
 * @access Public
 */
const getAllSubjects = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, search } = req.query;
        const filter = {};

        // Validate pagination parameters
        const parsedPage = Math.max(1, parseInt(page));
        const parsedLimit = Math.min(100, Math.max(1, parseInt(limit))); // Limit max 100 items per page

        // Build filter conditions
        if (status) {
            const validStatuses = ['pending', 'approved', 'rejected'];
            if (validStatuses.includes(status)) {
                filter.status = status;
            }
        }

        if (search && search.length >= 3) { // Minimum 3 characters for search
            filter.$or = [
                { code: { $regex: search, $options: 'i' } },
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        // Execute query with pagination
        const [subjects, total] = await Promise.all([
            Subject.find(filter)
                .populate('createdBy', 'username email')
                .populate('prerequisites', 'code name')
                .skip((parsedPage - 1) * parsedLimit)
                .limit(parsedLimit)
                .sort({ createdAt: -1 })
                .lean(),
            Subject.countDocuments(filter)
        ]);

        res.status(200).json({
            success: true,
            data: {
                items: subjects,
                pagination: {
                    total,
                    page: parsedPage,
                    pages: Math.ceil(total / parsedLimit),
                    limit: parsedLimit
                }
            }
        });
    } catch (error) {
        console.error('Get subjects error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching subjects'
        });
    }
};

/**
 * @desc Get subject details by ID
 * @route GET /api/subjects/:id
 * @access Public
 */
const getSubjectById = async (req, res) => {
    try {
        if (!Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid subject ID format'
            });
        }

        const subject = await Subject.findById(req.params.id)
            .populate('createdBy', 'username email')
            .populate('prerequisites', 'code name')
            .lean();

        if (!subject) {
            return res.status(404).json({
                success: false,
                message: 'Subject not found'
            });
        }

        res.status(200).json({
            success: true,
            data: subject
        });
    } catch (error) {
        console.error('Get subject by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching subject'
        });
    }
};

/**
 * @desc Update subject information
 * @route PUT /api/subjects/:id
 * @access Private
 */
const updateSubject = async (req, res) => {
    try {
        const { id } = req.params;
        const { code, name, description, prerequisites } = req.body;

        if (!Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid subject ID format'
            });
        }

        const subject = await Subject.findById(id);
        if (!subject) {
            return res.status(404).json({
                success: false,
                message: 'Subject not found'
            });
        }

        // Authorization check - only creator or admin can update
        if (subject.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized to update this subject'
            });
        }

        // Check for duplicate subject code (excluding current subject)
        if (code && code !== subject.code) {
            const existingSubject = await Subject.findOne({ code, _id: { $ne: id } });
            if (existingSubject) {
                return res.status(409).json({
                    success: false,
                    message: 'Subject code already exists'
                });
            }
        }

        // Prepare update data
        const updateData = {
            code: code || subject.code,
            name: name || subject.name,
            description: description || subject.description,
            prerequisites: prerequisites || subject.prerequisites,
            status: req.user.role === 'admin' ? (req.body.status || subject.status) : subject.status
        };

        // Admin-only fields
        if (req.user.role === 'admin') {
            if (req.body.rejectionReason) {
                updateData.rejectionReason = req.body.rejectionReason;
            }
        }

        const updatedSubject = await Subject.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).populate('prerequisites', 'code name');

        res.status(200).json({
            success: true,
            message: 'Subject updated successfully',
            data: updatedSubject
        });
    } catch (error) {
        console.error('Update subject error:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: error.errors
            });
        }
        res.status(500).json({
            success: false,
            message: 'Internal server error while updating subject'
        });
    }
};

/**
 * @desc Delete subject
 * @route DELETE /api/subjects/:id
 * @access Private
 */
const deleteSubject = async (req, res) => {
    try {
        const { id } = req.params;

        if (!Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid subject ID format'
            });
        }

        const subject = await Subject.findById(id);
        if (!subject) {
            return res.status(404).json({
                success: false,
                message: 'Subject not found'
            });
        }

        // Authorization check - only creator or admin can delete
        if (subject.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized to delete this subject'
            });
        }

        await Subject.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: 'Subject deleted successfully'
        });
    } catch (error) {
        console.error('Delete subject error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while deleting subject'
        });
    }
};

/**
 * @desc Change subject status (Admin only)
 * @route PATCH /api/subjects/:id/status
 * @access Private/Admin
 */
const changeSubjectStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, rejectionReason } = req.body;

        if (!Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid subject ID format'
            });
        }

        const validStatuses = ['pending', 'approved', 'rejected'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status value'
            });
        }

        if (status === 'rejected' && !rejectionReason) {
            return res.status(400).json({
                success: false,
                message: 'Rejection reason is required when rejecting a subject'
            });
        }

        const subject = await Subject.findByIdAndUpdate(
            id,
            { 
                status,
                rejectionReason: status === 'rejected' ? rejectionReason : ''
            },
            { new: true }
        );

        if (!subject) {
            return res.status(404).json({
                success: false,
                message: 'Subject not found'
            });
        }

        res.status(200).json({
            success: true,
            message: `Subject status updated to ${status}`,
            data: subject
        });
    } catch (error) {
        console.error('Change subject status error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while updating subject status'
        });
    }
};

module.exports = {
    createSubject,
    getAllSubjects,
    getSubjectById,
    updateSubject,
    deleteSubject,
    changeSubjectStatus
};