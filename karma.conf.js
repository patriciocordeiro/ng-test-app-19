module.exports = function (config) {
  config.set({
    customLaunchers: {
      ChromeHeadlessNoSandbox: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox'],
      },
      ChromeHeadlessSilent: {
        base: 'ChromeHeadless',
        flags: [
          '--no-sandbox',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor',
        ],
      },
    },
    // Suppress console output during tests
    client: {
      captureConsole: false,
      clearContext: false,
    },
    // Reduce log level
    logLevel: config.LOG_ERROR,
    // Disable console logs
    browserConsoleLogOptions: {
      level: 'disable',
      format: '%b %T: %m',
      terminal: false,
    },
  });
};
