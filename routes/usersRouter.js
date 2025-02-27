'use strict';

const express = require('express');
const router = express.Router();
const controller = require('../controllers/usersController');
const { body, validationResult } = require('express-validator')

// routes
router.get('/checkout', controller.checkout)
router.post('/placeorders',
    body('firstName').notEmpty().withMessage('First name is required!'),
    body('lastName').notEmpty().withMessage('Last name is required!'),
    body('email')
        .notEmpty().withMessage('Email is required!')
        .isEmail().withMessage('Invalid email address!'),
    body('mobile').notEmpty().withMessage('Mobile No. is required!'),
    body('address').notEmpty().withMessage('Address is required!'),
    (req, res, next) => {
        const errors = validationResult(req); // Hàm lấy danh sách các lỗi validation đã xảy ra trong request

        // Nếu chọn địa chỉ có sẵn, bỏ qua kiểm tra validation
        if (req.body.addressId !== "0") {
            return next();
        }

        // Nếu nhập địa chỉ mới và có lỗi -> hiển thị lỗi
        if (!errors.isEmpty()) {
            const message = errors.array().map(err => err.msg).join('<br/>');
            return res.render('error', { message });
        }

        next();
    },
    controller.placeorders
);

module.exports = router;