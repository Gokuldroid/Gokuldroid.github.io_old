module.exports=function (grunt) {
	grunt.initConfig({
		pkg:grunt.file.readJSON('package.json'),
		sass: {
			options:{
				sourcemap:'none',
				style:'compressed',
				update:true
			},
		    dist: {
		      files: [{
		        expand: true,
		        cwd: 'scss',
		        src: ['*.scss'],
		        dest: 'css',
		        ext: '.min.css'
		      }]
		    }
		 },
		 watch: {
		   css: {
		     files: '**/*.scss',
		     tasks: ['sass']
		   }
		}
	});

	//grunt cssmin
	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.registerTask('default',['cssmin','uglify']);
}