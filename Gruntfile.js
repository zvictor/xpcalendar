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
          },
          {
            expand: true,
            flatten: false,
            nonull: true,
            src: 'xpcalendar.js',
            dest: './vendor/moment/',
            rename: function (dest, src) {
              return dest + 'moment.js';
            }
          }
        ]
      }
    }
  };

  grunt.registerTask('testMoment', function () {
    this.requires('copy:moment');

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

  grunt.registerTask('default', ['test']);
  grunt.registerTask('test', ['test:moment', 'test:fullcalendar']);
  grunt.registerTask('test:moment', ['copy:moment', 'testMoment']);
  grunt.registerTask('test:fullcalendar', ['copy:moment', 'testFullcalendar']);
};
