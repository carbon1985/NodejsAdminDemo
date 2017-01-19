var app = require('express')();
var mysql = require('mysql');
var bodyParser = require('body-parser');

app.set('view engine', 'ejs');
app.set('views', __dirname + '/');

app.use(bodyParser.urlencoded({
    extended: false
}));

var connectionPool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'tan',
    password: '2211606',
    database: 'product'
});

app.get('/product/new', function(req, res) {
    connectionPool.getConnection(function(err, connection) {
        if (err) {
            res.send('getConnection error: ' + err);
        } else {
            connection.query('SELECT * FROM categories', function(err, rows, fields) {
                if (err) {
                    res.send('query error: ' + err);
                } else {
                    res.render('public/add_product.ejs', {
                        categories: rows,
                    });
                }
                connection.release();
            });
        }
    });
});

app.post('/product/add', function(req, res) {
    var name = req.body.name;
    var price = req.body.price;
    var cid = req.body.cid;
    connectionPool.getConnection(function(err, connection) {
        connection.query('INSERT INTO products SET ?', req.body, function(err, result) {
            if (err) {
                res.send('insert error: ' + err);
            } else {
                res.redirect('/');
            }
            connection.release();
        });
    });
});

app.get('/product/modify', function(req, res) {
    var id = req.query.id;
    connectionPool.getConnection(function(err, connection) {
        connection.query('SELECT * FROM products WHERE _id=' + id, function(err, rows, fields) {
            if (err) {
                res.send('query error for id ' + id + ': ' + err);
            } else {
                if (!rows || rows.length == 0) {
                    res.send('NO product for id ' + id);
                } else {
                    var product = rows[0];
                    connection.query('SELECT * FROM categories', function(err, rows, fields) {
                        res.render('public/modify_product.ejs', {
                            id: id,
                            product: product,
                            categories: rows,
                        });
                        connection.release();
                    });
                    return;

                }
            }
            connection.release();
        });
    });
});

app.post('/product/modify', function(req, res) {
    connectionPool.getConnection(function(err, connection) {
        connection.query('UPDATE products SET name=\'' + req.body.name + '\', price=' + req.body.price + ', cid=' + req.body.cid + ' WHERE _id=' + req.body.id, function(err, result) {
            if (err) {
                res.send('update table failed: ' + err);
            } else {
                res.redirect('/');
            }
            connection.release();
        });
    });
});

app.get('/product/delete', function(req, res) {
    var id = req.query.id;
    connectionPool.getConnection(function(err, connection) {
        connection.query('DELETE FROM products WHERE _id=' + id, function(err, result) {
            if (err) {
                res.send('delete item failed: ' + err);
            } else {
                res.redirect('/');
            }
            connection.release();
        });
    });
});

app.get('/', function(req, res) {
    connectionPool.getConnection(function(err, connection) {
        if (err) {
            res.send('getConnection error: ' + err);
        } else {
            connection.query('SELECT * FROM products', function(err, rows, fields) {
                if (err) {
                    res.send('query error: ' + err);
                } else {
                    res.render('public/index.ejs', {
                        rows: rows,
                    });
                }
                connection.release();
            });
        }
    });
});

app.listen(8080);
