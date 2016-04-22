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
var port = process.env.PORT | 8080;
app
    .engine('html', ejs.renderFile)
    .set('views', __dirname + '/public')
    .set('view engine', 'html')
    .use(express.static(__dirname + '/public'))
    .set('superSecret', config.secret)
    .set('hashPassword', function(password) {
        return crypto.createHmac('sha256', app.get('superSecret')).update(password).digest('hex');
    })
    .use(bodyParser.urlencoded({
        extended: false
    }))
    .use(bodyParser.json())
    .use(cookieParser());
if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
}

// Model
var User = models.user;
var Group = models.userGroup;
var Sandbox = models.sandBox;

// Groups Privilage
var privilageId = {
    admin: 1,
    member: 2
};

// Admin Privilage
function privilageAdmin(req) {
    var token = req.body.token || req.query.token || req.cookies.token;
    var user = jwt.decode(token);
    if (JSON.parse(user.groups).indexOf(privilageId.admin) < 0) {
        return false;
    } else {
        return true;
    }
}

// Route
app.get('/signin', function(req, res) {
    res.render('auth');
});

app.get('/signup', function(req, res) {
    res.render('auth');
});

app.get('*', function(req, res, next) {
    if (req.url.indexOf('/api/')) {
        res.render('index');
    } else {
        next();
    }
});

// Sign in User
app.post('/api/auth', function(req, res) {
    User.findOne({
        where: {
            email: req.body.email
        }
    }).then(function(user) {
        if (!user) {
            res.json({
                success: false,
                message: 'User not found'
            });
        } else if (user) {
            var hash = app.get('hashPassword');
            if (user.password != hash(req.body.password)) {
                res.json({
                    success: false,
                    message: 'Wrong password'
                });
            } else {
                var tok = {
                    id: user.id,
                    name: user.name,
                    groups: user.groups,
                    email: user.email
                };

                var remember = {};
                if (!req.body.remember) {
                    remember = {
                        expiresIn: '2d'
                    };
                }

                var token = jwt.sign(tok, app.get('superSecret'), remember);

                res.json({
                    success: true,
                    message: 'Success login',
                    token: token
                });
            }
        }
    });
});

// Sign up User
app.post('/api/user', function(req, res) {
    var groups = req.body.groups ? req.body.groups : ['[', privilageId.member, ']'].join('');

    var userData = {
        name: req.body.name,
        email: req.body.email,
        groups: groups,
        password: req.body.password
    };

    if (req.body.password.length >= 8) {
        userData.password = app.get('hashPassword')(userData.password);
        User.findOrCreate({
            where: {
                email: req.body.email
            },
            defaults: userData
        }).spread(function(user, created) {
            if (created) {
                res.status(201).json({
                    success: true,
                    message: 'User created'
                });
            } else {
                res.json({
                    success: false,
                    message: 'Email already exist'
                });
            }
        }).catch(function(err) {
            res.status(403).json({
                success: false,
                message: err.errors
            });
        });
    } else {
        res.json({
            success: false,
            message: 'Minimum password length 8'
        });
    }
});

// Middleware
app.use(function(req, res, next) {
    var token = req.body.token || req.query.token || req.cookies.token;
    if (token) {
        jwt.verify(token, app.get('superSecret'), function(err, decoded) {
            if (err) {
                return res.status(401).json({
                    success: false,
                    message: 'Failed authenticate'
                });
            } else {
                req.decoded = decoded;
                next();
            }
        });
    } else {
        return res.status(403).json({
            success: false,
            message: 'No token'
        });
    }
});

// Check Auth
app.get('/api/auth', function(req, res) {
    var token = req.body.token || req.query.token || req.cookies.token;
    var decoded = jwt.decode(token);

    res.json({
        success: true,
        message: 'Loged in',
        user: decoded
    });
});

// Sandbox
app.post('/api/sandbox', function(req, res) {
    var sandboxData = {
        name: req.body.name,
        gender: req.body.gender,
        address: req.body.address
    };

    Sandbox.create(sandboxData).then(function(sandbox) {
        if (sandbox) {
            res.json({
                success: true,
                message: 'Sandbox created'
            });
        } else {
            res.json({
                success: false,
                message: 'Failed create sandbox'
            });
        }
    }).catch(function(err) {
        res.status(403).json({
            success: false,
            message: err.errors
        });
    });
});

app.put('/api/sandbox/:id', function(req, res) {
    var sandboxData = {
        name: req.body.name,
        gender: req.body.gender,
        address: req.body.address
    };

    Sandbox.update(sandboxData, {
        where: {
            id: req.params.id
        }
    }).then(function(sandbox) {
        if (sandbox) {
            res.json({
                success: true,
                message: 'Sandbox updated'
            });
        } else {
            res.json({
                success: false,
                message: 'Failed update'
            });
        }
    }).catch(function(err) {
        res.status(403).json({
            success: false,
            message: err.errors
        });
    });
});

