var gulp = require('gulp');
var plumber = require('gulp-plumber');
var mainBowerFiles = require('gulp-main-bower-files');

// Bower main
gulp.task('bower', function() {
    return gulp.src('bower.json')
        .pipe(plumber())
        .pipe(mainBowerFiles())
        .pipe(gulp.dest('public/dist'));
});

gulp.task('default', function() {
  // place code for your default task here
});