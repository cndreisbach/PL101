/*global module:false*/
module.exports = function(grunt) {
  var fs = require('fs');
  grunt.loadNpmTasks('grunt-css');
  grunt.loadNpmTasks('grunt-exec');
  
  // Project configuration.
  grunt.initConfig({
    exec: {
      mocha: {
        command: "mocha --no-colors",
        stdout: true,
        stderr: true
      }
    },
    cssmin: {
      site: {
        src: ['site/css/bootstrap.css',
              'site/css/codemirror.css',
              'site/css/elegant.css',
              'site/css/app.css'],
        dest: 'site/css/app.min.css'
      }
    },
    concat: {
      site: {
        src: ['site/js/jquery.min.js',
              'site/js/bootstrap.js',
              'site/js/scheem.js',
              'site/js/codemirror.js',
              'site/js/app.js'],
        dest: 'site/js/app.min.js'
      }
    },

    lint: {
      files: ['grunt.js', 'lib/scheem.js']
    },
    watch: {
      files: ['<config:lint.files>', '<config:concat.site.src>', '<config:cssmin.site.src>', 'lib/scheem.pegjs'],
      tasks: 'default'
    },
    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: false,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        boss: true,
        eqnull: true,
        node: true
      },
      globals: {}
    }
  });

  grunt.registerTask('build-parser', 'Build our parser from its PEG file', function() {
    var PEG = require('pegjs');

    var data = fs.readFileSync(__dirname + '/lib/scheem.pegjs', 'utf-8');
    var parser = PEG.buildParser(data, {trackLineAndColumn: true});

    fs.writeFileSync(__dirname + '/lib/scheem-parser.js', "var Scheem = module.exports = {};\n" +
                     "Scheem.parser = " + parser.toSource().replace("this.SyntaxError", "Scheem.parser.SyntaxError") + ";\n");
  });

  grunt.registerTask('browserify', "Build our site using browserify.", function() {
    var browserify = require('browserify');
    var bundle = browserify('browser.js');
    var src = bundle.bundle();
    fs.writeFileSync(__dirname + '/site/js/scheem.js', src);
  });

  grunt.registerTask('test', 'exec:mocha');
  grunt.registerTask('site', 'build-parser browserify concat cssmin');

  // Default task.
  grunt.registerTask('default', 'lint test site');
};
