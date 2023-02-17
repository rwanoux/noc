'use strict';

const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
var browserSync = require('browser-sync').create();

function buildStyles() {
    return gulp.src('./scss/noc.scss')
        .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
        .pipe(gulp.dest('./css'))
        .pipe(browserSync.stream());


};

exports.buildStyles = buildStyles;
exports.watch = function () {
    browserSync.init(
        {
            server: false,
            proxy: {
                target: "localhost:16003",
                ws: true,
            }

        }
    );
    gulp.watch("./templates/**/*.html").on('change', browserSync.reload);

    gulp.watch(['./scss/**/*.scss', './scss/*.scss'], buildStyles);

};
