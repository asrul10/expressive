var gulp = require('gulp');
var sass = require('gulp-sass');
var csso = require('gulp-csso');
var merge = require('merge-stream');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var plumber = require('gulp-plumber');
var flatten = require('gulp-flatten');
var gulpFilter = require('gulp-filter');
var autoprefixer = require('gulp-autoprefixer');
var mainBowerFiles = require('gulp-main-bower-files');

// Sripts
gulp.task('script', function() {
	return gulp.src('src/**/*.js')
		.pipe(plumber())
        .pipe(concat('app.js'))
		.pipe(uglify({ mangle: false }))
		.pipe(gulp.dest('public/scripts'));
});

// Sass
gulp.task('sass', function () {
  return gulp.src('scss/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(concat('main.css'))
    .pipe(csso())
    .pipe(autoprefixer('last 2 versions'))
    .pipe(gulp.dest('public/styles'));
});

// Bower main
gulp.task('bower', function() {
    var filterJS = gulpFilter('**/*.js', { restore: true });
    var filterCSS = gulpFilter('**/*.css', { restore: true });
    var filterFonts = gulpFilter('**/*.{eot,svg,ttf,woff,woff2}');
    return gulp.src('bower.json')
        .pipe(plumber())
        .pipe(mainBowerFiles())
        .pipe(filterJS)
        .pipe(concat('vendor.js'))
        .pipe(gulp.dest('public/vendor/js'))
        .pipe(filterJS.restore)
        .pipe(filterCSS)
        .pipe(concat('vendor.css'))
        .pipe(gulp.dest('public/vendor/css'))
        .pipe(filterCSS.restore)
        .pipe(filterFonts)
        .pipe(flatten())
        .pipe(gulp.dest('public/vendor/fonts'));
});

// Watch
gulp.task('watch', function() {
    gulp.watch(['style/**/*.scss'], ['sass']);
	gulp.watch(['src/**/*.js'], ['script']);
});

// Default
gulp.task('default', ['bower', 'sass', 'script']);