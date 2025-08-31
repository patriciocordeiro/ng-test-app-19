// This file is required by karma.conf.js and loads recursively all the .spec and framework files

import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';
import 'zone.js/testing';

// First, initialize the Angular testing environment.
getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());

// Silent mode: Suppress console.error during tests to avoid error logging noise
const originalConsoleError = console.error;
console.error = (...args: unknown[]) => {
  // Only suppress API Error logs from our handleHttpError utility
  if (args[0] === 'API Error:') {
    return;
  }
  // Allow other console.error calls to go through
  originalConsoleError.apply(console, args);
};
