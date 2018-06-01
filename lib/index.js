#!/usr/bin/env node

const path = require('path');
const program = require('commander');
const chalk = require('chalk');
const logger = require('./logger');
const fs = require('./utils/fileHelpers');
const {
  createComponentContainerFile,
  createReactComponent,
  createReactFunctionalComponent,
  createReactNativeComponent,
  createIndex,
  createTest,
} = require('./data/componentData');
const stringHelper = require('./utils/stringHelper');
const { getComponentName, getComponentParentFolder } = require('./utils/componentsHelpers.js');
const removeOptionsFromArgs = require('./utils/removeOptionsFromArgs');
const validateArguments = require('./utils/validateArguments');

// Root directorys
const ROOT_DIR = process.cwd();

// Grab provided args
let [, , ...args] = process.argv;

// Set command line interface options for cli
program
  .version('0.1.0')
  .option('--withcontainer', 'Creates a Container File for the Component')
  .option('--notest', 'No test file')
  .option('--reactnative', 'Creates React Native components')
  .option('--createindex', 'Creates index.js file for multple component imports')
  .option('-f, --functional', 'Creates React stateless functional component')
  .option('-u, --uppercase', 'Component files start on uppercase letter')
  .parse(process.argv);

// Remove Node process args options
args = removeOptionsFromArgs(args);

/**
 * Creates container files
 */
function createContainerFiles(componentName, componentPath, fullContainerPath) {
  const importPath = `../../${componentPath.slice(componentPath.indexOf('components'))}`;

  // Create Container File
  logger.log(importPath);
  const data = createComponentContainerFile(componentName, `${importPath}/${componentName}`);

  return fs.writeFileAsync(`${fullContainerPath}.js`, data);
}

/**
 * Creates test files for react-shared
 * @param {String} componentName - Component name
 * @param {String} componentPath - File system path to component
*/
function createTestFiles(componentName, componentPath) {
  return new Promise((resolve) => {
    // Directories
    const testDirectory = '__tests__';
    // File extension
    let name = componentName;
    const webExt = 'jsx';
    const nativeExt = 'native.js';

    // Test files
    const testExt = 'test';
    const testFileNameWeb = `${name}.${testExt}.${webExt}`;
    const testFileNameNative = `${name}.${testExt}.${nativeExt}`;

    // file names to create
    const files = [testFileNameWeb, testFileNameNative];

    // Auto Capitalize
    name = stringHelper.capitalizeFirstLetter(name);

    for (let i = 0; i < files.length; i += 1) {
      if (i !== 0) {
        files.splice(i, 1, stringHelper.capitalizeFirstLetter(files[i]));
      }
    }

    // Create component folder
    const componentTestDirPath = `${componentPath}/${testDirectory}`;
    fs
      .createDirectorys(componentTestDirPath)
      .then(() => {
        const promises = [];

        for (let i = 0; i < files.length; i += 1) {
          const file = files[i];
          const filePath = path.join(componentTestDirPath, file);

          const data = createTest(name, program.uppercase);
          promises.push(fs.writeFileAsync(filePath, data));
        }

        Promise.all(promises).then(() => resolve({ dir: testDirectory, files }));
      })
      .catch((e) => {
        console.log(e);
        throw new Error('Error creating test files');
      });
  });
}

/**
 * Creates files for react-shared
 * @param {String} componentName - Component name
 * @param {String} componentPath - File system path to component
*/
function createFiles(componentName, componentPath) {
  return new Promise((resolve) => {
    // File extension
    let name = componentName;
    const indexFile = `${name}.js`;
    const webExt = 'jsx';
    const nativeExt = 'native.js';
    const sharedName = 'Render';
    const componentFileNameWeb = `${sharedName}.${webExt}`;
    const componentFileNameNative = `${sharedName}.${nativeExt}`;

    // file names to create
    const files = [indexFile, componentFileNameWeb, componentFileNameNative];

    // Auto Capitalize
    name = stringHelper.capitalizeFirstLetter(name);

    for (let i = 0; i < files.length; i += 1) {
      if (i !== 0) {
        files.splice(i, 1, stringHelper.capitalizeFirstLetter(files[i]));
      }
    }

    // Create component folder
    fs
      .createDirectorys(componentPath)
      .then(() => {
        const promises = [];

        for (let i = 0; i < files.length; i += 1) {
          const file = files[i];
          const filePath = path.join(componentPath, file);
          let data = '';

          if (file === indexFile) {
            // Create Index File
            data = createIndex(name, sharedName, program.uppercase);
            promises.push(fs.writeFileAsync(filePath, data));
          } else if (file === `${sharedName}.${webExt}`) {
            // Create Web File
            if (program.functional) {
              data = createReactFunctionalComponent(sharedName);
            } else {
              data = createReactComponent(sharedName);
            }
            promises.push(fs.writeFileAsync(filePath, data));
          } else if (file === `${sharedName}.${nativeExt}`) {
            // Create React Native File
            data = createReactNativeComponent(sharedName);
            promises.push(fs.writeFileAsync(filePath, data));
          }
        }

        Promise.all(promises).then(() => resolve(files));
      })
      .catch((e) => {
        console.log(e);
        throw new Error('Error creating files');
      });
  });
}

/**
 * Initializes create react component
 */
function initialize() {
  // Start timer
  /* eslint-disable no-console */
  console.time('✨  Finished in');
  const promises = [];
  // Set component name, path and full path
  const relativePath = args[0];
  const componentPath = path.join(ROOT_DIR, relativePath);
  const folderPath = getComponentParentFolder(componentPath);

  const isValidArgs = validateArguments(args, program);

  if (!isValidArgs) {
    return;
  }

  fs
    .existsSyncAsync(componentPath)
    .then(() => {
      logger.animateStart('Creating components files...');

      for (let i = 0; i < args.length; i += 1) {
        const name = getComponentName(args[i]);
        promises.push(createFiles(name, folderPath + name));
        promises.push(createTestFiles(name, folderPath + name));
        if (program.withcontainer) {
          const componentPathRelative = relativePath;
          const fullFilePath = folderPath.replace('components', 'containers');
          promises.push(createContainerFiles(name, componentPathRelative, fullFilePath + name));
        }
      }

      return Promise.all(promises);
    })
    .then(() => {
      logger.log(chalk.cyan(`Created new React components at: ${args[0]}`));
      // Stop animating in console
      logger.animateStop();
      // Stop timer
      console.timeEnd('✨  Finished in');
      // Log output to console
      logger.done('Success!');
    })
    .catch((error) => {
      if (error.message === 'false') {
        logger.error(`Folder already exists at ..${componentPath}`);
        return;
      }

      logger.error(error);
    });
}

// Start script
initialize();
