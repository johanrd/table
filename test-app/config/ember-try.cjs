'use strict';

const getChannelURL = require('ember-source-channel-url');

module.exports = async function () {
  let releaseVersion = await getChannelURL('release');
  const ember3Deps = {
    'ember-maybe-import-regenerator': '^1.0.0',
    'ember-qunit': '^5.1.5',
    '@ember/test-waiters': '^2.4.5',
    '@ember/test-helpers': '^2.6.0',
    'ember-resolver': '^8.0.3',
    // Compat Upgrades
    'ember-cli': '~4.12.0',
    'ember-auto-import': '^2.10.0',
    // Not needed
    'ember-fetch': null,
    'ember-cli-app-version': null,
  };

  const ember4Deps = {
    ...ember3Deps,
    '@ember/test-waiters': '^3.0.0',
    '@ember/test-helpers': '^3.0.0',
    'ember-qunit': '^8.0.0',
    'ember-resolver': '^10.0.0',
    // not needed
    'ember-maybe-import-regenerator': null,
    'ember-cli-dependency-checker': null,
  };

  const ember5Deps = {
    ...ember4Deps,
    '@glimmer/component': '^1.1.2',
    '@ember/string': '^3.1.1',
    'ember-resolver': '^11.0.0',
    'ember-template-lint': '^6.0.0',
    'ember-cli': '^5.12.0',
    'qunit-dom': '^3.4.0',
  };

  // const ember6Deps = {
  //   ...ember5Deps,
  //   '@ember/string': '^4.0.0',
  //   '@ember/test-waiters': '^4.0.0',
  //   '@ember/test-helpers': '^4.0.4',
  //   'ember-cli': '^6.1.0',
  //   'ember-load-initializers': '^3.0.1',
  //   'ember-resolver': '^13.1.0',
  //   typescript: '^5.7.0',
  // };

  return {
    usePnpm: true,
    command: 'pnpm test:ember',
    scenarios: [
      {
        name: 'ember-lts-3.28',
        npm: {
          devDependencies: {
            ...ember3Deps,
            'ember-source': '~3.28.0',
          },
        },
      },
      {
        name: 'ember-lts-4.4',
        npm: {
          devDependencies: {
            ...ember4Deps,
            'ember-source': '~4.4.0',
          },
        },
      },
      {
        name: 'ember-lts-4.12',
        npm: {
          devDependencies: {
            ...ember4Deps,
            'ember-source': '~4.12.0',
          },
        },
      },
      {
        name: 'ember-lts-5.4',
        npm: {
          devDependencies: {
            'ember-source': '~5.4.0',
          },
        },
      },
      {
        name: 'ember-lts-5.12',
        npm: {
          devDependencies: {
            ...ember5Deps,
            'ember-source': '~5.12.0',
          },
        },
      },
      {
        name: 'ember-release',
        npm: {
          devDependencies: {
            'ember-source': releaseVersion,
          },
        },
      },
      {
        name: 'ember-beta',
        npm: {
          devDependencies: {
            'ember-source': 'beta',
          },
        },
      },
      {
        name: 'ember-canary',
        npm: {
          devDependencies: {
            'ember-source': 'alpha',
          },
        },
      },
    ],
  };
};
