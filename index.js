'use strict';

const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const expressHbs = require('express-handlebars');
const { createStarList } = require('./controllers/handlebarsHelper');
const { createPagination } = require('express-handlebars-paginate');
const session = require('express-session');

// cau hinh public static folder
app.use(express.static(__dirname + '/public'));

// cau hinh su dung express-handlebars
app.engine('hbs', expressHbs.engine({
    layoutsDir: __dirname + '/views/layouts',
    partialsDir: __dirname + '/views/partials',
    extname: 'hbs',
    defaultLayout: 'layout',
    runtimeOptions: {
        allowProtoPropertiesByDefault: true,
    },
    helpers: {
        createStarList,
        createPagination
    }
}))
app.set('view engine', 'hbs');

//Cau hinh doc du lieu post tu body
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//Lưu trữ giỏ hàng trong session => Giữ trạng thái giỏ hàng giữa các lần truy cập.
//Cau hinh su dung session
app.use(session({
    secret: 'S3cret',
    resave: false, //session sẽ không được lưu lại trong store nếu không có thay đổi
    saveUninitialized: false, //session mới sẽ không được lưu nếu nó chưa có dữ liệu.
    cookie: {
        httpOnly: true,  //Cookie chỉ được truy cập bởi server, giúp chống tấn công XSS.
        maxAge: 20 * 60 * 1000 //Session hết hạn sau 20 phút.
    }
}))

//Middleware khoi tao gio hang
app.use((req, res, next) => {
    let Cart = require('./controllers/cart');
    req.session.cart = new Cart(req.session.cart ? req.session.cart : {});
    res.locals.quantity = req.session.cart.quantity;
    next();
})

//routes
app.use('/', require('./routes/indexRouter'));
app.use('/products', require('./routes/productsRouter'));
app.use('/users', require('./routes/usersRouter'));

app.use((req, res, next) => {
    res.status(404).render('error', { message: 'File not Found!' });
})

app.use((error, req, res, next) => {
    console.error(error);
    res.status(500).render('error', { message: 'Internal Server Error!' });
})

// khoi dong web server
app.listen(port, () => {
    console.log(`server is running on port ${port}`);
})