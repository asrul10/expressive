var gulp = require('gulp');
var rev = require('gulp-rev');
var sass = require('gulp-sass');
var csso = require('gulp-csso');
var clean = require('gulp-clean');
var merge = require('merge-stream');
var inject = require('gulp-inject');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var plumber = require('gulp-plumber');
var nodemon = require('gulp-nodemon');
var flatten = require('gulp-flatten');
var gulpFilter = require('gulp-filter');
var browserSync = require('browser-sync').create();
var autoprefixer = require('gulp-autoprefixer');
var mainBowerFiles = require('gulp-main-bower-files');
var reload = browserSync.reload;
var fs = require('fs');

// Build
gulp.task('scripts', function() {
    return gulp.src('src/**/*.js')
        .pipe(plumber())
        .pipe(concat('app.js'))
        .pipe(uglify({
            mangle: false
        }))
        .pipe(gulp.dest('public/scripts'));
});
gulp.task('sass', function() {
    return gulp.src('scss/**/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(concat('main.css'))
        .pipe(csso())
        .pipe(autoprefixer('last 2 versions'))
        .pipe(gulp.dest('public/styles'));
});
gulp.task('bower', function() {
    var filterJS = gulpFilter('**/*.js', {
        restore: true
    });
    var filterCSS = gulpFilter('**/*.css', {
        restore: true
    });
    var filterFonts = gulpFilter('**/*.{eot,svg,ttf,woff,woff2}');
    return gulp.src('bower.json')
        .pipe(plumber())
        .pipe(mainBowerFiles())
        .pipe(filterJS)
        .pipe(concat('vendor.js'))
        .pipe(uglify({
            mangle: false
        }))
        .pipe(gulp.dest('public/vendor/js'))
        .pipe(filterJS.restore)
        .pipe(filterCSS)
        .pipe(concat('vendor.css'))
        .pipe(csso())
        .pipe(gulp.dest('public/vendor/css'))
        .pipe(filterCSS.restore)
        .pipe(filterFonts)
        .pipe(flatten())
        .pipe(gulp.dest('public/vendor/fonts'));
});

// Production
gulp.task('scripts_production', function() {
    return gulp.src('src/**/*.js')
        .pipe(plumber())
        .pipe(concat('app.js'))
        .pipe(uglify({
            mangle: false
        }))
        .pipe(rev())
        .pipe(gulp.dest('public/scripts'));
});
gulp.task('sass_production', function() {
    return gulp.src('scss/**/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(concat('main.css'))
        .pipe(csso())
        .pipe(autoprefixer('last 2 versions'))
        .pipe(rev())
        .pipe(gulp.dest('public/styles'));
});
gulp.task('bower_production', function() {
    var filterJS = gulpFilter('**/*.js', {
        restore: true
    });
    var filterCSS = gulpFilter('**/*.css', {
        restore: true
    });
    var filterFonts = gulpFilter('**/*.{eot,svg,ttf,woff,woff2}');
    return gulp.src('bower.json')
        .pipe(plumber())
        .pipe(mainBowerFiles())
        .pipe(filterJS)
        .pipe(concat('vendor.js'))
        .pipe(uglify({
            mangle: false
        }))
        .pipe(rev())
        .pipe(gulp.dest('public/vendor/js'))
        .pipe(filterJS.restore)
        .pipe(filterCSS)
        .pipe(concat('vendor.css'))
        .pipe(csso())
        .pipe(rev())
        .pipe(gulp.dest('public/vendor/css'))
        .pipe(filterCSS.restore)
        .pipe(filterFonts)
        .pipe(flatten())
        .pipe(gulp.dest('public/vendor/fonts'));
});

// Clean
gulp.task('clean_scripts', function () {
	return gulp.src('public/scripts/**/*.js', {read: false})
    	.pipe(clean());
});
gulp.task('clean_styles', function () {
	return gulp.src('public/styles/**/*.css', {read: false})
    	.pipe(clean());
});
gulp.task('clean_bower', function () {
	return gulp.src(['public/vendor/css/*.css', 'public/vendor/js/*.js'], {read: false})
    	.pipe(clean());
});
gulp.task('clean', ['clean_scripts', 'clean_styles', 'clean_bower']);

// Inject assets
gulp.task('inject', ['scripts', 'sass', 'bower'], function() {
    var sources = gulp.src([
        'public/vendor/**/*.js',
        'public/scripts/**/*.js',
        'public/vendor/**/*.css',
        'public/styles/**/*.css'
    ], {
        read: false
    });
    return gulp.src('public/*.html')
        .pipe(inject(sources, {relative: true}))
        .pipe(gulp.dest('public'))
        .pipe(reload({ stream:true }));
});
gulp.task('inject_production', ['scripts_production', 'sass_production', 'bower_production'], function() {
    var sources = gulp.src([
        'public/vendor/**/*.js',
        'public/scripts/**/*.js',
        'public/vendor/**/*.css',
        'public/styles/**/*.css'
    ], {
        read: false
    });
    return gulp.src('public/*.html')
        .pipe(inject(sources, {relative: true}))
        .pipe(gulp.dest('public'))
        .pipe(reload({ stream:true }));
});

// Watch
gulp.task('browser-sync', ['nodemon'], function() {
	browserSync.init(null, {
		proxy: "http://localhost:8080",
        files: ["public/**/*.*"],
        browser: "google chrome",
        port: 7000,
	});
});
gulp.task('nodemon', function(cb) {
    fs.stat('public/scripts/app.js', function(err, stat) {
        if (err === null) {
        	var started = false;
        	return nodemon({
        		script: 'index.js',
                ignore: [
                    'public/**/*.js',
                    'src/**/*.js'
                ]
        	}).on('start', function () {
        		if (!started) {
        			cb();
        			started = true;
        		}
        	}).once('quit', function () {
        		process.exit();
        	});
        } else {
            console.log("//===============================================//");
            console.log("   Assets enviroment in production");
            console.log("   Change to development by running : $ gulp build");
            console.log("//===============================================//");
            process.exit();
        }
    });
});

// CLI
gulp.task('build', ['clean', 'inject']);
gulp.task('serve', ['browser-sync'], function() {
    gulp.watch(['src/**/*.js'], ['scripts']);
    gulp.watch(['scss/**/*.scss'], ['sass']);
});
gulp.task('production', ['clean', 'inject_production']);
