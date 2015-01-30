gulp = require 'gulp'
tsc  = require 'gulp-typescript'

gulp.task 'test', () ->
    gulp.src './test/src/**/*.ts'
    .pipe tsc()
    .pipe gulp.dest './test/compiled'
