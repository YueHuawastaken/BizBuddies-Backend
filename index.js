const express = require("express");
const cors = require("cors");
require("dotenv").config();

// For super admin pages only
const hbs = require("hbs");
const wax = require("wax-on");
const flash = require('connect-flash');

const session = require('express-session');
const FileStore = require('session-file-store')(session); //store session on server

// for csrf protection
const csurf = require('csurf');

// Initialize Express
let app = express();

// For super admin handlebar template pages only
app.set("view engine", "hbs")
wax.on(hbs.handlebars);
wax.setLayoutPath("./views/layout")

// ## Global Middlewares ##

// Enable cross origin resource sharing

app.use(cors());


// Enable forms in req
app.use('/admin', express.urlencoded({ extended: false }));

// create sessions on global route
app.use(session({
    store: new FileStore(),
    secret: process.env.SESSION_SECRET_KEY,
    resave: false,
    saveUninitialized: true
}));

// flash message for handlebar pages
app.use(flash());

const csrfInstance = csurf();

app.use(function(req, res, next) {
    if (req.url === "/checkout/process-payment") {
        console.log('checkout fulfill exception')
        return next();
    }
    
    else if (req.url.startsWith('/admin')){
        console.log('admin csrf hit')
        csrfInstance(req, res, next);
    } else {

    console.log('csrf with exception hit')
    next()
    }
})


app.use(function(error, req, res, next){
    console.log('session expiry routing hit');

    if(error && error.code == "EBADCSRFTOKEN"){
        req.flash("error", "Session expired, login and try again");
        res.redirect('/');
    } else {
        next();
    }
})

// Attach csrf token for templates usage
app.use(function(req,res,next){
    if(req.csrfToken){
        res.locals.csrfToken = req.csrfToken();
    }
    next();
})

// flash messages for template usage only
app.use(function(req,res,next){
    const successMessages = req.flash("success");
    const errorMessages = req.flash("error");
    res.locals.success_messages = successMessages;
    res.locals.error_messages = errorMessages;
    next();
})


// Enable user info for template
app.use(function(req, res, next){
    if (req.session.admin){
        res.locals.admin = req.session.admin
    }
    if (req.session.suppliers){
      res.locals.suppliers = req.session.suppliers;
    }
    next();
})


const landingRoutes = require('./routes/landing');
const productRoutes = require('./routes/products');
const supplierRoutes = require('./routes/suppliers');
const adminRoutes = require('./routes/admin');
const cloudinaryRoutes = require('./routes/cloudinary');
const searchRoutes = require('./routes/search')
const checkoutRoutes = require('./routes/checkout');
const cartRoutes = require('./routes/carts');
const orderRoutes = require('./routes/orders')

async function main(){

    app.use('/admin', adminRoutes);
    app.use('/', landingRoutes);
    app.use('/products', express.json(), productRoutes);
    app.use('/suppliers', express.json(), supplierRoutes);
    app.use('/search', express.json(), searchRoutes)
    app.use('/cloudinary', express.json(), cloudinaryRoutes);
    app.use('/cart', express.json(), cartRoutes);
    app.use('/orders', express.json(), orderRoutes);
    app.use('/checkout', checkoutRoutes);

}

main();

const port = process.env.PORT || 3000 || 10000;

app.listen(port, ()=>{
    console.log("Server started, listening at port ", port)
})