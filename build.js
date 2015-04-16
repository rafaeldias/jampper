var requirejs = require('requirejs')
  , fs = require('fs')
  , pkg = require('./package.json')
  , excludes = ['jquery/ajax', 'jquery/ajax/xhr']
  , buildErr = function(err) {
      console.log(err);
    }
  , dst = 'dist/'
  , unlinkDistFolder = function(path) {
      if (fs.existsSync(path)) {
        fs.readdirSync(path).forEach(function(file, index) {
          var curPath = path + '/' + file;
          if (fs.statSync(curPath).isDirectory()) {
            unlinkDistFolder(curPath);
          } else {
            fs.unlinkSync(curPath);
          }
        });
        fs.rmdirSync(path);
        return true;
      }
      return false;
    }
  , baseConfig = {
      baseUrl: 'src',
      skipModuleInsertion: true,
      preserveLisenceComments: true,
      optimize: 'uglify2',
      stubModules: ['text'],
      paths: {
        jquery: '../node_modules/jquery/src',
        sizzle: '../node_modules/jquery/src/sizzle/dist/sizzle',
      },
      name: 'jampper',
      out: dst + pkg.name + '.jquery.js',
      wrap: {
        startFile: 'src/start.js',
        endFile: 'src/end.js'
      },
      onBuildWrite: function(name, path, contents) {
        var rdefineEnd = /\}\);[^}\w]*$/;
        if ( /.\/var\//.test(path) ) {
          contents = contents
            .replace( /define\([\w\W]*?return/, "var " + (/var\/([\w-]+)/.exec(name)[1]) + " =" )
            .replace( rdefineEnd, "" );

            // Sizzle treatment
        } else if ( /^sizzle$/.test( name ) ) {
          contents = "var Sizzle =\n" + contents
            // Remove EXPOSE lines from Sizzle
            .replace( /\/\/\s*EXPOSE[\w\W]*\/\/\s*EXPOSE/, "return Sizzle;" ); 
        } else {

          contents = contents
            .replace( /\s*return\s+[^\}]+(\}\);[^\w\}]*)$/, "$1" )
            // Multiple exports
            .replace( /\s*exports\.\w+\s*=\s*\w+;/g, "" );

          // Remove define wrappers, closure ends, and empty declarations
          contents = contents
            .replace( /define\([^{]*?{/, "" )
            .replace( rdefineEnd, "" );

          // Remove anything wrapped with
          // /* ExcludeStart */ /* ExcludeEnd */
          // or a single line directly after a // BuildExclude comment
          contents = contents
            .replace( /\/\*\s*ExcludeStart\s*\*\/[\w\W]*?\/\*\s*ExcludeEnd\s*\*\//ig, "" )
            .replace( /\/\/\s*BuildExclude\n\r?[\w\W]*?\n\r?/ig, "" );

          // Remove empty definitions
          contents = contents
            .replace( /define\(\[[^\]]*\]\)[\W\n]+$/, "" );
        }

        return contents;
      }
    };

// Remove prev build folder
if (unlinkDistFolder(dst)) {
  console.log('Previous build folder removed.');
}

requirejs.optimize(baseConfig, function(response) {
  console.log(response);
  console.log('Lib ' + baseConfig.out + ' built.');
  baseConfig.out = dst +  pkg.name + '.js';
  baseConfig.exclude = excludes;

  requirejs.optimize(baseConfig, function(response) {
    console.log(response);
    console.log('lib ' + baseConfig.out + ' built.');
    console.log('\nDone.');
  }, buildErr);

}, buildErr);
