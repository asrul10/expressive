var config = require('../config');
var Sequelize = require('sequelize');

// initialize database connection
var sequelize = new Sequelize(
    config.database.database, 
    config.database.user, 
    config.database.password, 
    config.database.server
);

// Models
module.exports.user = sequelize.define('user', {
    firstName: {
        type: Sequelize.STRING,
        field: 'first_name'
    },
    lastName: {
        type: Sequelize.STRING,
        field: 'last_name'
    },
    email: {
    	type: Sequelize.STRING(255),
    	field: 'email',
        validate: {
            isEmail: true
        }
    },
    groups: {
        type: Sequelize.TEXT,
        field: 'groups'
    },
    password: {
    	type: Sequelize.TEXT,
    	field: 'password'
    }
}, {
    freezeTableName: true,
});

module.exports.userGroup = sequelize.define('user_group', {
    groupName : {
        type: Sequelize.STRING,
        field: 'group_name'
    }
}, {
    freezeTableName: true,
});

// export connection
module.exports.sequelize = sequelize;