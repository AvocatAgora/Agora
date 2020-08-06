var mysql = require('mysql');
var express = require('express');
var templete = require('./templete');
var qs = require('querystring');
var cookie = require('cookie');
const { request } = require('express');
var app = express();

var db = mysql.createConnection({
    host : 'localhost',
    port : '3307',
    user : 'root',
    password : 'corjs1002',
    database : 'opentutorials'
});
db.connect();

app.get('/', function(req, res){

    db.query(`SELECT * FROM topic`, function(error, topics){
        var title = 'Agora';
        var description = 'Hello, Node.js';
        var list = templete.list(topics);
        var html = templete.HTML(title, list,
            `<h2>${title}</h2>${description}`,
            `<a href="/create">create</a>`
        );
        res.send(html);
    });
});

app.get('/create', function(req, res){
    db.query(`SELECT * FROM topic`, function(error, topics){
        var title = `WEB - create`;
        var list = templete.list(topics);
        var html = templete.HTML(title, list,`
        <form action="create_process" method="post">
            <p><input type="text" name="title" placeholder="title"></p>
            <p>
                <textarea name="description" placeholder="description"></textarea>
            </p>
            <p>
                <input type="submit">
            </p>
        </form>
        `, ``);
        res.send(html);
    });
});

app.post('/create_process', function(req, res){
    var body = '';
    req.on('data', function(data){
        body += data;
    });
    req.on('end', function(){
        var post = qs.parse(body);
        var title  = post.title;
        var description = post.description;
        
        db.query(`INSERT INTO topic (title, description, created, author_id)
         VALUES(?, ?, NOW(), ?)`,
         [title, description, 1],
         function(error, result){
            if(error) throw error;
            res.redirect(302, `/page/${result.insertId}`);
        });
        
    });
});

app.get('/page/:pageId', function(req, res){
    var pageId = req.params.pageId;
    db.query(`SELECT * FROM topic`, function(error, topics){
        db.query(`SELECT * FROM topic WHERE id=?`, pageId, function(error2, topic){
            var title = topic[0].title;
            var description = topic[0].description;
            var list = templete.list(topics);
            var html = templete.HTML(title, list,
                `<h2>${title}</h2>${description}`,
                `<a href="/create">create</a>
                 <a href="/update/${pageId}">update</a>
                 <form action="delete_process" method="post">
                    <input type="hidden" name="id" value="${pageId}">
                    <input type="submit" value="delete">
                 </form>
                `
            );
            res.send(html);
        });
    });
});

app.get('/update/:pageId', function(req, res){
    var pageId = req.params.pageId;
    db.query(`SELECT * FROM topic`, function(error, topics){
        db.query(`SELECT * FROM topic WHERE id=?`, [pageId], function(error2, topic){
            var list = templete.list(topics);
            var html = templete.HTML(topic[0].title, list,
                `
                <form action="/update_process" method="post">
                    <input type="hidden" name="id" value="${topic[0].id}">
                    <p><input type="text" name="title" placeholder="title" value="${topic[0].title}"></p>
                    <p><textarea name="description" placeholder="description">${topic[0].description}</textarea>
                    <p><input type="submit"></p>
                </form>
                `,
                ``
                );
            res.send(html); 
        });
    });
});

app.post('/update_process', function(req, res){
    var body = '';
    req.on('data', function(data){
        body += data;
    });
    req.on('end', function(){
        var post = qs.parse(body);
        db.query('UPDATE topic SET title=?, description=?, author_id=1 WHERE id=?', [post.title, post.description, post.id], function(error){
            res.redirect(302, `/page/${post.id}`);
        });
    });
});

app.post('/page/delete_process', function(req, res){
    var body = '';
    req.on('data', function(data){
        body += data;
    });
    req.on('end', function(){
        var post = qs.parse(body);
        db.query('DELETE FROM topic WHERE id=?', [post.id], function(error, result){
            res.redirect('/');
        });
    });
});

app.listen(8080, () => console.log('Example app listening on port 8080!'));