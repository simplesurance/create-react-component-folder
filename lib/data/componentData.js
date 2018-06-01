const stringHelper = require('../utils/stringHelper');


function createComponentContainerFile(name, importPath) {
  const containerName = `${name}Container`;
  return `import { connect } from 'react-redux'

  import ${name} from '${importPath}'
  
  function mapStateToProps (state) {  
    return {}
  }
  
  const dispatchFunctions = {}
  
  const ${containerName} = connect(mapStateToProps, dispatchFunctions)(${name})
  
  export default ${containerName}
  `;
}

/**
 * Creates default React component
 *
 * @param {String} componentName - Component name
 * @returns {String}
 */
function createReactComponent(componentName) {
  const name = stringHelper.capitalizeFirstLetter(componentName);

  return `import React, { PureComponent } from 'react'

class ${name} extends PureComponent {
  render() {
    return (
      <div>
        ${name}
      </div>
    )
  }
}

${name}.propTypes = {}

export default ${name}
  `;
}

/**
 * Creates React stateless functional component
 *
 * @param {String} componentName - Component name
 * @returns {String}
 */
function createReactFunctionalComponent(componentName) {
  const name = stringHelper.capitalizeFirstLetter(componentName);

  return `import React from 'react'

const ${name} = () => {
  return (
    <div>
      ${name}
    </div>
  )
}

${name}.propTypes = {}

export default ${name}
  `;
}

/**
 * Creates default React Native component
 *
 * @param {String} componentName - Component name
 * @returns {String}
 */
function createReactNativeComponent(componentName) {
  const name = stringHelper.capitalizeFirstLetter(componentName);

  return `import React, { PureComponent } from 'react'
import { View, Text } from 'react-native'

class ${name} extends PureComponent {
  render() {
    return (
      <View>
        <Text>${name}</Text>
      </View>
    )
  }
}

${name}.propTypes = {}

export default ${name}
  `;
}

/**
 * Creates default index file
 *
 * @param {String} componentName - Component name
 * @param {Boolean} upperCase - If true then capitalize first letter
 * @returns {String}
 */
function createIndex(componentName, sharedName) {
  return `
  import React from 'react'
  import { injectIntl } from 'react-intl'
  import ${sharedName} from './${sharedName}'
  
  class ${componentName} extends React.PureComponent {
    render(){
      return <${sharedName} {...this.props} />
    }
  }

  ${componentName}.propTypes = {}

  export default injectIntl(${componentName}, { withRef: true })
  `;
}

/**
 * Creates index file includes all folder
 *
 * @param {Array} folders - folders array
 * @returns {String}
 */
function createIndexForFolders(folders) {
  return `${folders
    .map(folderName => `import ${folderName} from './${folderName}' \n`)
    .join('')}export {
    ${folders.map((folderName, index) => {
    if (index === folders.length - 1) return folderName;

    return `${folderName}, \n`;
  })
    .join('')}
}`;
}

/**
 * Creates default test file for component
 *
 * @param {String} componentName - Component name
 * @param {Boolean} upperCase - If true then capitalize first letter
 * @returns {String}
 */
function createTest(componentName, upperCase) {
  const componentNameUpperCase = stringHelper.capitalizeFirstLetter(componentName);

  return `
import React from 'react'
import {
  createComponentWithProviderAndIntl
} from 'test-utils'
import ${componentNameUpperCase} from '../${
  upperCase === true ? componentNameUpperCase : componentName
}'

describe('<${componentNameUpperCase} />', () => {
  test('renders', () => {
    const tree = createComponentWithProviderAndIntl(<${componentNameUpperCase} />).toJSON()
    expect(tree).toMatchSnapshot()
  })
})
  `;
}

module.exports = {
  createComponentContainerFile,
  createReactComponent,
  createReactFunctionalComponent,
  createReactNativeComponent,
  createIndex,
  createIndexForFolders,
  createTest,
};
