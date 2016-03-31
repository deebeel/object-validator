'use strict';
var gulp = require('gulp');
var jasmine = require('gulp-jasmine');
gulp.task('test:run', function () {
    return gulp.src(['index.js', 'spec/**/*spec.js'])
        .pipe(jasmine({
            verbose: true
        }));
});

gulp.task('test:watch', function () {
    return gulp.watch(['index.js', 'spec/**/*spec.js'], ['test:run']);
});

