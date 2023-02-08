'use strict';

const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));

function buildStyles() {
    return gulp.src('./scss/noc.scss')
        .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
        .pipe(gulp.dest('./css'));
};

exports.buildStyles = buildStyles;
exports.watch = function () {
    gulp.watch(['./scss/**/*.scss', '.scss/*.scss'], buildStyles)
};