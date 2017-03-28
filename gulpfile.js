var connect             = require('gulp-connect'),
    del                 = require('del'),
    gulp                = require('gulp'),
    runSequence         = require('run-sequence');

require('./gulp/lint');
require('./gulp/sass');
require('./gulp/browserify');

gulp.task('clean', function (cb) {
    del(['./demo/build/*'], cb);
});

gulp.task('clean-test', function (cb) {
    del(['./test/app/js/*'], cb);
});

gulp.task('serve', function() {

    connect.server({
        port: 9999,
        root: './demo/build',
        livereload: {
            port: 35111
        }
    });

});

gulp.task('fonts',  function(cb){
    gulp.src('./src/fonts/**/*.{eot,svg,ttf,woff,woff2}')
        .pipe(gulp.dest('./demo/build/fonts/'));
    cb();
});

gulp.task('html', function(){
    gulp.src('./demo/index.html')
        .pipe(gulp.dest('./demo/build/'))
        .pipe(connect.reload());
});

gulp.task('watch', ['watchify'], function(cb) {
    gulp.watch(['./src/js/**/*.js', './src/js/**/*.jsx'], ['lint-dev']);
    gulp.watch(['./src/css/**/*.scss'], ['sass-dev']);
    gulp.watch('./demo/index.html', ['html']);
    cb();
});

gulp.task('default', function(cb){
    runSequence(
        'clean',
        'lint-dev',
        ['sass-dev', 'html', 'fonts'],
        'watch',
        'serve',
        cb
    );
});