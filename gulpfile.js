const gulp = require("gulp");
const plumber = require("gulp-plumber");
const sourcemap = require("gulp-sourcemaps");
const sass = require("gulp-sass");
const postcss = require("gulp-postcss");
const csso = require("postcss-csso");
const htmlmin = require ("gulp-htmlmin");
const autoprefixer = require("autoprefixer");
const sync = require("browser-sync").create();
const rename = require("gulp-rename");
const terser = require("gulp-terser");
const imagemin = require("gulp-imagemin");
const webp = require("gulp-webp");
const svgstore = require("gulp-svgstore");
const base = require("base");
const del = require("del");

// Styles

const styles = () => {
  return gulp.src("source/sass/style.scss")
  .pipe(plumber())
  .pipe(sourcemap.init())
  .pipe(sass())
  .pipe(gulp.dest("build/css"))
  .pipe(postcss([
  autoprefixer(),
  csso()
  ]))
  .pipe(sourcemap.write("."))
  .pipe(rename("style.min.css"))
  .pipe(gulp.dest("build/css"))
  .pipe(sync.stream());
  }


  exports.styles = styles;

// HTML

const html = () => {
  return gulp.src("source/*.html")
  .pipe(htmlmin({ collapseWhitespace: true }))
  .pipe(gulp.dest("build"));
}

exports.html = html;

// Scripts

const scripts = () => {
  return gulp.src("source/js/script.js")
  .pipe(gulp.dest("build/js"))
  .pipe(terser())
  .pipe(rename("script.min.js"))
  .pipe(gulp.dest("build/js"))
  .pipe(sync.stream());
}

exports.scripts = scripts;

// Images

const optimizeImages = () => {
  return gulp.src("source/img/**/*.{png,jpg,svg}")
  .pipe(imagemin([
    imagemin.mozjpeg({progressive: true}),
    imagemin.optipng({optimizationLevel: 3}),
    imagemin.svgo()
  ]))
    .pipe(gulp.dest("build/img"));
}

exports.images = optimizeImages;

const copyImages = () => {
  return gulp.src("source/img/**/*.{png,jpg,svg}")
  .pipe(gulp.dest("build/img"))
}

exports.images = copyImages;


// WebP

// const createWebp = () => {
//   return gulp.src("source/img/**/*.{png,jpg,svg}")
//   .pipe(webp({quality: 90}))
//   .pipe(gulp.dest("build/img"));
// }

// exports.createWebp = createWebp;

// Sprite

// const sprite = () => {
//   return gulp.src("source/img/*.svg")
//   .pipe(svgstore({
//     inLineSvg: true
//   }))
//   .pipe(rename("sprite.svg"))
//   .pipe (gulp.dest("build/img"));
// }

// exports.sprite = sprite;

// Copy

const copy = (done) => {
  gulp.src([
    "source/fonts/*.{woff2,woff,ttf,ttf2}",
    "source/*.ico",
    "source/*.svg",
    "source/img/**/*.svg",
    "!source/img/icons/*.png",
  ], {
    base:"source"
  })
  .pipe(gulp.dest("build"))
  done();
}

exports.copy = copy;

// Server

const server = (done) => {
  sync.init({
    server: {
      baseDir: "build"
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
}

exports.server = server;

// Reload

const reload = (done) => {
  sync.reload();
  done();
}


// Clean

const clean = () => {
  return del("build");
};

// Watcher

const watcher = () => {
  gulp.watch("source/sass/**/*.scss", gulp.series(styles));
  gulp.watch("source/*.html", gulp.series(html, reload));
  gulp.watch("source/js/*.js", gulp.series(scripts));
  gulp.watch("source/img/**/*.{png,jpg,svg}", gulp.series(copyImages));
}

exports.default = gulp.series(
  styles, server, watcher
);

// Build

const build = gulp.series(
  clean,
  copy,
  optimizeImages,
  gulp.parallel(
    styles,
    html,
    scripts
  ),
);

exports.build = build;

// Default

exports.default = gulp.series(
  clean,
  copy,
  copyImages,
  gulp.parallel(
    styles,
    html,
    scripts
  ),
  gulp.series(
    server,
    watcher,
  ),
);