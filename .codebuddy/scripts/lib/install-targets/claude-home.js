const { createInstallTargetAdapter } = require('./helpers');

module.exports = createInstallTargetAdapter({
  id: 'claude-home',
  target: 'claude',
  kind: 'home',
  rootSegments: ['.codebuddy'],
  installStatePathSegments: ['ecc', 'install-state.json'],
  nativeRootRelativePath: '.codebuddy-plugin',
});
