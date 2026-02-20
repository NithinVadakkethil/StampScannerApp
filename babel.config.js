module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    process.env.NODE_ENV === 'test' ? null : 'react-native-reanimated/plugin',
    [
      'module-resolver',
      {
        root: ['./src'],
        extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
        alias: {
          '@components': './src/components',
          '@screens': './src/screens',
          '@services': './src/services',
          '@models': './src/models',
          '@navigation': './src/navigation',
          '@hooks': './src/hooks',
          '@utils': './src/utils',
        },
      },
    ],
  ].filter(Boolean),
};
