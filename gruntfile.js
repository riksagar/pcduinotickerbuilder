module.exports = function(grunt){

    grunt.initConfig({
        browserify: {
            release:{
                files:{
                    "./dist/bundle.all.js": ["main.js"]
                },
                options:{
                    browserifyOptions:{
                        standalone: "Main"
                    }
                }
            }
        }
    });



    grunt.loadNpmTasks("grunt-browserify");

    grunt.registerTask("default", ["browserify"]);
};