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

let build = () => {
    return es.merge(gulp.src(source.js.src) , getTemplateStream())
        .pipe(ngAnnotate())
        .pipe(uglify())
        .pipe(concat('app.js'))
        .pipe(gulp.dest(destinations.js));
}
gulp.task(build);

let js = () => {
    return es.merge(gulp.src(source.js.src) , getTemplateStream())
        .pipe(concat('app.js'))
        .pipe(gulp.dest(destinations.js));
}
gulp.task(js);

let moveJsFile = () => {
    return gulp.src(destinations.js + '/*.js')
        .pipe(gulp.dest(destinations['public'] + '/' + destinations.js));
}
// gulp.task('mJs', gulp.series(
//     js, 
//     moveJsFile
// ));
// gulp.task('mJs', ['js'], function(){
//     return gulp.src(destinations.js + '/*.js')
//         .pipe(gulp.dest(destinations['public'] + '/' + destinations.js));
// });

let mHtml = () => {
    gulp.src([
        'app/**/' + source.js.html,
        'app/' + source.js.tpl
    ]).pipe(gulp.dest(destinations['public'] + '/app'));

    return gulp.src([
                source.js.html
            ])
            .pipe(gulp.dest(destinations['public']));
}
gulp.task(mHtml);

let clean = (cb) => {
    // You can use multiple globbing patterns as you would with `gulp.src`
    return del(['public'], cb);
}
gulp.task(clean);


let runVersion = () => {
 
    return gulp.src([ './version.json' ])
        .pipe(jsonModify({
            key: 'version',
            value: new Date().getTime()
        }))
        .pipe(gulp.dest('./'))
}
// version data in multiple files 
gulp.task(runVersion);

let moveAllFile = (e) => {
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
}
// gulp.task('movePublic', gulp.series(
//     clean,
//     runVersion, 
//     moveAllFile
// ));
// gulp.task('movePublic', ['clean', 'version'], function(e){

//     gulp.src('api/**/*.*').pipe(gulp.dest(destinations['public'] + '/api'));
//     gulp.src('app/**/' + source.js.html).pipe(gulp.dest(destinations['public'] + '/app'));

//     // 處理主要的js檔
//     gulp.src('build/**/*.*')
//         .pipe(ngAnnotate())
//         .pipe(stripDebug())
//         .pipe(uglify())
//         .pipe(gulp.dest(destinations['public'] + '/build'));
        
//     gulp.src('sound/**/*.*').pipe(gulp.dest(destinations['public'] + '/sound'));
//     gulp.src('styles/**/*.*').pipe(gulp.dest(destinations['public'] + '/styles'));

//     return gulp.src([
//             source.js.tpl,
//             source.js.html
//         ])
//     .pipe(gulpHtmlVersion(version))
//     .pipe(gulp.dest(destinations['public']));
// });

let watch = () => {
    gulp.watch(source.js.src, gulp.series(
        js, 
        moveJsFile
    ));
    // gulp.watch(source.js.tpl, ['html']);
    gulp.watch([
            source.js.html,
            'app/**/' + source.js.html,
            'app/' + source.js.tpl
        ], gulp.series(mHtml));
    gulpLivereload.listen();
}
gulp.task(watch);

let runConnect = () => {
    connect.server({
        port: 8888
    });
}
gulp.task(runConnect);

let vendor = (done) => {
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
    done();
}
gulp.task(vendor);

gulp.task('public', gulp.series(
        clean,
        runVersion, 
        moveAllFile 
    )
)
gulp.task('default', gulp.series(
        vendor,
        js,
        mHtml,
        // gulp.series(
        //     js, 
        //     moveJsFile
        // ),
        moveJsFile,
        watch
    )
)

// gulp.task('prod', ['vendor', 'build']);
// // gulp.task('dev', ['vendor', 'js', 'watch', 'connect']);
// gulp.task('public', ['movePublic']);
// gulp.task('dev', ['vendor', 'js', 'mHtml', 'mJs', 'watch']);
// gulp.task('default', ['dev']);

let swallowError = (error) => {
    console.log(error.toString());
    this.emit('end')
};

let getTemplateStream = () => {
    return gulp.src(source.js.tpl)
        .pipe(templateCache({
            root: 'app/',
            module: 'app'
        }))
};