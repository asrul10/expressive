var express = require('express');
var app = express();
var morgan = require('morgan');
var bodyParser = require('body-parser');
var jwt = require('jsonwebtoken');
var models = require('./models');
var config = require('./config');
var crypto = require('crypto');

// Config
var port = process.env.PORT | 80;
app.set('superSecret', config.secret);
app.set('hashPassword', function(password) {
	return crypto.createHmac('sha256', app.get('superSecret')).update(password).digest('hex');
});
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(morgan('dev'));

// Model
var User = models.user;
var Group = models.userGroup;

// Sync
// User.sync({ force: true }).then(function() {
// 	User.create({
// 		firstName: 'Asrul',
// 		lastName: 'Hanafi',
// 		email: 'hanafi.asrul@gmail.com',
// 		groups: JSON.stringify([1, 2]),
// 		password: app.get('hashPassword')('password')
// 	});
// });
// Group.sync({ force: true }).then(function() {
// 	Group.create({
// 		groupName: 'Admin'
// 	});
// 	Group.create({
// 		groupName: 'Member'
// 	});
// });

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

// User
app
	.post('/api/user', function(req, res) {
		var userData = {
			firstName: req.body.firstName,
			lastName: req.body.lastName,
			email: req.body.email,
			groups: req.body.groups,
			password: req.body.password
		};

		if (req.body.id) {
			if (!req.body.password) {
				delete userData.password;
			}
			User.update(userData, { where: {id: req.body.id} }).then(function(user) {
				if (user) {
					res.json({success: true, message: 'User updated'});
				} else {
		        	res.json({success: false, message: 'Failed update'});
				}
			});
		} else {
			userData.password = app.get('hashPassword')(userData.password);
			User.findOrCreate({ where: {email: req.body.email}, defaults: userData }).spread(function(user, created) {
		        if (created) {
					res.json({success: true, message: 'User created'});
		        } else {
		        	res.json({success: false, message: 'Email already exist'});
		        }
			});
		}
	})

	.get('/api/user', function(req, res) {
		var offset = 0;
		if (req.query.offset) {
			offset = parseInt(req.query.offset);
		}

		var limit = 10;
		if (req.query.limit) {
			limit = parseInt(req.query.limit);
		}

		order = null;
		if (req.query.order) {
			var sort = req.query.sort ? req.query.sort : 'ASC';
			order = [[req.query.order, sort]];
		}

		var options = { 
			offset: offset, 
			limit: limit, 
			attributes: req.query.attributes, 
			order: order
		};

		if (req.query.search) {
			var val = { $like: '%' + req.query.search + '%' };
			options.where = {
				$or: [
					{ firstName: val },
					{ lastName: val },
					{ email: val }
			    ]
			};
		}

		User.findAndCountAll(options).then(function(user) {
			if (user) {
				res.json({
					users: user.rows,
					countAll: user.count
				});
			} else {
				res.status(204).json({
					success: false, 
					message: 'User not found'
				});
			}
		});
	})

	.get('/api/user/:id', function(req, res) {
		User.findById(req.params.id).then(function(user) {
			if (user) {
				res.json(user);
			} else {
				res.status(204).json({
					success: false, 
					message: 'User not found'
				});
			}
		});
	})

	.delete('/api/user', function(req, res) {
		if (req.query.id.isArray) {
			paramId = {
				in: req.query.id
			};
		} else {
			paramId = req.query.id;
		}

		User.destroy({ where: { id: paramId } }).then(function(user) {
			if (user) {
				res.json({
					success: true, 
					message: 'User deleted'
				});
			} else {
				res.status(204).json({
					success: false, 
					message: 'User not found'
				});
			}
		});
	});
	
// Group
app
	.post('/api/group', function(req, res) {
		var groupData = {
			groupName: req.body.groupName,
		};

		if (req.body.id) {
			Group.update(groupData, { where: {id: req.body.id} }).then(function(group) {
				if (group) {
					res.json({success: true, message: 'Group updated'});
				} else {
		        	res.json({success: false, message: 'Failed update'});
				}
			});
		} else {
			Group.create(groupData).then(function(group) {
		        if (group) {
					res.json({success: true, message: 'Group created'});
		        } else {
		        	res.json({success: false, message: 'Failed create group'});
		        }
			});
		}
	})

	.get('/api/group', function(req, res) {
		var offset = 0;
		if (req.query.offset) {
			offset = parseInt(req.query.offset);
		}

		var limit = 10;
		if (req.query.limit) {
			limit = parseInt(req.query.limit);
		}

		order = null;
		if (req.query.order) {
			var sort = req.query.sort ? req.query.sort : 'ASC';
			order = [[req.query.order, sort]];
		}

		var options = { 
			offset: offset, 
			limit: limit, 
			attributes: req.query.attributes, 
			order: order
		};

		if (req.query.search) {
			var val = { $like: '%' + req.query.search + '%' };
			options.where = {
				$or: [
					{ groupName: val }
			    ]
			};
		}

		Group.findAndCountAll(options).then(function(group) {
			if (group) {
				res.json({
					groups: group.rows,
					countAll: group.count
				});
			} else {
				res.status(204).json({
					success: false, 
					message: 'Group not found'
				});
			}
		});
	})

	.get('/api/group/:id', function(req, res) {
		Group.findById(req.params.id).then(function(group) {
			if (group) {
				res.json(group);
			} else {
				res.status(204).json({
					success: false, 
					message: 'Group not found'
				});
			}
		});
	})

	.delete('/api/group', function(req, res) {
		if (req.query.id.isArray) {
			paramId = {
				in: req.query.id
			};
		} else {
			paramId = req.query.id;
		}

		Group.destroy({ where: { id: paramId } }).then(function(group) {
			if (group) {
				res.json({
					success: true, 
					message: 'Group deleted'
				});
			} else {
				res.status(204).json({
					success: false, 
					message: 'Group not found'
				});
			}
		});
	});

app.listen(port);