#!/usr/bin/env node

/**
 * Deployment Validation Script
 * Validates all required environment variables and configurations
 */

const fs = require('fs');
const path = require('path');

// Color codes for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  header: (msg) => console.log(`\n${colors.bold}${colors.blue}${msg}${colors.reset}`)
};

// Validation tests
const tests = [
  {
    name: 'OpenAI API Key',
    test: () => process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.startsWith('sk-'),
    required: true
  },
  {
    name: 'Fine-tuned Model ID',
    test: () => process.env.FINE_TUNED_MODEL_ID && process.env.FINE_TUNED_MODEL_ID.startsWith('ft:'),
    required: true
  },
  {
    name: 'Database URL',
    test: () => process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgresql://'),
    required: false
  },
  {
    name: 'JWT Secret',
    test: () => process.env.JWT_SECRET && process.env.JWT_SECRET.length >= 32,
    required: true
  },
  {
    name: 'Node Environment',
    test: () => process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'development',
    required: true
  },
  {
    name: 'Reddit Client ID',
    test: () => process.env.REDDIT_CLIENT_ID && process.env.REDDIT_CLIENT_ID.length > 0,
    required: false
  },
  {
    name: 'Reddit Client Secret',
    test: () => process.env.REDDIT_CLIENT_SECRET && process.env.REDDIT_CLIENT_SECRET.length > 0,
    required: false
  }
];

// File existence tests
const fileTests = [
  {
    name: 'package.json',
    path: './package.json',
    required: true
  },
  {
    name: 'vercel.json',
    path: './vercel.json',
    required: true
  },
  {
    name: 'tsconfig.json',
    path: './tsconfig.json',
    required: true
  },
  {
    name: 'Prisma Schema',
    path: './prisma/schema.prisma',
    required: true
  },
  {
    name: 'API Chat Endpoint',
    path: './api/chat.js',
    required: true
  }
];

// Build configuration tests
const buildTests = [
  {
    name: 'Build Script',
    test: () => {
      const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
      return pkg.scripts && pkg.scripts.build;
    }
  },
  {
    name: 'Engines Configuration',
    test: () => {
      const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
      return pkg.engines && pkg.engines.node;
    }
  },
  {
    name: 'ESLint Configuration',
    test: () => {
      const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
      return pkg.eslintConfig;
    }
  }
];

function runTests() {
  log.header('🔍 HOWPARTH Deployment Validation');
  
  let passed = 0;
  let failed = 0;
  let warnings = 0;

  // Environment Variables
  log.header('Environment Variables');
  tests.forEach(test => {
    try {
      if (test.test()) {
        log.success(test.name);
        passed++;
      } else {
        if (test.required) {
          log.error(`${test.name} - ${test.required ? 'REQUIRED' : 'OPTIONAL'}`);
          failed++;
        } else {
          log.warning(`${test.name} - Optional (not set)`);
          warnings++;
        }
      }
    } catch (error) {
      log.error(`${test.name} - Error: ${error.message}`);
      failed++;
    }
  });

  // File Existence
  log.header('File Structure');
  fileTests.forEach(test => {
    try {
      if (fs.existsSync(test.path)) {
        log.success(test.name);
        passed++;
      } else {
        if (test.required) {
          log.error(`${test.name} - Missing required file`);
          failed++;
        } else {
          log.warning(`${test.name} - Optional file missing`);
          warnings++;
        }
      }
    } catch (error) {
      log.error(`${test.name} - Error: ${error.message}`);
      failed++;
    }
  });

  // Build Configuration
  log.header('Build Configuration');
  buildTests.forEach(test => {
    try {
      if (test.test()) {
        log.success(test.name);
        passed++;
      } else {
        log.warning(`${test.name} - Not configured`);
        warnings++;
      }
    } catch (error) {
      log.error(`${test.name} - Error: ${error.message}`);
      failed++;
    }
  });

  // Summary
  log.header('Validation Summary');
  console.log(`${colors.green}Passed: ${passed}${colors.reset}`);
  console.log(`${colors.yellow}Warnings: ${warnings}${colors.reset}`);
  console.log(`${colors.red}Failed: ${failed}${colors.reset}`);

  if (failed === 0) {
    log.success('🎉 All critical validations passed! Ready for deployment.');
    process.exit(0);
  } else {
    log.error('❌ Critical validations failed. Please fix the issues above before deploying.');
    process.exit(1);
  }
}

// Additional checks
function checkBuildReadiness() {
  log.header('Build Readiness Check');
  
  try {
    // Check if build directory exists and is clean
    if (fs.existsSync('./build')) {
      log.info('Build directory exists - will be overwritten');
    }
    
    // Check package-lock.json
    if (fs.existsSync('./package-lock.json')) {
      log.success('package-lock.json exists');
    } else {
      log.warning('package-lock.json missing - run npm install');
    }
    
    // Check for common issues
    const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
    
    if (pkg.dependencies && Object.keys(pkg.dependencies).length > 0) {
      log.success('Dependencies configured');
    } else {
      log.error('No dependencies found');
    }
    
  } catch (error) {
    log.error(`Build readiness check failed: ${error.message}`);
  }
}

// Run all validations
if (require.main === module) {
  runTests();
  checkBuildReadiness();
}

module.exports = { runTests, checkBuildReadiness };
