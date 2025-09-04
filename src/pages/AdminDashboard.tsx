import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart3,
  Users,
  Activity,
  Settings,
  Shield,
  TrendingUp,
  Database,
  Zap,
  AlertTriangle,
  CheckCircle,
  Clock,
  Bell,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  RefreshCw
} from 'lucide-react';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import AdminAuth from '../components/AdminAuth';

interface SystemStatus {
  status: 'online' | 'warning' | 'offline';
  uptime: string;
  responseTime: number;
  lastCheck: string;
  memoryUsage: number;
  cpuUsage?: number;
}

interface UserMetrics {
  dau: number;
  wau: number;
  mau: number;
  peakUsers: number;
  avgSessionLength: number;
  totalUsers: number;
  activeUsers: number;
}

interface ApiMetrics {
  totalRequests: number;
  successRate: number;
  avgResponseTime: number;
  fineTunedUsage: number;
  fallbackUsage: number;
  errorRate: number;
}

interface SystemHealth {
  timestamp: string;
  system: {
    uptime: number;
    memory: {
      rss: number;
      heapTotal: number;
      heapUsed: number;
      external: number;
      arrayBuffers: number;
    };
    nodeVersion: string;
    environment: string;
  };
  ai: {
    health: {
      isHealthy: boolean;
      lastCheck: string;
      consecutiveFailures: number;
      totalRequests: number;
      successfulRequests: number;
      averageResponseTime: number;
      errorLog: any[];
      successRate: number;
      uptime: number;
    };
    connectivity: {
      success: boolean;
      modelsAvailable: number;
      fineTunedModelExists: boolean;
    };
    usage: any;
    models: {
      fineTuned: string;
      fallback: string;
    };
  };
}

interface ErrorLog {
  timestamp: string;
  errors: any[];
  totalErrors: number;
  consecutiveFailures: number;
}

