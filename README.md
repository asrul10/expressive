![alt tag](https://raw.githubusercontent.com/asrul10/expressive/master/public/images/expressive.png)
# Expressive
Custom M-EAN starter Mysql, Express, Angular, Nodejs with theme Angular Material

[![npm version](https://img.shields.io/npm/v/expressive-angular.svg)](https://www.npmjs.com/package/expressive-angular)
[![Dependency Status](https://img.shields.io/david/asrul10/expressive.svg)](https://github.com/asrul10/expressive)
[![Dev-Dependency Status](https://img.shields.io/david/dev/asrul10/expressive.svg)](https://github.com/asrul10/expressive)

## Demo
Live demo https://expressive.kotaxdev.com
```
Email : demo@demo.com
Password : password
```

## Installation
Install `gulp-cli` and `bower` globally

Clone expressive
```
  $ git clone https://github.com/asrul10/expressive.git
```

Install node packages
```
  $ npm install
```

Install bower packages
```
  $ bower install
```

Config databses in `config/index.js`
Sync models
```
  $ node sync.js
```

Run expressive in development
```
  $ gulp build
  $ gulp serve
```

For production
```
  $ gulp production
```

Now you can run the app on the browser `http://localhost`

## Feature

### Server
  - Build system `Gulp`
  - Framework `Express.js`
  - Database `sequelize`
  - Authentication based token `jsonwebtoken`
  - Example CRUD api

### Client
  - Framework `Angularjs`
  - Theme Material Design `Angular Material`
  - CRUD with theme `Material Design Data Table`
