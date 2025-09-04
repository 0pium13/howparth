#!/usr/bin/env node

const axios = require('axios');
const colors = require('colors');

// Configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';
const TEST_MESSAGES = [
  'Hello! How are you?',
  'Tell me about AI video creation',
  'What are your favorite tools?',
  'Can you help me with prompt engineering?',
  'What\'s the weather like?'
];

class ChatSystemTester {
  constructor() {
    this.results = {
      totalTests: 0,
      passed: 0,
      failed: 0,
      errors: []
    };
  }

  log(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const prefix = `[${timestamp}]`;
    
    switch (type) {
      case 'success':
        console.log(`${prefix} ✅ ${message}`.green);
        break;
      case 'error':
        console.log(`${prefix} ❌ ${message}`.red);
        break;
      case 'warning':
        console.log(`${prefix} ⚠️  ${message}`.yellow);
        break;
      case 'info':
      default:
        console.log(`${prefix} ℹ️  ${message}`.blue);
        break;
    }
  }

  async testHealthCheck() {
    this.log('Testing health check endpoint...');
    try {
      const response = await axios.get(`${BASE_URL}/api/monitoring/health`, {
        timeout: 10000
      });
      
      if (response.status === 200 && response.data.status === 'healthy') {
        this.log('Health check passed', 'success');
        this.results.passed++;
      } else {
        this.log(`Health check failed: ${response.data.status}`, 'error');
        this.results.failed++;
        this.results.errors.push(`Health check: ${response.data.status}`);
      }
    } catch (error) {
      this.log(`Health check error: ${error.message}`, 'error');
      this.results.failed++;
      this.results.errors.push(`Health check: ${error.message}`);
    }
    this.results.totalTests++;
  }

  async testChatEndpoint() {
    this.log('Testing chat endpoint...');
    try {
      const response = await axios.post(`${BASE_URL}/api/chat/`, {
        message: 'Hello, this is a test message',
        userId: 'test-user'
      }, {
        timeout: 30000
      });
      
      if (response.status === 200 && response.data.success) {
        this.log(`Chat test passed - Response: "${response.data.response.substring(0, 50)}..."`, 'success');
        this.results.passed++;
      } else {
        this.log(`Chat test failed: ${response.data.error || 'Unknown error'}`, 'error');
        this.results.failed++;
        this.results.errors.push(`Chat: ${response.data.error || 'Unknown error'}`);
      }
    } catch (error) {
      this.log(`Chat test error: ${error.message}`, 'error');
      this.results.failed++;
      this.results.errors.push(`Chat: ${error.message}`);
    }
    this.results.totalTests++;
  }

  async testStreamingEndpoint() {
    this.log('Testing streaming chat endpoint...');
    try {
      const response = await axios.post(`${BASE_URL}/api/chat/stream`, {
        message: 'Tell me a short joke',
        userId: 'test-user'
      }, {
        timeout: 30000,
        responseType: 'stream'
      });
      
      if (response.status === 200) {
        this.log('Streaming test passed', 'success');
        this.results.passed++;
      } else {
        this.log(`Streaming test failed: ${response.status}`, 'error');
        this.results.failed++;
        this.results.errors.push(`Streaming: HTTP ${response.status}`);
      }
    } catch (error) {
      this.log(`Streaming test error: ${error.message}`, 'error');
      this.results.failed++;
      this.results.errors.push(`Streaming: ${error.message}`);
    }
    this.results.totalTests++;
  }