const AdminDashboard: React.FC = () => {
  const { adminUser, isAuthenticated, login, logout, loading, error } = useAdminAuth();
  const [darkMode, setDarkMode] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [loadingData, setLoadingData] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [errorLogs, setErrorLogs] = useState<ErrorLog>({
    timestamp: '',
    errors: [],
    totalErrors: 0,
    consecutiveFailures: 0
  });

  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    status: 'online',
    uptime: '99.9%',
    responseTime: 245,
    lastCheck: new Date().toISOString(),
    memoryUsage: 0
  });

  const [userMetrics] = useState<UserMetrics>({
    dau: 1247,
    wau: 8934,
    mau: 45678,
    peakUsers: 234,
    avgSessionLength: 8.5,
    totalUsers: 45678,
    activeUsers: 234
  });

  const [apiMetrics, setApiMetrics] = useState<ApiMetrics>({
    totalRequests: 45678,
    successRate: 98.7,
    avgResponseTime: 1.2,
    fineTunedUsage: 89.3,
    fallbackUsage: 10.7,
    errorRate: 1.3
  });

  // API endpoints
  const API_BASE = '/api/admin/analytics';

  // Fetch system health data
  const fetchSystemHealth = async () => {
    try {
      const response = await fetch(`${API_BASE}/status`);
      if (response.ok) {
        const data: SystemHealth = await response.json();

        setSystemStatus({
          status: data.ai.health?.isHealthy ? 'online' : 'warning',
          uptime: `${Math.floor(data.system.uptime / 3600)}h ${Math.floor((data.system.uptime % 3600) / 60)}m`,
          responseTime: data.ai.health?.averageResponseTime || 0,
          lastCheck: new Date().toISOString(),
          memoryUsage: Math.round(data.system.memory.heapUsed / 1024 / 1024) // MB
        });

        setApiMetrics({
          totalRequests: data.ai.health?.totalRequests || 0,
          successRate: data.ai.health?.successRate || 0,
          avgResponseTime: data.ai.health?.averageResponseTime || 0,
          fineTunedUsage: 0, // Will be updated when we have usage data
          fallbackUsage: 0, // Will be updated when we have usage data
          errorRate: data.ai.health?.totalRequests > 0 ? ((data.ai.health.totalRequests - data.ai.health.successfulRequests) / data.ai.health.totalRequests) * 100 : 0
        });
      }
    } catch (error) {
      console.error('Failed to fetch system health:', error);
      setSystemStatus(prev => ({ ...prev, status: 'offline' }));
    }
  };

  // Fetch error logs
  const fetchErrorLogs = async () => {
    try {
      const response = await fetch(`${API_BASE}/errors`);
      if (response.ok) {
        const data = await response.json();
        setErrorLogs(data);
      }
    } catch (error) {
      console.error('Failed to fetch error logs:', error);
    }
  };

  // Fetch all data
  const fetchAllData = useCallback(async () => {
    setLoadingData(true);
    try {
      await Promise.all([
        fetchSystemHealth(),
        fetchErrorLogs()
      ]);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoadingData(false);
    }
  }, []);

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    if (isAuthenticated) {
      fetchAllData(); // Initial fetch
      const interval = setInterval(fetchAllData, 30000); // Every 30 seconds
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, fetchAllData]);

  const toggleDarkMode = () => setDarkMode(!darkMode);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return <AdminAuth onLogin={login} error={error || undefined} loading={loading} />;
  }

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: 'Users & Analytics', icon: Users },
    { id: 'monitoring', label: 'System Monitoring', icon: Activity },
    { id: 'content', label: 'Content Management', icon: Database },
    { id: 'api', label: 'API & Models', icon: Zap },
    { id: 'scraper', label: 'Scraper Health', icon: TrendingUp },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'security', label: 'Security & Audit', icon: Shield }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'offline': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      case 'offline': return <X className="w-5 h-5 text-red-400" />;
      default: return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <header className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b sticky top-0 z-50`}>
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-md hover:bg-gray-700 lg:hidden"
              >
                {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <h1 className="text-xl font-semibold ml-2">HOWPARTH Admin Dashboard</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={fetchAllData}
                disabled={loadingData}
                className="p-2 rounded-md hover:bg-gray-700 disabled:opacity-50"
                title="Refresh Data"
              >
                <RefreshCw className={`w-5 h-5 ${loadingData ? 'animate-spin' : ''}`} />
              </button>

              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-md hover:bg-gray-700"
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              <div className="text-sm text-gray-400">
                Last update: {lastUpdate.toLocaleTimeString()}
              </div>

              <div className="flex items-center space-x-2">
                <Bell className="w-5 h-5" />
                <span className="text-sm">{adminUser?.username} ({adminUser?.role})</span>
                <button
                  onClick={logout}
                  className="p-2 rounded-md hover:bg-gray-700"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40 w-64 ${darkMode ? 'bg-gray-800' : 'bg-white'} border-r ${darkMode ? 'border-gray-700' : 'border-gray-200'} transition-transform duration-300 ease-in-out`}>
          <nav className="mt-8 px-4">
            <ul className="space-y-2">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                        activeTab === item.id
                          ? darkMode 
                            ? 'bg-purple-600 text-white' 
                            : 'bg-purple-100 text-purple-700'
                          : darkMode
                            ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="w-5 h-5 mr-3" />
                      {item.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">System Overview</h2>
              
              {/* Status Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">System Status</p>
                      <p className={`text-2xl font-bold ${getStatusColor(systemStatus.status)}`}>
                        {systemStatus.status.toUpperCase()}
                      </p>
                    </div>
                    {getStatusIcon(systemStatus.status)}
                  </div>
                  <div className="text-sm text-gray-500 mt-2 space-y-1">
                    <p>Uptime: {systemStatus.uptime}</p>
                    <p>Memory: {systemStatus.memoryUsage}MB</p>
                    <p>Last check: {new Date(systemStatus.lastCheck).toLocaleTimeString()}</p>
                  </div>
                </div>

                <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Daily Active Users</p>
                      <p className="text-2xl font-bold">{userMetrics.dau.toLocaleString()}</p>
                    </div>
                    <Users className="w-8 h-8 text-blue-400" />
                  </div>
                  <p className="text-sm text-gray-500 mt-2">+12% from yesterday</p>
                </div>

                <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">API Requests</p>
                      <p className="text-2xl font-bold">{apiMetrics.totalRequests.toLocaleString()}</p>
                    </div>
                    <Zap className="w-8 h-8 text-green-400" />
                  </div>
                  <div className="text-sm text-gray-500 mt-2 space-y-1">
                    <p>Success Rate: {apiMetrics.successRate.toFixed(1)}%</p>
                    <p>Error Rate: {apiMetrics.errorRate.toFixed(1)}%</p>
                    <p>Avg Response: {apiMetrics.avgResponseTime.toFixed(1)}s</p>
                  </div>
                </div>

                <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Response Time</p>
                      <p className="text-2xl font-bold">{systemStatus.responseTime.toFixed(0)}ms</p>
                    </div>
                    <Activity className="w-8 h-8 text-purple-400" />
                  </div>
                  <div className="text-sm text-gray-500 mt-2 space-y-1">
                    <p>Current: {systemStatus.responseTime.toFixed(0)}ms</p>
                    <p>Average: {(apiMetrics.avgResponseTime * 1000).toFixed(0)}ms</p>
                    <p>Status: {systemStatus.responseTime < 1000 ? 'Excellent' : systemStatus.responseTime < 2000 ? 'Good' : 'Slow'}</p>
                  </div>
                </div>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <h3 className="text-lg font-semibold mb-4">User Growth</h3>
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <TrendingUp className="w-12 h-12 mx-auto mb-2" />
                      <p>Chart will be implemented with Chart.js</p>
                    </div>
                  </div>
                </div>

                <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <h3 className="text-lg font-semibold mb-4">Model Usage Distribution</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-4 h-4 bg-blue-500 rounded"></div>
                        <span className="text-sm">Fine-tuned Model</span>
                      </div>
                      <span className="text-sm font-semibold">{apiMetrics.fineTunedUsage.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3">
                      <div
                        className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${apiMetrics.fineTunedUsage}%` }}
                      ></div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-4 h-4 bg-gray-500 rounded"></div>
                        <span className="text-sm">Fallback Model</span>
                      </div>
                      <span className="text-sm font-semibold">{apiMetrics.fallbackUsage.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3">
                      <div
                        className="bg-gray-500 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${apiMetrics.fallbackUsage}%` }}
                      ></div>
                    </div>

                    <div className="pt-4 border-t border-gray-600">
                      <div className="flex justify-between text-sm">
                        <span>Total Requests:</span>
                        <span className="font-semibold">{apiMetrics.totalRequests.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Success Rate:</span>
                        <span className="font-semibold text-green-400">{apiMetrics.successRate.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <h3 className="text-lg font-semibold mb-4">System Activity & Errors</h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {errorLogs.totalErrors > 0 ? (
                    <>
                      <div className="flex items-center space-x-3 p-2 bg-red-900/20 border border-red-500/30 rounded">
                        <AlertTriangle className="w-5 h-5 text-red-400" />
                        <span className="text-sm">Total Errors: {errorLogs.totalErrors}</span>
                        <span className="text-xs text-red-400 ml-auto">
                          {errorLogs.consecutiveFailures > 0 && `(${errorLogs.consecutiveFailures} consecutive)`}
                        </span>
                      </div>
                      {errorLogs.errors.slice(-3).map((error: any, index: number) => (
                        <div key={index} className="flex items-center space-x-3">
                          <AlertTriangle className="w-5 h-5 text-yellow-400" />
                          <span className="text-sm truncate">Error: {error.message || 'Unknown error'}</span>
                          <span className="text-xs text-gray-500 ml-auto">
                            {new Date(error.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      ))}
                    </>
                  ) : (
                    <>
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        <span className="text-sm">System running normally</span>
                        <span className="text-xs text-gray-500 ml-auto">Live</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Activity className="w-5 h-5 text-blue-400" />
                        <span className="text-sm">Monitoring active</span>
                        <span className="text-xs text-gray-500 ml-auto">Real-time</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Zap className="w-5 h-5 text-purple-400" />
                        <span className="text-sm">AI services operational</span>
                        <span className="text-xs text-gray-500 ml-auto">Fine-tuned model</span>
                      </div>
                    </>
                  )}

                  <div className="flex items-center space-x-3">
                    <RefreshCw className={`w-5 h-5 ${loadingData ? 'animate-spin text-blue-400' : 'text-gray-400'}`} />
                    <span className="text-sm">
                      {loadingData ? 'Updating data...' : 'Data synced'}
                    </span>
                    <span className="text-xs text-gray-500 ml-auto">
                      {lastUpdate.toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Users & Analytics</h2>
              <div className="text-center py-12 text-gray-500">
                <Users className="w-16 h-16 mx-auto mb-4" />
                <p>User analytics dashboard will be implemented here</p>
              </div>
            </div>
          )}

          {activeTab === 'monitoring' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">System Monitoring</h2>
              <div className="text-center py-12 text-gray-500">
                <Activity className="w-16 h-16 mx-auto mb-4" />
                <p>Real-time monitoring dashboard will be implemented here</p>
              </div>
            </div>
          )}

          {activeTab === 'content' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Content Management</h2>
              <div className="text-center py-12 text-gray-500">
                <Database className="w-16 h-16 mx-auto mb-4" />
                <p>Content management interface will be implemented here</p>
              </div>
            </div>
          )}

          {activeTab === 'api' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">API & Models</h2>
              <div className="text-center py-12 text-gray-500">
                <Zap className="w-16 h-16 mx-auto mb-4" />
                <p>API metrics and model performance dashboard will be implemented here</p>
              </div>
            </div>
          )}

          {activeTab === 'scraper' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Scraper Health</h2>
              <div className="text-center py-12 text-gray-500">
                <TrendingUp className="w-16 h-16 mx-auto mb-4" />
                <p>Scraper monitoring dashboard will be implemented here</p>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Settings</h2>
              <div className="text-center py-12 text-gray-500">
                <Settings className="w-16 h-16 mx-auto mb-4" />
                <p>System configuration interface will be implemented here</p>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Security & Audit</h2>
              <div className="text-center py-12 text-gray-500">
                <Shield className="w-16 h-16 mx-auto mb-4" />
                <p>Security monitoring and audit logs will be implemented here</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
