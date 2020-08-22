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

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done){
    done(null, user.id);
});

passport.deserializeUser(function(id, done){
    auth.userId = id;
    db.query('SELECT * FROM users', function(err, result){
        done(null, result[0])
    })
});

passport.use(new LocalStrategy(
    {
        usernameField: 'id',
        passwordField: 'password'
    },
    function(username, password, done){
        db.query('SELECT * FROM users WHERE user_id = ?', username, function(err, result){
            if(result[0] === undefined){
                console.log('실패...');
                return done(null, false, {
                    message: 'Incorrect id or password'
                });
            } else {
                if(password === result[0].user_password){
                    console.log('로그인 성공 user_name: ' + result[0].user_name);
                    return done(null, result[0]);
                } else {
                    console.log('실패...');
                    return done(null, false, {
                        message: 'Incorrect id or password'
                    });
                }
            }
        })
    }
))

app.get('/', (req, res) => {

    db.query('SELECT * FROM posts ORDER BY id DESC LIMIT 10', function(err, result){
        res.render('index', { 
            isOwner: auth.isOwner(req, res),
            posts: result})
    })
})

app.get('/login', (req, res) => {
    var fmsg = req.flash();
    var feedback = '';
    if(fmsg.error){
        feedback = fmsg.error[0];
    }
    res.render('login', {errorMsg: feedback})
})

app.post('/login',
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/login',
        failureFlash: true
    }));

app.get('/logout', function(req, res){
    req.logout();
    console.log("로그아웃")
    req.session.save(function(){
        res.redirect('/');
    })
})

app.get('/register', (req, res) => {
    res.render('log_use.ejs')
})

app.post('/register', async (req, res) => {
    var post = req.body;
    if(post.password === post.Repassword){
        db.query('INSERT INTO users (user_id, user_name, user_password, user_month, user_gender) VALUES (?, ?, ?, ?, ?)', 
        [post.id, post.user_name, post.password, post.month, post.gender], function(err, result){
            if(err) throw err;
            res.redirect('/login')
        })
    } else {
        console.log('비밀번호가 틀렸습니다.')
        res.redirect('/register')
    }
})

app.get('/newpost', (req, res) => {
    res.render('write_wrap.ejs')
})

app.post('/newpost', (req, res) => {
    var post = req.body;
    db.query('SELECT * FROM users WHERE id = ?', [auth.userId], function(err, result){
        db.query('INSERT INTO posts (title, description, created, author_id) VALUES (?, ?, NOW(), ?)',
        [post.title, post.description, result[0].user_name], function(err2, result2){
            if(err2) throw err2;
            res.redirect(`/page/${result2.insertId}`);
        })
    })
})

app.get('/page/:pageid', (req, res) => {
    res.send(req.params.pageid);
})

app.listen(3000, '0.0.0.0', function(){
    console.log('Listening to port : ' + 3000);
})