  async testMonitoringEndpoints() {
    this.log('Testing monitoring endpoints...');
    
    const endpoints = [
      { path: '/api/monitoring/status', name: 'Status' },
      { path: '/api/monitoring/metrics', name: 'Metrics' },
      { path: '/api/monitoring/errors', name: 'Errors' }
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await axios.get(`${BASE_URL}${endpoint.path}`, {
          timeout: 10000
        });
        
        if (response.status === 200) {
          this.log(`${endpoint.name} endpoint working`, 'success');
          this.results.passed++;
        } else {
          this.log(`${endpoint.name} endpoint failed: ${response.status}`, 'error');
          this.results.failed++;
          this.results.errors.push(`${endpoint.name}: HTTP ${response.status}`);
        }
      } catch (error) {
        this.log(`${endpoint.name} endpoint error: ${error.message}`, 'error');
        this.results.failed++;
        this.results.errors.push(`${endpoint.name}: ${error.message}`);
      }
      this.results.totalTests++;
    }
  }

  async testConcurrentRequests() {
    this.log('Testing concurrent requests...');
    
    try {
      const promises = TEST_MESSAGES.map((message, index) => 
        axios.post(`${BASE_URL}/api/chat/`, {
          message,
          userId: `test-user-${index}`
        }, {
          timeout: 30000
        })
      );

      const responses = await Promise.allSettled(promises);
      const successful = responses.filter(r => r.status === 'fulfilled' && r.value.status === 200).length;
      const failed = responses.length - successful;

      if (successful > 0) {
        this.log(`Concurrent test: ${successful}/${responses.length} requests successful`, 'success');
        this.results.passed++;
      } else {
        this.log('Concurrent test: All requests failed', 'error');
        this.results.failed++;
        this.results.errors.push('Concurrent: All requests failed');
      }
    } catch (error) {
      this.log(`Concurrent test error: ${error.message}`, 'error');
      this.results.failed++;
      this.results.errors.push(`Concurrent: ${error.message}`);
    }
    this.results.totalTests++;
  }

  async testErrorHandling() {
    this.log('Testing error handling...');
    
    // Test with empty message
    try {
      const response = await axios.post(`${BASE_URL}/api/chat/`, {
        message: '',
        userId: 'test-user'
      });
      
      if (response.status === 400) {
        this.log('Empty message error handling works', 'success');
        this.results.passed++;
      } else {
        this.log('Empty message error handling failed', 'error');
        this.results.failed++;
        this.results.errors.push('Error handling: Empty message not rejected');
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        this.log('Empty message error handling works', 'success');
        this.results.passed++;
      } else {
        this.log(`Error handling test failed: ${error.message}`, 'error');
        this.results.failed++;
        this.results.errors.push(`Error handling: ${error.message}`);
      }
    }
    this.results.totalTests++;

    // Test with very long message
    try {
      const longMessage = 'a'.repeat(5000);
      const response = await axios.post(`${BASE_URL}/api/chat/`, {
        message: longMessage,
        userId: 'test-user'
      });
      
      if (response.status === 400) {
        this.log('Long message error handling works', 'success');
        this.results.passed++;
      } else {
        this.log('Long message error handling failed', 'error');
        this.results.failed++;
        this.results.errors.push('Error handling: Long message not rejected');
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        this.log('Long message error handling works', 'success');
        this.results.passed++;
      } else {
        this.log(`Long message error handling failed: ${error.message}`, 'error');
        this.results.failed++;
        this.results.errors.push(`Error handling: ${error.message}`);
      }
    }
    this.results.totalTests++;
  }

  async runAllTests() {
    console.log('🚀 Starting Chat System Tests'.cyan.bold);
    console.log(`📍 Testing against: ${BASE_URL}`.gray);
    console.log('');

    await this.testHealthCheck();
    await this.testChatEndpoint();
    await this.testStreamingEndpoint();
    await this.testMonitoringEndpoints();
    await this.testConcurrentRequests();
    await this.testErrorHandling();

    this.printResults();
  }

  printResults() {
    console.log('');
    console.log('📊 Test Results'.cyan.bold);
    console.log('='.repeat(50));
    
    const successRate = this.results.totalTests > 0 
      ? (this.results.passed / this.results.totalTests) * 100 
      : 0;

    console.log(`Total Tests: ${this.results.totalTests}`.white);
    console.log(`Passed: ${this.results.passed}`.green);
    console.log(`Failed: ${this.results.failed}`.red);
    console.log(`Success Rate: ${successRate.toFixed(1)}%`.yellow);
    
    if (this.results.errors.length > 0) {
      console.log('');
      console.log('❌ Errors:'.red.bold);
      this.results.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`.red);
      });
    }

    console.log('');
    if (successRate >= 80) {
      console.log('🎉 Chat system is working well!'.green.bold);
    } else if (successRate >= 60) {
      console.log('⚠️  Chat system has some issues but is mostly functional'.yellow.bold);
    } else {
      console.log('🚨 Chat system needs attention!'.red.bold);
    }

    console.log('');
    console.log(`📈 Monitor your system at: ${BASE_URL}/monitoring.html`.blue);
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  const tester = new ChatSystemTester();
  tester.runAllTests().catch(console.error);
}

module.exports = ChatSystemTester;
