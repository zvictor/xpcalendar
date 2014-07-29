module.exports = function (grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat : {
      tests: {
        src: [
          'test/browser-prefix.js',
          'test/moment/*.js',
          'test/locale/*.js',
          'test/browser-suffix.js'
        ],
        dest: 'min/tests.js'
      }
    },
    karma : {
      options: {
        frameworks: ['nodeunit'],
        files: [
          'min/moment-with-locales.js',
          'min/tests.js',
          'test/browser.js'
        ]
      },
      server: {
        browsers: []
      },
      chrome: {
        singleRun: true,
        browsers: ['Chrome']
      },
      firefox: {
        singleRun: true,
        browsers: ['Firefox']
      }
    },
    nodeunit : {
      all : ["test/moment/**/*.js", "test/locale/**/*.js"]
    },
    watch : {
      test : {
        files : [
          'xpcalendar.js',
          'locale/*.js',
          'test/**/*.js'
        ],
        tasks: ['nodeunit']
      }
    }
  });

  // These plugins provide necessary tasks.
  require('load-grunt-tasks')(grunt);

  // Default task.
  grunt.registerTask('default', ['nodeunit']);

  // test tasks
  grunt.registerTask('test', ['test:node', 'test:browser']);
  grunt.registerTask('test:node', ['nodeunit']);
  grunt.registerTask('test:server', ['concat', 'embedLocales', 'karma:server']);
  grunt.registerTask('test:browser', ['concat', 'embedLocales', 'karma:chrome', 'karma:firefox']);
};
