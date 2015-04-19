var requirejs = require('requirejs')
  , fs = require('fs')
  , pkg = require('./package.json')
  , isEmbeded = true 
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
      name: pkg.name,
      out: function( compressed ) {
        // Get name of the file.
        var name = dst + pkg.name + (isEmbeded ? '' : '.jquery') + '.js';

        // Check if dest folder exists and creates it if not.
        if ( !fs.existsSync(dst) ) {
          fs.mkdirSync(dst);
          console.log('Dest directory created.');
        }
        
        compressed = compressed
                    // Embed version
                     .replace(/@VERSION/g, pkg.version)
                     // Embed license
                     .replace(/@LICENSE/g, pkg.license);

        fs.writeFile(name, compressed);
      },
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

        // Internally Jampper uses $ as a ref to jQuery.
        contents = contents.replace(/jQuery/g, '$');

        return contents;
      }
    };

// Remove prev build folder
if (unlinkDistFolder(dst)) {
  console.log('Previous build folder removed.');
}

requirejs.optimize(baseConfig, function(response) {
  console.log(response);
  baseConfig.exclude = excludes; 
  isEmbeded = false;

  requirejs.optimize(baseConfig, function(response) {
    console.log(response);
    console.log('lib ' + pkg.name + ' built.');
  }, buildErr);

}, buildErr);
