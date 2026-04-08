const Contact = require('../models/Contact');
const { validationResult } = require('express-validator');
const sendEmail = require('../utils/sendEmail');

// @desc    Send contact message
// @route   POST /api/contact
// @access  Public
exports.sendContactMessage = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, email, phone, subject, message, category = 'general' } = req.body;

    // Create contact message
    const contactMessage = await Contact.create({
      name,
      email,
      phone,
      subject,
      message,
      category
    });

    // Send confirmation email to user
    try {
      await sendEmail({
        email: email,
        subject: 'Thank you for contacting Boisar Tourism',
        message: `
          <h2>Thank you for your message! 🌊</h2>
          <p>Dear ${name},</p>
          <p>We have received your message and will get back to you within 24 hours.</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Your Message:</strong></p>
          <p>${message}</p>
          <p>Best regards,<br>Boisar Tourism Team</p>
        `
      });
    } catch (emailError) {
      console.log('Confirmation email sending failed:', emailError);
      // Don't fail the contact form if email sending fails
    }

    // Send notification email to admin
    try {
      await sendEmail({
        email: process.env.ADMIN_EMAIL || 'admin@boisartourism.com',
        subject: `New Contact Message: ${subject}`,
        message: `
          <h2>New Contact Message Received</h2>
          <p><strong>From:</strong> ${name} (${email})</p>
          <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Category:</strong> ${category}</p>
          <p><strong>Message:</strong></p>
          <p>${message}</p>
          <p><strong>Received at:</strong> ${new Date().toLocaleString()}</p>
        `
      });
    } catch (emailError) {
      console.log('Admin notification email sending failed:', emailError);
    }

    res.status(201).json({
      success: true,
      message: 'Message sent successfully. We will get back to you soon!',
      data: {
        id: contactMessage._id,
        subject: contactMessage.subject,
        status: contactMessage.status
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all contact messages
// @route   GET /api/contact
// @access  Private/Admin
exports.getContactMessages = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      priority,
      category,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = { isActive: true };
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (category) filter.category = category;

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const messages = await Contact.find(filter)
      .populate('assignedTo', 'name email')
      .populate('reply.repliedBy', 'name')
      .sort(sort)
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Contact.countDocuments(filter);

    res.json({
      success: true,
      count: messages.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: messages
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update contact message
// @route   PUT /api/contact/:id
// @access  Private/Admin
exports.updateContactMessage = async (req, res, next) => {
  try {
    const {
      status,
      priority,
      category,
      assignedTo,
      reply,
      notes,
      isResolved
    } = req.body;

    const allowedUpdates = {
      status,
      priority,
      category,
      assignedTo,
      notes,
      isResolved
    };

    // Remove undefined values
    Object.keys(allowedUpdates).forEach(key => {
      if (allowedUpdates[key] === undefined) {
        delete allowedUpdates[key];
      }
    });

    const message = await Contact.findById(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found'
      });
    }

    // Handle reply
    if (reply && reply.message) {
      await message.addReply(reply.message, req.user.id);
    }

    // Handle closing message
    if (isResolved && !message.isResolved) {
      await message.close(req.user.id);
    }

    // Update other fields
    const updatedMessage = await Contact.findByIdAndUpdate(
      req.params.id,
      allowedUpdates,
      { new: true, runValidators: true }
    )
      .populate('assignedTo', 'name email')
      .populate('reply.repliedBy', 'name');

    res.json({
      success: true,
      message: 'Contact message updated successfully',
      data: updatedMessage
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete contact message
// @route   DELETE /api/contact/:id
// @access  Private/Admin
exports.deleteContactMessage = async (req, res, next) => {
  try {
    const message = await Contact.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found'
      });
    }

    res.json({
      success: true,
      message: 'Contact message deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
