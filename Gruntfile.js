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
          'bower_components/moment/moment.js',
          'bower_components/jquery/dist/jquery.js',
          'bower_components/fullcalendar/dist/fullcalendar.js',
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
          'test/**/*.js'
        ],
        tasks: ['test']
      }
    }
  });

  // These plugins provide necessary tasks.
  require('load-grunt-tasks')(grunt);

  // Default task.
  grunt.registerTask('default', ['test']);

  // test tasks
  grunt.registerTask('test', ['test:browser']);
  grunt.registerTask('test:server', ['concat', 'karma:server']);
  grunt.registerTask('test:browser', ['concat', 'karma:chrome', 'karma:firefox']);
};
