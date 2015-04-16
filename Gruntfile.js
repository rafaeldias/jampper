module.exports = function (grunt) {
  "use strict";
  
  grunt.initConfig({
    pkg : grunt.file.readJSON('package.json'),
    uglify: {
      options : {
        banner : '/*! <%= pkg.name %> v<%= pkg.version %> (c) <%= pkg.author %> 2015 | <%= pkg.license %> license */\n'
      },
      build : {
        src : "src/<%= pkg.name %>.js",
        dest : "dist/<%= pkg.name %>.min.js"
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('default', ['uglify']);
};
