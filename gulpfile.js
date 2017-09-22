'use strict';

const gulp = require('gulp');
const browserSync = require('browser-sync');
const $ = require('gulp-load-plugins')({
            pattern: ['gulp-*', 'gulp.*'],
            replaceString: /\bgulp[\-.]/,
            rename: {
              'gulp-pleeease': 'please',
              'gulp-clean-css': 'minifyCSS',
              'gulp-scss-lint': 'scsslint'
            }
});


/**
 * Settings
 */


// directory
const dir = {
  current: './',
  css_min: 'dist/styles',
  js_min: 'dist/scripts',
  sass: 'assets/styles',
  partials: 'assets/styles/partials',
  js: 'assets/scripts',
  images_assets: 'assets/images',
  images_dist: 'dist/images'
};

// error notification settings for plumber
const plumberErrorHandler = { errorHandler: $.notify.onError({
    title: 'Gulp',
    message: "Error: <%= error.message %>"
  })
};


/**
 * Tasks
 */


// set up localhost and synchronize browser
gulp.task('browser-sync', () => {
  browserSync({
    port: 8100,
    browser: "google chrome",
    server: {
      baseDir: dir.current
    }
  });
});

// reload browser when js / html file changes
gulp.task('bs-reload', () => {
  browserSync.reload();
});

// compile sass
gulp.task('sass', () => {
  return gulp.src([dir.sass + '/*.scss', dir.partials + '/*.scss'])
  .pipe($.sourcemaps.init())
  .pipe($.plumber(plumberErrorHandler))
  .pipe($.sass())
  .pipe($.please({
    autoprefixer: {"browsers": ["last 2 versions"]},
    minifier: false
  }))
  .pipe($.csscomb())
  .pipe($.sourcemaps.write('.'))
  .pipe(gulp.dest(dir.css_min))
  .pipe(browserSync.reload({stream: true}));
});

// report scss lint
gulp.task('scsslint', () => {
  return gulp.src([dir.sass + '/*.scss', dir.partials + '/*.scss'])
  .pipe($.scsslint({
    'config': 'scss-lint.yml'
  }));
});

// minify css
gulp.task('minifyCSS', () => {
  return gulp.src([dir.css_min + '/*.css'])
  .pipe($.plumber(plumberErrorHandler))
  .pipe($.minifyCSS())
  .pipe(gulp.dest(dir.css_min))
  .pipe(browserSync.reload({stream: true}));
});

// minify js
gulp.task('uglify', () => {
  return gulp.src([dir.js_min + '/*.js'])
  .pipe($.plumber(plumberErrorHandler))
  .pipe($.uglify())
  .pipe(gulp.dest(dir.js_min))
  .pipe(browserSync.reload({stream: true}));
});

// js lint
gulp.task('lint', () => {
  gulp.src([dir.js + '/*.js'])
    .pipe($.sourcemaps.init())
    .pipe($.jshint())
    .pipe($.babel({
        presets: ['es2015']
    }))
    // Use gulp-notify as jshint reporter
    .pipe($.notify(function (file) {
      if (file.jshint.success) {
        // Don't show something if success
        return false;
      }

      const errors = file.jshint.results.map((data) => {
        if (data.error) {
          return "(" + data.error.line + ':' + data.error.character + ') ' + data.error.reason;
        }
      }).join("\n");
      return file.relative + " (" + file.jshint.results.length + " errors)\n" + errors;
    }))
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest(dir.js_min))
    .pipe(browserSync.reload({stream: true}));
});

// copy images
gulp.task('image', () => {
  return gulp.src([dir.images_assets + '/*'])
  .pipe($.plumber(plumberErrorHandler))
  .pipe(gulp.dest(dir.images_dist))
  .pipe(browserSync.reload({stream: true}));
});

// watch
gulp.task('watch', () => {
  gulp.watch(dir.js + '/*.js',['lint']);
  //gulp.watch([dir.sass + '/*.scss', dir.partials + '/*.scss'],['sass']);
  gulp.watch(dir.sass + '/*.scss',['sass', 'scsslint']);
  gulp.watch(dir.partials + '/*.scss', ['sass', 'scsslint']);
  gulp.watch(dir.current + '/*.html',['bs-reload']);
  gulp.watch(dir.images_assets + '/*',['image']);
});


// default: watch changes without minify / uglify
gulp.task('default', ['browser-sync', 'watch']);

// build: 
gulp.task('build', ['sass', 'scsslint', 'minifyCSS', 'lint', 'uglify', 'image']);

// production: only minify and uglify without sourcemaps
gulp.task('production', ['minifyCSS', 'uglify']);