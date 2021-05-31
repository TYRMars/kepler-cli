#!/usr/bin/env node

import * as fs from 'fs';
const path = require('path');
const ora = require('ora');
const inquirer = require('inquirer');
const download = require('download-git-repo');
const chalk = require('chalk');
const { getRootPath } = require('./util');

import {
  renderView,
  setFileName,
} from './util'

const defaultName = 'kepler-project'
const tplList = JSON.parse(fs.readFileSync(`${path.join(getRootPath())}/templates.json`, 'utf-8'));
const tplLists = Object.keys(tplList) || [];
const question = [
  {
    type: 'input',
    name: 'name',
    message: 'Project name',
    default: defaultName,
    filter(val) {
      return val.trim()
    },
    validate(val) {
      const validate = (val.trim().split(' ')).length === 1
      return validate || 'Project name is not allowed to have spaces ';
    },
    transformer(val) {
      return val;
    }
  }, {
    type: 'list',
    name: 'template',
    message: 'Project template',
    choices: tplLists,
    default: tplLists[0],
    validate(val) {
      return true;
    },
    transformer(val) {
      return val;
    }
  }, {
    type: 'input',
    name: 'description',
    message: 'Project description',
    default: 'React project',
    validate(val) {
      return true;
    },
    transformer(val) {
      return val;
    }
  }, {
    type: 'input',
    name: 'author',
    message: 'Author',
    default: 'project author',
    validate(val) {
      return true;
    },
    transformer(val) {
      return val;
    }
  }
]

/**
 * generation directory
 * @param dir directory
 * @param projectName project name
 */
export function dir() {
  inquirer.prompt(question).then(({ name, template, description, author }) => {
    const projectName = name;
    const templateName = template;
    const gitPlace = tplList[templateName]['place'];
    const gitBranch = tplList[templateName]['branch'];
    const spinner = ora('下载中，请稍后...');
    spinner.start();
    download("", (err) => {
      if (err) {
        console.log(chalk.red(err))
        process.exit()
      }
      fs.readFile(`./${projectName}/package.json`, 'utf8', function (err, data) {
        if (err) {
          spinner.stop();
          console.error(err);
          return;
        }
        const packageJson = JSON.parse(data);
        packageJson.name = name;
        packageJson.description = description;
        packageJson.author = author;
        var updatePackageJson = JSON.stringify(packageJson, null, 2);
        fs.writeFile(`./${projectName}/package.json`, updatePackageJson, 'utf8', function (err) {
          if (err) {
            spinner.stop();
            console.error(err);
            return;
          } else {
            spinner.stop();
            console.log(chalk.green('项目加载完成!'))
            console.log(`
              ${chalk.bgWhite.black('   运行项目  ')}
              ${chalk.yellow(`cd ${name}`)}
              ${chalk.yellow('npm install')}
              ${chalk.yellow('npm start')}
            `);
          }
        });
      });
    })
  })
}


export async function viewTemplate(name: string) {
  const viewsPath = process.cwd() + '/src/component';
  let filename = name && name.split('.')[0];
  if (!fs.existsSync(viewsPath)) {
    const { views } = await inquirer.prompt({
      name: 'views',
      type: 'confirm',
      message: 'Target directory hasn\'t exist, mkdir one',
    });
    if (views) {
      fs.mkdirSync(viewsPath);
      filename && renderView(filename, viewsPath);
    } else {
      process.exit();
    }
  } else {
    !name && await setFileName();
    filename = global['filename'] || name;
    const exist = fs.existsSync(`${viewsPath}/${filename}.js`)
    if (exist) {
      console.log(chalk.red('the file has exist, please input another one'));
      return false;
    }
    renderView(filename, viewsPath);
  }
}