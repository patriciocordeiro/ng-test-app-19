module.exports = {
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: true,
  trailingComma: 'all',
  arrowParens: 'avoid',
  endOfLine: 'lf',
  // File patterns for prettier
  overrides: [
    {
      files: '**/*.{ts,js,json,scss,css,html,md}',
      options: {},
    },
  ],
};
