#!/usr/bin/env node
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
const axios = require('axios');
const semver = require('semver');
const packageConfig = require('../package.json')
const inquirer = require('inquirer');
const chalk = require('chalk');

// 获取项目根目录
export function getRootPath() {
  return path.resolve(__dirname, '../');
}

/**
 * if hasn't projectName ,set one
 */
export async function setProjectName(dir?: string) {
  const { projectName } = await inquirer.prompt({
    name: 'projectName',
    message: '输入项目名'
  });
  global['projectName'] = projectName;
  if (!projectName) {
    console.log(chalk.green('\n please input dir') + '\n');
    await setProjectName();
  } else if (fs.existsSync(projectName)) {
    console.log(chalk.green('\n the dir has exists, please input another one') + '\n');
    await setProjectName();
  } else {
    return projectName;
  }
}

export async function setFileName(dir?: string) {
  const viewsPath = path.resolve(__dirname, '../src/views/');
  let { filename } = await inquirer.prompt({
    name: 'filename',
    message: 'input file name'
  });
  filename = filename.split('.')[0];
  global['filename'] = filename;
  if (!filename) {
    console.log(chalk.green('\n please input dir') + '\n');
    await setFileName();
  } else if (fs.existsSync(`${viewsPath}/${filename}.js`)) {
    console.log(chalk.green('\n the dir has exists, please input another one') + '\n');
    await setFileName();
  } else {
    return filename;
  }
}

/**
 * select mode
 */
export async function mode() {
  return await inquirer.prompt({
    name: 'flag',
    message: '选择模板',
    type: 'list',
    choices: [
      {
        name: 'next-react-base',
        value: 'react-base'
      },
      {
        name: 'next-react-ecms',
        value: 'react-ecms'
      },
    ]
  });
}

/**
 * file directory
 * @param mode
 */
export function type(mode: string) {
  return {
    'react-base': '/template/next-react-base',
    'react-ecms': '/template/next-react-ecms',
  }[mode];
}

/**
 * node version need > 8
 * @param version
 */
export function compareVersion(version: string) {
  return Number(version.split('.')[0].slice(-2)) >= 8;
}

/**
 * render view
 * @param filename
 * @param viewsPath
 */
export function renderView(filename: string, viewsPath: string) {
  const name = filename.slice(0, 1).toUpperCase() + filename.slice(1);
  fs.writeFileSync(
    `${viewsPath}/${filename}.jsx`,
    `import React from 'react'
    export default class ${name} extends React.Component {
      render() {
        return ${name}
      }
    }
    `
  );
  console.log(chalk.green(`${filename}.jsx has been rendered at ${viewsPath}`));
}

// 打印一下Kepler的Logo
export function printKepler() {
  var KeplerText = fs.readFileSync(path.join(getRootPath(), 'kepler.txt'));
  console.log(chalk.blue(String(KeplerText)));
}

export const release = async () => {
  printKepler();
  const nodeVersion = execSync('node -v', { encoding: 'utf8' });
  if (process.argv.length === 2) {
    execSync('kepler -h');
  }
  if (!compareVersion(nodeVersion)) {
    console.log(chalk.red('Please make sure the node version is above 8.0'));
    process.exit();
  }
};

export function checkVersion(done) {
  axios
    .get('https://github.com/TYRMars/kepler-cli', {
      timeout: 5000
    })
    .then((res) => {
      if (res.status === 200) {
        const latestVersion = res.data['dist-tags'].latest
        const localVersion = packageConfig.version
        if (semver.lt(localVersion, latestVersion)) {
          console.log(chalk.yellow('  kepler-cli 有新版本更新建议升级.'))
          console.log()
          console.log('  最新版本: ' + chalk.green(latestVersion))
          console.log('  本地版本: ' + chalk.red(localVersion))
          console.log()
        }
      }
      done()
    })
    .catch(done)
}
