const mysql      = require('mysql');
const connection = mysql.createConnection({
  host     : 'localhost',
  port     : '3307',
  user     : 'root',
  password : 'corjs1002',
  database : 'my_db'
});

connection.connect();

connection.query('SELECT * from topic', (error, rows, fields) => {
  if (error) throw error;
  console.log('User info is: ', rows);
});

connection.end();