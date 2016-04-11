var models = require('./models');
var config = require('./config');
var crypto = require('crypto');

function password(string) {
	return crypto.createHmac('sha256', config.secret).update(string).digest('hex');
}

// Model
var User = models.user;
var Group = models.userGroup;
var Sandbox = models.sandBox;

// Sync
User.sync({ force: true }).then(function(res) {
	User.create({
		name: 'Admin',
		email: 'admin@admin.com',
		groups: JSON.stringify([1, 2]),
		password: password('password')
	});
});

Group.sync({ force: true }).then(function() {
	Group.create({
		groupName: 'Admin'
	});
	Group.create({
		groupName: 'Member'
	});
});

Sandbox.sync({ force: true });
