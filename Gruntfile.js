module.exports = function(grunt) {

  
  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      bundle: {
          src: ['bower_components/lodash/dist/lodash.js',
				'bower_components/jquery/dist/jquery.js',
				'js/highcharts/highcharts.js', 
				'js/shannon.js',
        'js/Periodic.js'],
        dest: 'bundle.js',
      },
    },
   });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  // Default task(s).
  grunt.registerTask('default', ['uglify']);
  grunt.loadNpmTasks('grunt-contrib-concat');
  // Default task(s).
  grunt.registerTask('default', ['concat']);

};