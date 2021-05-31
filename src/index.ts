#!/usr/bin/env node
import * as commander from 'commander';
import { release } from './common/util';
import { dir, viewTemplate } from './common/generate';

const version = require('../package.json').version;

commander
  .version(version, '-V, --version')
  .usage('[Options] | [Commands] <file>');

commander
  .command('init')
  .description('生成前端项目')
  .option('dir');

commander
  .command('view')
  .description('生成一个React Component')
  .option('<file>');

commander.on('--help', () => {
  console.log('\n Examples:');
  console.log('');
  console.log('  $ kepler -h');
  console.log('  $ kepler init kepler-demo ');
  console.log('');
});

const help = () => {
  commander.parse(process.argv);
  if (commander.args.length < 1) return commander.help();
}

const argv2 = process.argv[2];
const argv3 = process.argv[3];

// 识别命令
switch (argv2) {
  case 'init':
    dir();
    break;
  case 'init':
    viewTemplate(argv3);
    break;
  default:
    help();
    release().catch(err => {
      console.error(err);
      process.exit();
    });
    break;
}
