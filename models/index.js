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
    name: {
        type: Sequelize.STRING,
        field: 'name'
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
    groupName: {
        type: Sequelize.STRING,
        field: 'group_name'
    }
}, {
    freezeTableName: true,
});

module.exports.sandBox = sequelize.define('sandbox', {
    name: {
        type: Sequelize.STRING,
        field: 'name'
    },
    gender: {
        type: Sequelize.STRING,
        field: 'gender'
    },
    address: {
        type: Sequelize.TEXT,
        field: 'address'
    },
}, {
    freezeTableName: true,
});

// export connection
module.exports.sequelize = sequelize;
