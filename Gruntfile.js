module.exports = function (grunt) {
  var path = require('path');
  var config = {
    copy: {
      moment: {
        files: [
          {
            expand: true,
            flatten: false,
            nonull: true,
            src: 'vendor/moment/moment.js',
            dest: './',
            rename: function (dest, src) {
              return src + '.bak';
            },
            filter: function (filepath) {
              return !grunt.file.exists(filepath + '.bak');
            }
          }
        ]
      }
    },
    concat: {
      moment: {
        nonull: true,
        src: ['node_modules/jquery/dist/jquery.js', 'vendor/moment/moment.js.bak', 'vendor/fullcalendar/dist/fullcalendar.js', 'xpcalendar.js'],
        dest: './vendor/moment/moment.js',
        options: {
          banner: '(function(){\
          if(typeof module !== "undefined") { \
            var window = require("jsdom").jsdom("<html><body></body></html>").parentWindow; \
            jQuery = require("jquery")(window); \
            moment = require("moment"); \
          }',
          footer: '}()); if(typeof module === "undefined") window.moment = window.instant;'
        }
      }
    }
  };

  grunt.registerTask('testMoment', function () {
    this.requires('copy:moment');
    this.requires('concat:moment');

    var done = this.async();
    grunt.util.spawn({
      grunt: true,
      args: ['test'],
      opts: {
        cwd: path.resolve('vendor/moment'),
        stdio: 'inherit'
      }
    }, function (err, result, code) {
      done();
    });
  });

  grunt.registerTask('testFullcalendar', function () {
    this.requires('copy:fullcalendar');

    var done = this.async();
    grunt.util.spawn({
      grunt: true,
      args: ['karma:single', '--forced'],
      opts: {
        cwd: path.resolve('vendor/fullcalendar'),
        stdio: 'inherit'
      }
    }, function (err, result, code) {
      done();
    });
  });

  grunt.initConfig(config);
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-concat');

  grunt.registerTask('default', ['test']);
  grunt.registerTask('test', ['test:moment', 'test:fullcalendar']);
  grunt.registerTask('test:moment', ['copy:moment', 'concat:moment', 'testMoment']);
  grunt.registerTask('test:fullcalendar', ['copy:moment', 'testFullcalendar']);
};
