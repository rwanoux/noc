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
function reloadTemplatesHTML() {

    return browserSync.reload("templates/**/*.html")
}

function reloadTemplatesHBS() {

    return browserSync.reload("templates/**/*.hbs")
}
exports.buildStyles = buildStyles;
exports.watch = function () {
    browserSync.init(
        {
            server: false,
            proxy: {
                target: "https://localhost:30000/",
                ws: true,
            }

        }
    );
    gulp.watch("./templates/**/*.html").on('change', reloadTemplatesHTML);
    gulp.watch("./templates/**/*.hbs").on('change', reloadTemplatesHBS);
    gulp.watch(['./scss/**/*.scss', './scss/*.scss'], buildStyles);

};
