if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}

var express = require('express')
var app = express()

var mysql = require('mysql')
var passport = require('passport')
    , LocalStrategy = require('passport-local')
    .Strategy;
var flash = require('connect-flash')
var session = require('express-session')
var auth = require('./auth')

var db = mysql.createConnection({
    host : 'localhost',
    port : '3306',
    user : 'root',
    password : process.env.DB_SECRET,
    database : 'agora_db'
})
db.connect()

app.set('view engine', 'ejs')
app.use(express.static(__dirname + '/public'))
app.use(express.urlencoded({extended : false}))
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
}))
app.use(flash());
app.get('/flash', function(req, res){
    req.flash('info', 'Flash is back!')
    res.redirect('/');
});

app.get('/flash-display', function(req, res){
    res.render('index', { message: req.flash('info')});
});

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done){
    done(null, user.id);
});

passport.deserializeUser(function(id, done){
    db.query('SELECT * FROM users', function(err, result){
        done(null, result[0])
    })
});

passport.use(new LocalStrategy(
    {
        usernameField: 'email',
        passwordField: 'password'
    },
    function(username, password, done){
        db.query('SELECT * FROM users WHERE user_email = ?', username, function(err, result){
            if(password === result[0].user_password){
                console.log('로그인 성공 user_name: ' + result[0].user_name);
                return done(null, result[0]);
            } else {
                return done(null, false, {
                    message: 'Incorrect password.'
                });
            }
        })
    }
))

app.get('/', (req, res) => {
    res.render('index')
})

app.get('/login', (req, res) => {
    res.render('login')
})

app.post('/login',
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/login'
    }));

app.get('/logout', function(req, res){
    req.logout();
    req.session.save(function(){
        res.redirect('/');
    })
})

app.get('/register', (req, res) => {
    res.render('register.ejs')
})

app.post('/register', async (req, res) => {
    try {
        db.query('INSERT INTO users (user_name, user_email, user_password) VALUES (?, ?, ?)',
        [req.body.name, req.body.email, req.body.password], function(error, result){
            res.redirect('/login')
        })
    } catch {
        res.redirect('/register')
    }
})

app.listen(8001, '0.0.0.0', function(){
    console.log('Listening to port : ' + 8001);
})