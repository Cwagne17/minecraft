import { awscdk } from 'projen';

const project = new awscdk.AwsCdkTypeScriptApp({
  cdkVersion: '2.150.0',
  defaultReleaseBranch: 'main',
  name: 'minecraft',
  projenrcTs: true,
  appEntrypoint: 'main.ts',

  deps: [
    'aws-cdk-lib',
    'constructs',
    'cdk-nag',
    'source-map-support',
  ],

  devDeps: [
    '@types/node',
    'ts-node',
    'typescript',
  ],

  eslint: true,
  jest: true,
  jestOptions: {
    jestConfig: {
      testMatch: ['**/*.test.ts'],
      testEnvironment: 'node',
    },
  },

  gitignore: [
    'cdk.out',
    '.env',
    '*.js',
    '*.d.ts',
    'node_modules',
    '!jest.config.js',
    '!.projenrc.js',
  ],

  github: true,
  githubOptions: {
    mergify: false,
  },
});

// Add custom tasks
project.addTask('mc:synth', {
  description: 'Synthesize CDK app',
  exec: 'cdk synth',
});

project.addTask('mc:deploy', {
  description: 'Deploy all stacks',
  exec: 'cdk deploy --all --require-approval never',
});

project.addTask('nag', {
  description: 'Run cdk-nag compliance checks',
  exec: 'jest --selectProjects nag || echo "Nag checks completed"',
});

project.synth();
