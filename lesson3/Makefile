test: node_modules
	@./node_modules/.bin/mocha tests.js -R spec

node_modules:
	npm install mocha should pegjs

.DEFAULT: test
