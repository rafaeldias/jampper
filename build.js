({
  baseUrl: 'src',
  skipModuleInsertion: true,
  paths: {
    jquery: '../node_modules/jquery/src',
    sizzle: '../node_modules/jquery/src/sizzle/dist/sizzle',
  },
  name: 'jampper',
  optmize : false,
  //include: ["jampper"],
  //exclude: ['jquery/ajax', 'jquery/ajax/xhr'],
  wrap: {
    startFile: 'src/start.js',
    endFile: 'src/end.js'
  },
  preserveLisenceComments: false,
  out: "dist/jampper.js",
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
})
