'use strict'

const controller = {};
const passport = require('./passport');
const models = require('../models');
const { sign, verify } = require('./jwt');
const { sendForgotPasswordMail } = require('./mail');
const bcrypt = require('bcrypt');

controller.show = (req, res) => {
    if (req.isAuthenticated()) {
        return res.redirect('/');
    }
    res.render('login', { loginMessage: req.flash('loginMessage'), reqUrl: req.query.reqUrl, registerMessage: req.flash('registerMessage') });
}

controller.login = (req, res, next) => {
    let keepSignedIn = req.body.keepSignedIn;
    let reqUrl = req.body.reqUrl ? req.body.reqUrl : '/users/my-account'
    let cart = req.session.cart;
    passport.authenticate('local-login', (error, user) => {
        if (error) {
            return next(error) //chuyển sang middleware xử lý lỗi (đã khai báo ở index.js)
        }
        if (!user) {
            return res.redirect(`/users/login?reqUrl=${reqUrl}`);
        }
        req.logIn(user, (error) => { // hàm của Passport ghi thông tin user vào session.
            if (error) {
                return next(error);
            }
            //Ghi nhớ đăng nhập 1 ngày hoặc phiên đăng nhập sẽ bị xóa khi đóng trình duyệt.
            req.session.cookie.maxAge = keepSignedIn ? (24 * 60 * 60 * 1000) : null;
            req.session.cart = cart;  // Lưu giỏ hàng khi đăng nhập thành công

            return res.redirect(reqUrl);
        })
    })(req, res, next);  // authenticate trả về middleware -> gọi middelware ngay lập tức
}

controller.logout = (req, res, next) => {
    let cart = req.session.cart
    req.logout((error) => {  //hàm Passport.js dùng để đăng xuất người dùng.
        if (error) {
            return next(error);
        }
        req.session.cart = cart;  // Giữ giỏ hàng khi đã đăng xuất 
        res.redirect('/');
    })
}

controller.isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect(`/users/login?reqUrl=${req.originalUrl}`);
}

controller.register = (req, res, next) => {
    let reqUrl = req.body.reqUrl ? req.body.reqUrl : '/users/my-account';
    let cart = req.session.cart;
    passport.authenticate('local-register', (error, user) => {
        if (error) {
            return next(error) //chuyển sang middleware xử lý lỗi (đã khai báo ở index.js)
        }
        if (!user) {
            return res.redirect(`/users/login?reqUrl=${reqUrl}`);
        }
        req.logIn(user, (error) => {
            if (error) {
                return next(error);
            }
            req.session.cart = cart;
            res.redirect(reqUrl);
        })
    })(req, res, next);
}

controller.showForgotPassword = (req, res) => {
    res.render('forgot-password');
}

controller.forgotPassword = async (req, res) => {
    try {
        let email = req.body.email;

        // Kiểm tra nếu email tồn tại
        let user = await models.User.findOne({ where: { email } });

        if (!user) {
            return res.render('forgot-password', { message: 'Email does not exist!' });
        }

        // Tạo link reset password
        const host = req.header('host');
        const token = sign(email, "30m"); // Token hết hạn sau 30 phút
        const resetLink = `${req.protocol}://${host}/users/reset?token=${token}&email=${email}`;

        // Gửi email
        await sendForgotPasswordMail(user, host, resetLink);

        console.log('Email has been sent');
        return res.render('forgot-password', { done: true });

    } catch (error) {
        console.error('Error in forgotPassword:', error);
        return res.render('forgot-password', { message: 'An error has occurred. Please try again later!' });
    }
};

controller.showResetPassword = (req, res) => {
    let email = req.query.email;
    let token = req.query.token;
    if (!token || !verify(token)) {
        return res.render('reset-password', { expired: true })
    } else {
        return res.render('reset-password', { email, token }); // gửi vào input hidden
    }
}

controller.resetPassword = async (req, res) => {
    let email = req.body.email;  // input hidden
    let token = req.body.token;  // input hidden
    let password = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(8));

    await models.User.update({ password }, { where: { email } });
    res.render('reset-password', { done: true });
}

module.exports = controller;    