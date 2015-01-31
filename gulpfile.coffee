gulp   = require 'gulp'
tsc    = require 'gulp-typescript'
concat = require 'gulp-concat'
watch  = require 'gulp-autowatch'

gulp.task 'build', () ->
    gulp.src './src/**/*.ts'
    .pipe tsc()
    .pipe concat 'ingoose.min.js'
    .pipe gulp.dest './dest'

gulp.task 'test', () ->
    gulp.src './test/src/**/*.ts'
    .pipe tsc()
    .pipe gulp.dest './test/compiled'

gulp.task 'watch', ['build'], (cb) ->
    watch gulp,
      build: './src/**/*.ts'
    return cb()

gulp.task 'default', ['build']
