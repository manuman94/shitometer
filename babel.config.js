module.exports = {
  presets: ['@babel/preset-typescript', '@babel/preset-env'],
  plugins: [['@babel/plugin-proposal-decorators', { legacy: true }], ['@babel/transform-runtime']]
};
