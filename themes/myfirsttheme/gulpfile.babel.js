import gulp from 'gulp'
import yargs from 'yargs'
import cleanCSS from 'gulp-clean-css'
import gulpif from 'gulp-if'
import imagemin from 'gulp-imagemin'
import del from 'del'
import webpack from 'webpack-stream'
import uglify from 'gulp-uglify'
import named from 'vinyl-named'
import gulpSass from "gulp-sass";
import nodeSass from "node-sass";
import browserSync from 'browser-sync'
import sourcemaps from "gulp-sourcemaps"
import zip from 'gulp-zip'


const server = browserSync.create();
const sass = gulpSass(nodeSass);
const PRODUCTION = yargs.argv.prod;
const DEVELOPMENT = yargs.argv.dev;

const paths = {
    styles: {
        src: ['src/assets/scss/bundle.scss', 'src/assets/scss/admin.scss'],
        dest: 'dist/assets/css'
    },

    images: {
        src: 'src/assets/images/**/*.{jpg,jpeg,png,svg,gif}',
        dest: 'dist/assets/images'
    },
    scripts: {
        src: ['src/assets/js/bundle.js', 'src/assets/js/admin.js'],
        dest: 'dist/assets/js'
    },

    other: {
        src: ['src/assets/**/*', '!src/assets/{images,js,scss}', '!src/assets/{images,js,scss}/**/*'],
        dest: 'dist/assets'
    },

    package:{
        src: [
                '**/*', '!External Libraries',
                '!.vscode', '!node_modules{,/**}',
                '!packaged{,/**}', '!src{,/**}',
                '!.babelrc', '!.gitignore',
                '!.gulpfile.babel.js', '!package.json',
                '!package-lock.json'
            ],
        dest: 'packaged'
    }
}



/*TASKS BEGIN*/

export const serve = (done) => {
    server.init({
        proxy: "myfirsttheme.local"
    });
    done();
}

export const reload = (done) => {
    server.reload();
    done();
}

export const clean = () => del(['dist']);

export const styles = () => {
    return gulp.src(paths.styles.src)
        .pipe(gulpif(!PRODUCTION, sourcemaps.init()))
        .pipe(sass().on('error', sass.logError))
        .pipe(gulpif(PRODUCTION, cleanCSS({compatibility: 'ie8'})))
        .pipe(gulpif(!PRODUCTION, sourcemaps.write()))
        .pipe(gulp.dest(paths.styles.dest))
        .pipe(server.stream()) //Automatically update stylesheet changes on the browser without refrshing

}

export const images = () => {
    return gulp.src(paths.images.src)
        .pipe(gulpif(PRODUCTION, imagemin()))
        .pipe(gulp.dest(paths.images.dest))
}

export const scripts = () => {
    return gulp.src(paths.scripts.src)
        .pipe(named())
        .pipe(webpack({
            mode: 'production',
            module: {
                rules: [
                    {
                        test: /\.js$/,
                        use: {
                            loader: 'babel-loader',
                            options: {
                                presets: ['@babel/preset-env']
                            }
                        }
                    }
                ]
            },
            output: {
                filename: '[name].js'
            },
            devtool: !PRODUCTION ? 'inline-source-map' : false
        }))
        .pipe(gulpif(PRODUCTION, uglify()))
        .pipe(gulp.dest(paths.scripts.dest))
}

/* TASK => Copy any other directory or file included in the src folder to the dist folder e.g fontawesome dir or file.txt*/
export const copy = () => {
    return gulp.src(paths.other.src)
        .pipe(gulp.dest(paths.other.dest))
}


export const watch = () => {
    gulp.watch('src/assets/scss/**/*.scss', styles);
    gulp.watch('src/assets/js/**/*.js', gulp.series(scripts, reload));
    gulp.watch('**/*.php', reload)
    gulp.watch(paths.images.src, gulp.series(images, reload));
    gulp.watch(paths.other.src, gulp.series(copy, reload));
}

export const compress = () => {
    return gulp.src(paths.package.src)
        .pipe(zip('firsttheme.zip'))
        .pipe(gulp.dest(paths.package.dest))
}
export const dev = gulp.series(clean, gulp.parallel(styles, scripts, images, copy),  serve, watch);
export const build = gulp.series(clean, gulp.parallel(styles, scripts, images, copy));


export default dev;

/*TASKS END*/