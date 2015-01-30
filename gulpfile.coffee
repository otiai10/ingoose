gulp   = require 'gulp'
tsc    = require 'gulp-typescript'
concat = require 'gulp-concat'

gulp.task 'build', () ->
    gulp.src './src/**/*.ts'
    .pipe tsc()
    .pipe concat 'ingoose.min.js'
    .pipe gulp.dest './dest'

gulp.task 'test', () ->
    gulp.src './test/src/**/*.ts'
    .pipe tsc()
    .pipe gulp.dest './test/compiled'

gulp.task 'default', ['build']
