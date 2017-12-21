const path = require("path");
const gulp = require("gulp");
const eslint = require("gulp-eslint");
const mocha = require("gulp-mocha");
const babel = require("gulp-babel");
// const browserify = require("browserify");
const Server = require("karma").Server;
// const uglify = require("gulp-uglify");
const rimraf = require("rimraf");
// const source = require("vinyl-source-stream");
// const rename = require("gulp-rename");
// const streamify = require("gulp-streamify");

gulp.task("lint", function() {
  return gulp.src(["./src/*.js"])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task("test-node", ["lint"], function() {
  return gulp.src("test/*.spec.js", {read: false})
    .pipe(mocha({timeout: 5000}));
});

gulp.task("clean", ["test-node"], function(cb) {
  rimraf("./dist", cb);
});

gulp.task("build", ["clean"], function() {
  gulp.src("./src/index.js")
    .pipe(babel({
      presets: ["env"]
    }))
    .pipe(gulp.dest("lib"));
});

// gulp.task("build-browser", ["clean"], function() {
//   return browserify("./index.js")
//     .bundle()
//     .pipe(source("pouchdb-seed-design.js"))
//     .pipe(gulp.dest("./dist/"))
//     .pipe(rename("pouchdb-seed-design.min.js"))
//     .pipe(streamify(uglify()))
//     .pipe(gulp.dest("./dist/"));
// });

gulp.task("test-browser", ["build"], function(done) {
  new Server({
    configFile: path.join(__dirname, "/karma.conf.js"),
    singleRun: true
  }, done).start();
});

gulp.task("default", ["test-browser", "build", "clean", "test-node", "lint"]);
