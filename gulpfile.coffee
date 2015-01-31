gulp   = require 'gulp'
tsc    = require 'gulp-typescript'
concat = require 'gulp-concat'
watch  = require 'gulp-autowatch'
uglify = require 'gulp-uglify'
rename = require 'gulp-rename'

gulp.task 'build', () ->
    gulp.src './src/**/*.ts'
    .pipe tsc()
    .pipe concat 'ingoose.js'
    .pipe gulp.dest './dest'

gulp.task 'test', ['build'], () ->
    gulp.src './test/src/**/*.ts'
    .pipe tsc()
    .pipe gulp.dest './test/compiled'

gulp.task 'watch', ['build'], (cb) ->
    watch gulp,
      build: './src/**/*.ts'
    return cb()

gulp.task 'uglify', () ->
    gulp.src './dest/ingoose.js'
    .pipe uglify
        mangle: false
    .pipe rename 'ingoose.min.js'
    .pipe gulp.dest './dest'

gulp.task 'default', ['build']
