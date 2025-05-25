'use strict'

const passport = require('passport');
const LocalStrategy = require('passport-local');
const bcrypt = require('bcrypt');
const models = require('../models');

// Hàm này được gọi khi xác thực thành công và lưu thông tin user vào session
passport.serializeUser((user, done) => {
    done(null, user.id);
})

// Hàm được gọi bởi passport.session để lấy thông tin user từ CSDL và đưa vào req.user
passport.deserializeUser(async (id, done) => {
    try {
        let user = await models.User.findOne({
            attributes: ['id', 'email', 'firstName', 'lastName', 'mobile', 'isAdmin'],
            where: { id }
        });
        done(null, user)
    } catch (error) {
        done(error, null);
    }
})

// Hàm xác thực người dùng khi đăng nhập
passport.use('local-login', new LocalStrategy({
    usernameField: 'email', // Tên đăng nhập là email
    passwordField: 'password',
    passReqToCallback: true // Cho phép truyền req vào callback để kiểm tra user đã đăng nhập chưa
}, async (req, email, password, done) => {
    if (email) {
        email = email.toLowerCase(); // Chuyển địa chỉ email sang ký tự thường
    }
    try {
        if (!req.user) {  // Nếu user chưa đăng nhập
            let user = await models.User.findOne({ where: { email } });
            if (!user) {  // nếu email chưa tồn tại
                return done(null, false, req.flash('loginMessage', 'Email does not exist!'));
            }
            if (!bcrypt.compareSync(password, user.password)) {  // Nếu mật khẩu không đúng
                return done(null, false, req.flash('loginMessage', 'Invalid Password!'));
            }
            // Cho phép đăng nhập
            return done(null, user);
        }
        // Bỏ qua đăng nhập
        done(null, req.user);
    } catch (error) {
        done(error);
    }
}))

// Hàm đăng ký tài khoản
passport.use('local-register', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, async (req, email, password, done) => {
    if (email) {
        email = email.toLowerCase();
    }
    if (req.user) {  // nếu người dùng đã đăng nhập -> bỏ qua
        return done(null, req.user)
    }
    try {
        let user = await models.User.findOne({ where: { email } })
        if (user) { // Nếu email đã tồn tại
            return done(null, false, req.flash('registerMessage', 'Email is already taken!'))
        }
        user = await models.User.create({
            email: email,
            password: bcrypt.hashSync(password, bcrypt.genSaltSync(8)),
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            mobile: req.body.mobile
        })
        // Thông báo đăng ký thành công
        done(null, false, req.flash('registerMessage', 'You have register successfully. Please login!'))
    } catch (error) {
        done(error)
    }
}))

module.exports = passport;