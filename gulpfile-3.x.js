var es = require('event-stream');
var gulp = require('gulp');
var concat = require('gulp-concat');
var connect = require('gulp-connect');
var templateCache = require('gulp-angular-templatecache');
var ngAnnotate = require('gulp-ng-annotate');
var uglify = require('gulp-uglify');
var del = require('del');
var fs = require('fs');
var gulpLivereload = require('gulp-livereload');
var _ = require('lodash');
var gulpHtmlVersion = require('gulp-html-version');
var jsonModify = require('gulp-json-modify');
var stripDebug = require('gulp-strip-debug');


var scripts = require('./app.scripts.json');

var version = {
    // paramName: 'version',
    paramType: 'timestamp',
    suffix: ['css', 'js']
};

var source = {
    js: {
        main: 'app/main.js',
        src: [
            // application config
            'app.config.js',

            // application bootstrap file
            'app/main.js',

            // main module
            'app/app.js',

            // module files
            'app/**/module.js',

            // other js files [controllers, services, etc.]
            'app/**/!(module)*.js'
        ],
        tpl: '**/*.tpl.html',
        html: '*.html'
    }
};

var destinations = {
    js: 'build',
    'public': 'public'
};


gulp.task('build', function(){
    return es.merge(gulp.src(source.js.src) , getTemplateStream())
         .pipe(ngAnnotate())
         .pipe(uglify())
        .pipe(concat('app.js'))
        .pipe(gulp.dest(destinations.js));
});

gulp.task('js', function(){
    return es.merge(gulp.src(source.js.src) , getTemplateStream())
        .pipe(concat('app.js'))
        .pipe(gulp.dest(destinations.js));
});

gulp.task('m-js', ['js'], function(){
    return gulp.src(destinations.js + '/*.js')
        .pipe(gulp.dest(destinations['public'] + '/' + destinations.js));
});

gulp.task('m-html', function(){
    gulp.src([
        'app/**/' + source.js.html,
        'app/' + source.js.tpl
    ]).pipe(gulp.dest(destinations['public'] + '/app'));

    return gulp.src([
                source.js.html
            ])
        .pipe(gulp.dest(destinations['public']));
});

gulp.task('clean', function(cb) {
    // You can use multiple globbing patterns as you would with `gulp.src`
    return del(['public'], cb);
});

// version data in multiple files 
gulp.task('version', function () {
 
  return gulp.src([ './version.json' ])
    .pipe(jsonModify({
        key: 'version',
        value: new Date().getTime()
    }))
    .pipe(gulp.dest('./'))
});

gulp.task('move-public', ['clean', 'version'], function(e){

    gulp.src('api/**/*.*').pipe(gulp.dest(destinations['public'] + '/api'));
    gulp.src('app/**/' + source.js.html).pipe(gulp.dest(destinations['public'] + '/app'));

    // 處理主要的js檔
    gulp.src('build/**/*.*')
        .pipe(ngAnnotate())
        .pipe(stripDebug())
        .pipe(uglify())
        .pipe(gulp.dest(destinations['public'] + '/build'));
        
    gulp.src('sound/**/*.*').pipe(gulp.dest(destinations['public'] + '/sound'));
    gulp.src('styles/**/*.*').pipe(gulp.dest(destinations['public'] + '/styles'));

    return gulp.src([
            source.js.tpl,
            source.js.html
        ])
    .pipe(gulpHtmlVersion(version))
    .pipe(gulp.dest(destinations['public']));
});

gulp.task('watch', function(){
    gulp.watch(source.js.src, ['m-js']);
    // gulp.watch(source.js.tpl, ['html']);
    gulp.watch([
            source.js.html,
            'app/**/' + source.js.html,
            'app/' + source.js.tpl
        ], ['m-html']);
    gulpLivereload.listen();
});

gulp.task('connect', function() {
    connect.server({
        port: 8888
    });
});

gulp.task('vendor', function(){
    _.forIn(scripts.chunks, function(chunkScripts, chunkName){
        var paths = [];
        chunkScripts.forEach(function(script){
            var scriptFileName = scripts.paths[script];

            if (!fs.existsSync(__dirname + '/' + scriptFileName)) {

                throw console.error('Required path doesn\'t exist: ' + __dirname + '/' + scriptFileName, script)
            }
            paths.push(scriptFileName);
        });
        gulp.src(paths)
            .pipe(concat(chunkName + '.js'))
            //.on('error', swallowError)
            .pipe(gulp.dest(destinations.js))
    })

});

gulp.task('prod', ['vendor', 'build']);
// gulp.task('dev', ['vendor', 'js', 'watch', 'connect']);
gulp.task('public', ['move-public']);
gulp.task('dev', ['vendor', 'js', 'm-html', 'm-js', 'watch']);
gulp.task('default', ['dev']);

var swallowError = function(error){
    console.log(error.toString());
    this.emit('end')
};

var getTemplateStream = function () {
    return gulp.src(source.js.tpl)
        .pipe(templateCache({
            root: 'app/',
            module: 'app'
        }))
};