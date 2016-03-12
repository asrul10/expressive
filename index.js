var express = require('express');
var app = express();
var morgan = require('morgan');
var bodyParser = require('body-parser');
var jwt = require('jsonwebtoken');
var models = require('./models');
var config = require('./config');
var crypto = require('crypto');

// Config
var port = process.env.PORT | 3000;
app.set('superSecret', config.secret);
app.set('hashPassword', function(password) {
	return crypto.createHmac('sha256', app.get('superSecret')).update(password).digest('hex');
});
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(morgan('dev'));

// Model
var User = models.user;

// Route Client
app.use(express.static(__dirname + '/public'));
app.get('*', function(req, res, next) {
	if (req.url.indexOf('/api/')) {
		res.sendfile('public/index.html');
	} else {
		next();
	}
});

// REST
app.post('/api/auth', function(req, res) {
	User.findOne({
		where: {email: req.body.email} 
	}).then(function(user) {
		if (!user) {
			res.json({ success: false, message: 'User not found'});
		} else if (user) {
			var hash = app.get('hashPassword');
			if (user.password != hash(req.body.password)) {
				res.json({ success: false, message: 'Wrong password' });
			} else {
				var tok = {
					id: user.id,
					email: user.email
				};
				var token = jwt.sign(tok, app.get('superSecret'), {
					expiresIn: '7d'
				});

				res.json({
					success: true,
					message: 'Success login',
					token: token
				});
			}
		}
	});
});

app.use(function(req, res, next) {
	var token = req.body.token || req.query.token || req.headers['x-access-token'];
	if (token) {
		jwt.verify(token, app.get('superSecret'), function (err, decoded) {
			if (err) {
				return res.json({ success: false, message: 'Failed authenticate' });
			} else {
				req.decoded = decoded;
				next();
			}
		});
	} else {
		return res.status(403).send({
			success: false,
			message: 'No token'
		});
	}
});

app.get('/api/authenticated', function(req, res) {
	var token = req.body.token || req.query.token || req.headers['x-access-token'];
	var decoded = jwt.decode(token);

	res.json({ success: true, message: 'Loged in', user: decoded});
});

app
	.get('/api/user', function(req, res) {
		var offset = 0;
		if (req.query.offset) {
			offset = parseInt(req.query.offset);
		}
		var limit = 10;
		if (req.query.limit) {
			limit = parseInt(req.query.limit);
		}
		var count = false;
		if (req.query.count) {
			count = req.query.count;
		}
		User.findAll({ offset: offset, limit: limit }).then(function(user) {
			if (user) {
				User.count().then(function(total) {
					res.json({
						users: user,
						countAll: total
					});
				});
			} else {
				res.json({success: false, message: 'User no data'});
			}
		});
	})

	.get('/api/user/:id', function(req, res) {
		User.findById(req.params.id).then(function(user) {
			if (user) {
				res.json(user);
			} else {
				res.json({success: false, message: 'User not found'});
			}
		});
	});

app.listen(port);