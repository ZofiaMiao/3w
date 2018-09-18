const gulp = require('gulp');
// 编译sass
const sass = require('gulp-sass');
// 处理通知
const notify = require('gulp-notify');
// 例外处理，避免例外导致 gulp watch 失效中断
const plumber = require('gulp-plumber');
// browser-sync同步服务器，浏览器同步检视
const browserSync = require('browser-sync').create();
// 将browser-sync的reload方法存起来，方便调用
const reload = browserSync.reload;
// 提取头尾公共部分
const fileinclude = require('gulp-file-include');
//压缩图片
const imagemin = require('gulp-imagemin');
const cache = require('gulp-cache');

const dirs = {
    dist: './dist',
    src: './src',
    pages: './src/pages',
    sass: './src/pages/sass',
    js: './src/pages/js',
    img: './src/pages/images',
    lib: './src/lib'
};

const files = {
    htmlFiles: dirs.pages + '/*.html',
    sassFiles: dirs.sass + '/*.scss',
    jsFiles: dirs.js + '/*.js',
    imgFiles: dirs.img + '/*.*',
};

gulp.task('compile-sass', () => {
    return gulp.src(files.sassFiles)
        .pipe(plumber({errorHandler: notify.onError('Error: <%= error.message %>')})) //使用gulp-notify和gulp-plumber用来阻止因为less语法写错跳出监视程序发生
        .pipe(sass({outputStyle: 'compact'}).on('error', sass.logError))
        .pipe(gulp.dest(dirs.dist + '/css'))
        .pipe(browserSync.stream());
});

gulp.task('compile-es6', () => {
    const babel = require('gulp-babel');
    return gulp.src(files.jsFiles)
        .pipe(babel())
        .pipe(gulp.dest(dirs.dist + '/js'))
        .pipe(browserSync.stream());
});

// 引用公共部分
gulp.task('include-header-footer', () => {
    gulp.src(files.htmlFiles)
        .pipe(fileinclude({
            basepath: dirs.lib,
            indent: true
        }))
        .pipe(gulp.dest(dirs.dist))
        .pipe(browserSync.stream());
});

// 图片处理
gulp.task('images', () => {
    return gulp.src(files.imgFiles)
        .pipe(cache(imagemin({
            optimizationLevel: 3,
            progressive: true,
            interlaced: true
        })))
        .pipe(gulp.dest('dist/images'))
        .pipe(notify({
            message: 'Images task complete'
        }));
});

// 本地服务器功能，自动刷新（开发环境）
gulp.task('run', () => {
    browserSync.init({
        server: {
            baseDir: 'dist/',  // 设置服务器的根目录
            index: 'index.html' // 指定默认打开的文件
        },
        files: ['**'],
        port: 8050,  // 指定访问服务器的端口号
        open: 'external',   // 决定Browsersync启动时自动打开的网址 external 表示 可外部打开 url, 可以在同一 wifi 下不同终端测试
        injectChanges: true,
        browser: "chrome"
    });

    gulp.watch(dirs.sass + '/**/*.scss', ['compile-sass']);
    gulp.watch(dirs.js + '/**/*.js', ['compile-es6']);
    gulp.watch(dirs.pages + '/*.html', ['include-header-footer']);
    gulp.watch(dirs.img + '/**/*', ['images']);
});