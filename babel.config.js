module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        exclude: ['babel-plugin-transform-exponentiation-operator'],
      },
    ],
  ],
  plugins: [
    ['@babel/transform-runtime'],
  ],
};
