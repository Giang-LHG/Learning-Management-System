// controllers/subjectController.js
const Subject = require('../../models/Subject');
const { Types } = require('mongoose');

// Create a new subject
const createSubject = async (req, res) => {
    try {
        const { code, name, description, prerequisites } = req.body;
        const createdBy = req.user.id; // Assume user ID is obtained from authentication middleware

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
            message: 'Subject created successfully!',
            subject: savedSubject
        });
    } catch (error) {
        if (error.name === 'MongoError' && error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Subject code already exists in the system'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Error creating subject',
            error: error.message
        });
    }
};

// Get all subjects (with pagination and filtering)
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
            message: 'Error fetching subject list',
            error: error.message
        });
    }
};

// Get subject details by ID
const getSubjectById = async (req, res) => {
    try {
        const subject = await Subject.findById(req.params.id)
            .populate('createdBy', 'username email')
            .populate('prerequisites', 'code name');

        if (!subject) {
            return res.status(404).json({
                success: false,
                message: 'Subject not found'
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
                message: 'Invalid subject ID'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Error fetching subject information',
            error: error.message
        });
    }
};

// Update subject information
const updateSubject = async (req, res) => {
    try {
        const { code, name, description, prerequisites } = req.body;

        const subject = await Subject.findById(req.params.id);
        if (!subject) {
            return res.status(404).json({
                success: false,
                message: 'Subject not found'
            });
        }

        // Check for duplicate subject code (excluding itself)
        if (code && code !== subject.code) {
            const existingSubject = await Subject.findOne({ code });
            if (existingSubject) {
                return res.status(400).json({
                    success: false,
                    message: 'Subject code already exists'
                });
            }
        }

        // In updateSubject (after finding subject)
        // if (subject.createdBy.toString() !== req.user.id) {
        //     return res.status(403).json({
        //         success: false,
        //         message: 'You do not have permission to edit this subject'
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
            message: 'Subject updated successfully',
            subject: updatedSubject
        });
    } catch (error) {
        if (error.name === 'MongoError' && error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Subject code already exists'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Error updating subject',
            error: error.message
        });
    }
};

// Delete subject
const deleteSubject = async (req, res) => {
    try {
        const subject = await Subject.findByIdAndDelete(req.params.id);

        if (!subject) {
            return res.status(404).json({
                success: false,
                message: 'Subject not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Subject deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting subject',
            error: error.message
        });
    }
};

// Approve subject (Admin)
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
                message: 'Subject not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Subject approved',
            subject
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error approving subject',
            error: error.message
        });
    }
};

// Reject subject (Admin)
const rejectSubject = async (req, res) => {
    try {
        const { reason } = req.body;

        if (!reason) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a rejection reason'
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
                message: 'Subject not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Subject rejected',
            subject
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error rejecting subject',
            error: error.message
        });
    }
};

// Change subject status
const changeSubjectStatus = async (req, res) => {
    try {
        const { status } = req.body;
        console.log(status)
        const allowedStatuses = ['pending', 'approved', 'rejected'];
        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status value',
            });
        }
        const subject = await Subject.findByIdAndUpdate(
            req.params.id,
            { status, rejectionReason: status === 'rejected' ? (req.body.rejectionReason || '') : '' },
            { new: true, runValidators: true }
        );
        if (!subject) {
            return res.status(404).json({
                success: false,
                message: 'Subject not found',
            });
        }
        res.status(200).json({
            success: true,
            message: `Subject status updated to ${status}`,
            subject,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating subject status',
            error: error.message,
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
    rejectSubject,
    changeSubjectStatus,
};