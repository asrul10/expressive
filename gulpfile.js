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
var flatten = require('gulp-flatten');
var gulpFilter = require('gulp-filter');
var autoprefixer = require('gulp-autoprefixer');
var mainBowerFiles = require('gulp-main-bower-files');

// Sripts
gulp.task('scripts', ['clean_scripts'], function() {
    return gulp.src('src/**/*.js')
        .pipe(plumber())
        .pipe(concat('app.js'))
        .pipe(uglify({
            mangle: false
        }))
        .pipe(rev())
        .pipe(gulp.dest('public/scripts'));
});

gulp.task('clean_scripts', function () {
	return gulp.src('public/scripts/**/*.js', {read: false})
    	.pipe(clean());
});

// Sass
gulp.task('sass', ['clean_styles'], function() {
    return gulp.src('scss/**/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(concat('main.css'))
        .pipe(csso())
        .pipe(autoprefixer('last 2 versions'))
        .pipe(rev())
        .pipe(gulp.dest('public/styles'));
});

gulp.task('clean_styles', function () {
	return gulp.src('public/styles/**/*.css', {read: false})
    	.pipe(clean());
});

// Bower main
gulp.task('bower', ['clean_bower'], function() {
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

gulp.task('clean_bower', function () {
	return gulp.src(['public/vendor/**/*.css', 'public/vendor/**/*.js'], {read: false})
    	.pipe(clean());
});

// Inject assets
gulp.task('inject_scripts', ['scripts'], function() {
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
        .pipe(gulp.dest('public'));
});

gulp.task('inject_styles', ['sass'], function() {
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
        .pipe(gulp.dest('public'));
});

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
        .pipe(gulp.dest('public'));
});

// Watch
gulp.task('watch', function() {
    gulp.watch(['scss/**/*.scss'], ['inject_styles']);
    gulp.watch(['src/**/*.js'], ['inject_scripts']);
});

// Default
gulp.task('default', ['inject']);
