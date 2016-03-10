var express = require('express');
var app = express();
var morgan = require('morgan');
var bodyParser = require('body-parser');
var jwt = require('jsonwebtoken');
var models = require('./models');
var config = require('./config');

// Config
var port = process.env.PORT | 3000;
app.set('superSecret', config.secret);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(morgan('dev'));

// Model
var User = models.user;

// API
app.post('/api/auth', function(req, res) {
	User.findOne({
		where: {email: req.body.email} 
	}).then(function(user) {
		if (!user) {
			res.json({ success: false, message: 'User not found'});
		} else if (user) {
			if (user.password != req.body.password) {
				res.json({ success: false, message: 'Wrong password' });
			} else {
				var tok = {
					id: user.id,
					email: user.email
				};
				var token = jwt.sign(tok, app.get('superSecret'), {
					expiresInMinutes: 1440
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

app.get('/api/user', function(req, res) {
	User.findAll().then(function(user) {
		res.json(user);
	});
});

// Route Client
app.use(express.static(__dirname + '/public'));
function sendIndex(req, res) {
  res.sendfile('public/index.html');
}
app.get('*', sendIndex);

app.listen(port);