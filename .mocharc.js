'use strict';

// Here's a JavaScript-based config file.
// If you need conditional logic, you might want to use this type of config.
// Otherwise, JSON or YAML is recommended.

module.exports = {
  reporter: 'mocha-sonarqube-reporter',
  quiet: true,
    reporterOptions:{
        output : 'unit-tests.xml', // default to ./xunit.xml
        useFullFilePath: 'true' // default to 'false'. Uses full test file paths in the report.
    },
    src: [
			'test/cartsController.spec.js'
		],
  slow: 75,
  timeout: 2000,
  ui: 'bdd',
  'watch-files': ['lib/**/*.js', 'test/**/*.js'],
  'watch-ignore': ['lib/vendor'],
};