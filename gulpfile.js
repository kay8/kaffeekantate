'use strict';

var gulp = require('gulp'),
	browserSync = require('browser-sync'),
	$ = require('gulp-load-plugins')({
			pattern: ['gulp-*', 'gulp.*'],
			replaceString: /\bgulp[\-.]/,
			rename: {
				'gulp-pleeease': 'please',
				'gulp-minify-css': 'minifyCSS'
			}

	});


/**
 * Settings
 */


// directory
var dir = {
	current: './',
	css_min: 'dist/styles',
  js_min: 'dist/scripts',
	sass: 'assets/styles',
	partials: 'assets/styles/partials',
  js: 'assets/scripts'
};

// error notification settings for plumber
var plumberErrorHandler = { errorHandler: $.notify.onError({
		title: 'Gulp',
		message: "Error: <%= error.message %>"
	})
};


/**
 * Tasks
 */


// set up localhost and synchronize browser
gulp.task('browser-sync', function () {
    browserSync({
        port: 8100,
        browser: "google chrome",
        server: {
			baseDir: dir.current
        }
    });
});

// reload browser when js / html file changes
gulp.task('bs-reload', function () {
    browserSync.reload();
});

// compile sass
gulp.task('sass', function() {
	return gulp.src([dir.sass + '/*.scss', dir.partials + '/*.scss'])
	.pipe($.plumber(plumberErrorHandler))
	.pipe($.sass())
	.pipe($.please({
		autoprefixer: {"browsers": ["last 2 versions"]},
		minifier: false
	}))
	.pipe($.csscomb())
	.pipe(gulp.dest(dir.css_min))
	.pipe(browserSync.reload({stream: true}));
});

// minify css
gulp.task('minifyCSS', function() {
    return gulp.src([dir.css_min + '/*.css'])
		.pipe($.plumber(plumberErrorHandler))
        .pipe($.minifyCSS())
        .pipe(gulp.dest(dir.css_min))
        .pipe(browserSync.reload({stream: true}));
});

// minify js
gulp.task('uglify', function() {
    return gulp.src([dir.js_min + '/*.js'])
		.pipe($.plumber(plumberErrorHandler))
        .pipe($.uglify())
        .pipe(gulp.dest(dir.js_min))
        .pipe(browserSync.reload({stream: true}));
});

// js lint
gulp.task('lint', function() {
  gulp.src([dir.js + '/*.js'])
    .pipe($.jshint())
    // Use gulp-notify as jshint reporter
    .pipe($.notify(function (file) {
      if (file.jshint.success) {
        // Don't show something if success
        return false;
      }

      var errors = file.jshint.results.map(function (data) {
        if (data.error) {
          return "(" + data.error.line + ':' + data.error.character + ') ' + data.error.reason;
        }
      }).join("\n");
      return file.relative + " (" + file.jshint.results.length + " errors)\n" + errors;
    }))
    .pipe(gulp.dest(dir.js_min))
    .pipe(browserSync.reload({stream: true}));
});

// watch
gulp.task('watch', function() {
	gulp.watch(dir.js + '/*.js',['lint']);
  //gulp.watch([dir.sass + '/*.scss', dir.partials + '/*.scss'],['sass']);
	gulp.watch(dir.sass + '/*.scss',['sass']);
	gulp.watch(dir.partials + '/*.scss', ['sass']);
	gulp.watch(dir.current + '/*.html',['bs-reload']);
});

// production watch
gulp.task('watch_production', function() {
  gulp.watch(dir.js_min + '/*.js',['bs-reload']);
  gulp.watch(dir.css_min + '/*.css',['bs-reload']);
  gulp.watch(dir.current + '*.html',['bs-reload']);
});


// default
gulp.task('default', ['browser-sync', 'watch']);

// release
gulp.task('production', ['minifyCSS', 'uglify']);