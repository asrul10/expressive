var express = require('express');
var app = express();
var morgan = require('morgan');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var jwt = require('jsonwebtoken');
var models = require('./models');
var config = require('./config');
var crypto = require('crypto');
var ejs = require('ejs');

// Config
var port = process.env.PORT | 80;
app
	.engine('html', ejs.renderFile)
	.set('views', __dirname + '/public')
	.set('view engine', 'html')
	.use(express.static(__dirname + '/public'))
	.set('superSecret', config.secret)
	.set('hashPassword', function(password) {
		return crypto.createHmac('sha256', app.get('superSecret')).update(password).digest('hex');
	})
	.use(bodyParser.urlencoded({ extended: false }))
	.use(bodyParser.json())
	.use(cookieParser());
if (process.env.NODE_ENV !== 'production') {
	app.use(morgan('dev'));
}

// Model
var User = models.user;
var Group = models.userGroup;

// Route
app
	// Client
	.get('*', function(req, res, next) {
		if (req.url.indexOf('/api/')) {
			res.render('index');
		} else {
			next();
		}
	})

	// REST
	.post('/api/auth', function(req, res) {
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

					var remember = {};
					if (!req.body.remember) {
						remember = {  expiresIn: '2d' };
					}

					var token = jwt.sign(tok, app.get('superSecret'), remember);

					res.json({ success: true, message: 'Success login', token: token });
				}
			}
		});
	})

	.use(function(req, res, next) {
		var token = req.body.token || req.query.token || req.cookies.token;
		if (token) {
			jwt.verify(token, app.get('superSecret'), function (err, decoded) {
				if (err) {
					return res.status(401).json({ success: false, message: 'Failed authenticate' });
				} else {
					req.decoded = decoded;
					next();
				}
			});
		} else {
			return res.status(403).json({ success: false, message: 'No token' });
		}
	})

	.get('/api/auth', function(req, res) {
		var token = req.body.token || req.query.token || req.cookies.token;
		var decoded = jwt.decode(token);

		res.json({ success: true, message: 'Loged in', user: decoded});
	})

	// User
	.post('/api/user', function(req, res) {
		var userData = {
			firstName: req.body.firstName,
			lastName: req.body.lastName,
			email: req.body.email,
			groups: req.body.groups,
			password: req.body.password
		};

		userData.password = app.get('hashPassword')(userData.password);
		User.findOrCreate({ where: {email: req.body.email}, defaults: userData }).spread(function(user, created) {
	        if (created) {
				res.status(201).json({success: true, message: 'User created'});
	        } else {
	        	res.json({success: false, message: 'Email already exist'});
	        }
		}).catch(function(err) {
	    	res.status(403).json({success: false, message: err.errors});
		});
	})

	.put('/api/user/:id', function(req, res) {
		var userData = {
			firstName: req.body.firstName,
			lastName: req.body.lastName,
			email: req.body.email,
			groups: req.body.groups
		};

		if (req.body.password) {
			userData.password = app.get('hashPassword')(req.body.password);
		}
		User.update(userData, { where: {id: req.params.id} }).then(function(user) {
			if (user) {
				res.json({success: true, message: 'User updated'});
			} else {
	        	res.json({success: false, message: 'Failed update'});
			}
		}).catch(function(err) {
	    	res.status(403).json({success: false, message: err.errors});
		});
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
				res.status(204).json({ success: false, message: 'User not found' });
			}
		});
	})

	.get('/api/user/:id', function(req, res) {
		User.findById(req.params.id).then(function(user) {
			if (user) {
				res.json(user);
			} else {
				res.status(204).json({ success: false, message: 'User not found' });
			}
		});
	})

	.delete('/api/user', function(req, res) {
		if (req.query.ids.isArray) {
			paramId = {
				in: req.query.ids
			};
		} else {
			paramId = req.query.ids;
		}

		User.destroy({ where: { id: paramId } }).then(function(user) {
			if (user) {
				res.json({ success: true, message: 'User deleted' });
			} else {
				res.status(204).json({ success: false, message: 'User not found' });
			}
		});
	})
	
	// Group
	.post('/api/group', function(req, res) {
		var groupData = {
			groupName: req.body.groupName,
		};

		Group.create(groupData).then(function(group) {
	        if (group) {
				res.json({success: true, message: 'Group created'});
	        } else {
	        	res.json({success: false, message: 'Failed create group'});
	        }
		}).catch(function(err) {
	    	res.status(403).json({success: false, message: err.errors});
		});
	})

	.put('/api/group/:id', function(req, res) {
		var groupData = {
			groupName: req.body.groupName,
		};

		Group.update(groupData, { where: {id: req.params.id} }).then(function(group) {
			if (group) {
				res.json({success: true, message: 'Group updated'});
			} else {
	        	res.json({success: false, message: 'Failed update'});
			}
		}).catch(function(err) {
	    	res.status(403).json({success: false, message: err.errors});
		}); 
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
				res.json({ groups: group.rows, countAll: group.count });
			} else {
				res.status(204).json({ success: false, message: 'Group not found' });
			}
		});
	})

	.get('/api/group/:id', function(req, res) {
		Group.findById(req.params.id).then(function(group) {
			if (group) {
				res.json(group);
			} else {
				res.status(204).json({ success: false, message: 'Group not found' });
			}
		});
	})

	.delete('/api/group', function(req, res) {
		if (req.query.ids.isArray) {
			paramId = {
				in: req.query.ids
			};
		} else {
			paramId = req.query.ids;
		}

		Group.destroy({ where: { id: paramId } }).then(function(group) {
			if (group) {
				res.json({ success: true, message: 'Group deleted' });
			} else {
				res.status(204).json({ success: false, message: 'Group not found' });
			}
		});
	});

app.listen(port);