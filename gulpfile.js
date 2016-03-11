var gulp = require('gulp');
var sass = require('gulp-sass');
var csso = require('gulp-csso');
var uglify = require('gulp-uglify');
var plumber = require('gulp-plumber');
var autoprefixer = require('gulp-autoprefixer');
var mainBowerFiles = require('gulp-main-bower-files');

// Sripts
gulp.task('script', function() {
	return gulp.src('src/**/*.js')
		.pipe(plumber())
		.pipe(uglify({ mangle: false }))
		.pipe(gulp.dest('public/src'));
});

// Sass
gulp.task('sass', function () {
  return gulp.src('style/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(csso())
    .pipe(autoprefixer('last 2 versions'))
    .pipe(gulp.dest('public/style'));
});

// Bower main
gulp.task('bower', function() {
    return gulp.src('bower.json')
        .pipe(plumber())
        .pipe(mainBowerFiles())
        .pipe(gulp.dest('public/dist'));
});

// Watch
gulp.task('watch', function() {
    gulp.watch(['style/**/*.scss'], ['sass']);
	gulp.watch(['src/**/*.js'], ['script']);
});

// Default
gulp.task('default', ['bower', 'sass', 'script']);