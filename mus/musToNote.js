#!/usr/bin/env node

var musParser = require(__dirname + '/lib/mus-parser');
var musCompiler = require(__dirname + '/lib/mus-compiler');
var fs = require('fs');

var mus = fs.readFileSync(process.argv.slice(2)[0], 'utf-8');
var ast = musParser.parse(mus);
var notes = musCompiler.compileToNote(ast);

console.log(mus);
console.log(ast);
console.log(notes);
