module.exports = {
  presets: [['@babel/preset-env', {targets: {node: 'current'}}]],
  plugins: [
    ['@babel/plugin-transform-modules-commonjs'],
    ['@babel/plugin-proposal-decorators', {'legacy': true}],
    ['@babel/plugin-proposal-class-properties']
  ]
};