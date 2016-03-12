module.exports.database = {
	database: 'express',
	user: 'root',
	password: 'password',
	server: {
		host: '192.168.100.101',
		dialect: 'mysql',
		pool: {
			idle: false
		}
	}
};

module.exports.secret = 'kotaxdevSecret';