app.get('/api/sandbox', function(req, res) {
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
        order = [
            [req.query.order, sort]
        ];
    }

    var options = {
        offset: offset,
        limit: limit,
        attributes: req.query.attributes,
        order: order
    };

    if (req.query.search) {
        var val = {
            $like: '%' + req.query.search + '%'
        };
        options.where = {
            $or: [{
                name: val
            }, {
                gender: val
            }, {
                address: val
            }]
        };
    }

    Sandbox.findAndCountAll(options).then(function(sandbox) {
        if (sandbox) {
            res.json({
                sandbox: sandbox.rows,
                countAll: sandbox.count
            });
        } else {
            res.status(204).json({
                success: false,
                message: 'Sandbox not found'
            });
        }
    });
});

app.get('/api/sandbox/:id', function(req, res) {
    Sandbox.findById(req.params.id).then(function(sandbox) {
        if (sandbox) {
            res.json(sandbox);
        } else {
            res.status(204).json({
                success: false,
                message: 'Sandbox not found'
            });
        }
    });
});

app.delete('/api/sandbox', function(req, res) {
    if (req.query.ids.isArray) {
        paramId = { in : req.query.ids
        };
    } else {
        paramId = req.query.ids;
    }

    Sandbox.destroy({
        where: {
            id: paramId
        }
    }).then(function(sandbox) {
        if (sandbox) {
            res.json({
                success: true,
                message: 'Sandbox deleted'
            });
        } else {
            res.status(204).json({
                success: false,
                message: 'Sandbox not found'
            });
        }
    });
});

// User
app.put('/api/user/:id', function(req, res) {
    var userData = {
        name: req.body.name,
        email: req.body.email,
        groups: req.body.groups
    };

    if (req.body.password) {
        userData.password = app.get('hashPassword')(req.body.password);
    }
    User.update(userData, {
        where: {
            id: req.params.id
        }
    }).then(function(user) {
        if (user) {
            res.json({
                success: true,
                message: 'User updated'
            });
        } else {
            res.json({
                success: false,
                message: 'Failed update'
            });
        }
    }).catch(function(err) {
        res.status(403).json({
            success: false,
            message: err.errors
        });
    });
});

app.get('/api/user', function(req, res) {
    if (!privilageAdmin(req)) {
        return res.status(401).json({
            success: false,
            message: 'Not allowed'
        });
    }

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
        order = [
            [req.query.order, sort]
        ];
    }

    var options = {
        offset: offset,
        limit: limit,
        attributes: req.query.attributes,
        order: order
    };

    if (req.query.search) {
        var val = {
            $like: '%' + req.query.search + '%'
        };
        options.where = {
            $or: [{
                name: val
            }, {
                email: val
            }]
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
});

app.get('/api/user/:id', function(req, res) {
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
});

app.delete('/api/user', function(req, res) {
    if (!privilageAdmin(req)) {
        return res.status(401).json({
            success: false,
            message: 'Not allowed'
        });
    }

    if (req.query.ids.isArray) {
        paramId = { in : req.query.ids
        };
    } else {
        paramId = req.query.ids;
    }

    User.destroy({
        where: {
            id: paramId
        }
    }).then(function(user) {
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
app.post('/api/group', function(req, res) {
    if (!privilageAdmin(req)) {
        return res.status(401).json({
            success: false,
            message: 'Not allowed'
        });
    }

    var groupData = {
        groupName: req.body.groupName,
    };

    Group.create(groupData).then(function(group) {
        if (group) {
            res.json({
                success: true,
                message: 'Group created'
            });
        } else {
            res.json({
                success: false,
                message: 'Failed create group'
            });
        }
    }).catch(function(err) {
        res.status(403).json({
            success: false,
            message: err.errors
        });
    });
});

app.put('/api/group/:id', function(req, res) {
    if (!privilageAdmin(req)) {
        return res.status(401).json({
            success: false,
            message: 'Not allowed'
        });
    }

    var groupData = {
        groupName: req.body.groupName,
    };

    Group.update(groupData, {
        where: {
            id: req.params.id
        }
    }).then(function(group) {
        if (group) {
            res.json({
                success: true,
                message: 'Group updated'
            });
        } else {
            res.json({
                success: false,
                message: 'Failed update'
            });
        }
    }).catch(function(err) {
        res.status(403).json({
            success: false,
            message: err.errors
        });
    });
});

app.get('/api/group', function(req, res) {
    if (!privilageAdmin(req)) {
        return res.status(401).json({
            success: false,
            message: 'Not allowed'
        });
    }

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
        order = [
            [req.query.order, sort]
        ];
    }

    var options = {
        offset: offset,
        limit: limit,
        attributes: req.query.attributes,
        order: order
    };

    if (req.query.search) {
        var val = {
            $like: '%' + req.query.search + '%'
        };
        options.where = {
            $or: [{
                groupName: val
            }]
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
});

app.get('/api/group/:id', function(req, res) {
    if (!privilageAdmin(req)) {
        return res.status(401).json({
            success: false,
            message: 'Not allowed'
        });
    }

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
});

app.delete('/api/group', function(req, res) {
    if (!privilageAdmin(req)) {
        return res.status(401).json({
            success: false,
            message: 'Not allowed'
        });
    }

    if (req.query.ids.isArray) {
        paramId = { in : req.query.ids
        };
    } else {
        paramId = req.query.ids;
    }

    Group.destroy({
        where: {
            id: paramId
        }
    }).then(function(group) {
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
