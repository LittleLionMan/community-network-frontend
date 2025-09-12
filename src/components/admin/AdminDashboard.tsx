'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Calendar,
  Briefcase,
  MessageSquare,
  Shield,
  Activity,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { toast } from '@/components/ui/toast';
import type { AdminDashboardStats, RateLimitHealth } from '@/types/admin';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ElementType;
  color: 'blue' | 'green' | 'yellow' | 'red' | 'indigo' | 'purple';
  trend?: {
    value: number;
    label: string;
  };
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  color,
  trend,
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    red: 'bg-red-50 text-red-600 border-red-200',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend && (
            <p className="mt-1 text-sm text-gray-500">
              <span className="font-medium text-green-600">+{trend.value}</span>{' '}
              {trend.label}
            </p>
          )}
        </div>
        <div className={`rounded-full p-3 ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
};

interface HealthStatusProps {
  status: string;
  score?: number;
}

const HealthStatus: React.FC<HealthStatusProps> = ({ status, score }) => {
  const getStatusInfo = (status: string, score?: number) => {
    if (score !== undefined) {
      if (score >= 90)
        return { color: 'green', icon: CheckCircle, label: 'Excellent' };
      if (score >= 75)
        return { color: 'blue', icon: CheckCircle, label: 'Good' };
      if (score >= 60)
        return { color: 'yellow', icon: AlertTriangle, label: 'Warning' };
      if (score >= 40)
        return { color: 'red', icon: AlertTriangle, label: 'Poor' };
      return { color: 'red', icon: AlertTriangle, label: 'Critical' };
    }

    switch (status.toLowerCase()) {
      case 'healthy':
      case 'connected':
      case 'active':
        return { color: 'green', icon: CheckCircle, label: status };
      case 'warning':
        return { color: 'yellow', icon: AlertTriangle, label: status };
      case 'error':
      case 'disabled':
        return { color: 'red', icon: AlertTriangle, label: status };
      default:
        return { color: 'blue', icon: Activity, label: status };
    }
  };

  const info = getStatusInfo(status, score);
  const Icon = info.icon;

  const colorClasses = {
    green: 'text-green-600 bg-green-100',
    blue: 'text-blue-600 bg-blue-100',
    yellow: 'text-yellow-600 bg-yellow-100',
    red: 'text-red-600 bg-red-100',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colorClasses[info.color as keyof typeof colorClasses]}`}
    >
      <Icon className="mr-1 h-3 w-3" />
      {score !== undefined ? `${info.label} (${score})` : info.label}
    </span>
  );
};

export function AdminDashboard() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [rateLimitHealth, setRateLimitHealth] =
    useState<RateLimitHealth | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const [dashboardData, rateLimitData] = await Promise.all([
        apiClient.admin.getDashboard(),
        apiClient.admin.getRateLimitHealth(),
      ]);

      setStats(dashboardData);
      setRateLimitHealth(rateLimitData.health);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Fehler beim Laden der Dashboard-Daten');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    await fetchDashboardData();
    toast.success('Dashboard aktualisiert');
  };

  const handleSystemMaintenance = async () => {
    try {
      await apiClient.admin.triggerCleanup();
      toast.success('System Maintenance erfolgreich ausgeführt');
    } catch (error) {
      toast.error('Fehler beim System Maintenance');
    }
  };

  useEffect(() => {
    fetchDashboardData();

    if (autoRefresh) {
      const interval = setInterval(fetchDashboardData, 30000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  if (isLoading && !stats) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <RefreshCw className="mx-auto h-8 w-8 animate-spin text-indigo-600" />
          <p className="mt-2 text-sm text-gray-600">
            Dashboard wird geladen...
          </p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          Fehler beim Laden
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Dashboard-Daten konnten nicht geladen werden
        </p>
        <button
          onClick={handleRefresh}
          className="mt-4 rounded-md bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700"
        >
          Erneut versuchen
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-sm text-gray-600">
            Community Platform Übersicht und Monitoring
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <label className="flex items-center text-sm text-gray-600">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="mr-2 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            Auto-Refresh (30s)
          </label>

          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            <RefreshCw
              className={`mr-1 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
            />
            Aktualisieren
          </button>
        </div>
      </div>

      {lastUpdated && (
        <div className="text-xs text-gray-500">
          Letzte Aktualisierung: {lastUpdated.toLocaleTimeString('de-DE')}
        </div>
      )}

      <div>
        <h2 className="mb-4 text-lg font-medium text-gray-900">
          Platform Statistiken
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Aktive User"
            value={stats.platform_stats.total_users}
            icon={Users}
            color="blue"
            trend={{
              value: stats.platform_stats.recent_activity.new_users_7d,
              label: 'neue User (7 Tage)',
            }}
          />
          <StatCard
            title="Events"
            value={stats.platform_stats.total_events}
            icon={Calendar}
            color="green"
            trend={{
              value: stats.platform_stats.recent_activity.new_events_7d,
              label: 'neue Events (7 Tage)',
            }}
          />
          <StatCard
            title="Services"
            value={stats.platform_stats.total_services}
            icon={Briefcase}
            color="purple"
            trend={{
              value: stats.platform_stats.recent_activity.new_services_7d,
              label: 'neue Services (7 Tage)',
            }}
          />
          <StatCard
            title="Messages"
            value={stats.platform_stats.total_messages}
            icon={MessageSquare}
            color="indigo"
          />
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-lg font-medium text-gray-900">
          System Health
        </h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-medium text-gray-900">
                Rate Limiting
              </h3>
              <HealthStatus
                status={rateLimitHealth?.status || 'unknown'}
                score={rateLimitHealth?.health_score}
              />
            </div>

            {rateLimitHealth && (
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Aktive User:</span>
                  <span className="font-medium">
                    {rateLimitHealth.content_rate_limits.active_users}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Lockouts:</span>
                  <span className="font-medium">
                    {rateLimitHealth.content_rate_limits.total_lockouts}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Suspicious IPs:</span>
                  <span className="font-medium">
                    {rateLimitHealth.read_rate_limits.suspicious_ips.length}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="mb-4 text-base font-medium text-gray-900">
              System Components
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Database:</span>
                <HealthStatus status={stats.health.database} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Messaging:</span>
                <HealthStatus status={stats.health.messaging} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">WebSockets:</span>
                <HealthStatus status={stats.health.websockets} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Moderation:</span>
                <HealthStatus status={stats.health.moderation} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Token Rotation:</span>
                <HealthStatus status={stats.health.token_rotation} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-lg font-medium text-gray-900">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/admin/events"
            className="flex items-center justify-center rounded-lg border border-gray-200 bg-white p-4 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Calendar className="mr-2 h-5 w-5 text-green-600" />
            Event Categories
          </Link>
          <Link
            href="/admin/security"
            className="flex items-center justify-center rounded-lg border border-gray-200 bg-white p-4 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Shield className="mr-2 h-5 w-5 text-indigo-600" />
            Security Overview
          </Link>
          <Link
            href="/admin/users"
            className="flex items-center justify-center rounded-lg border border-gray-200 bg-white p-4 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Users className="mr-2 h-5 w-5 text-blue-600" />
            User Management
          </Link>
          <Link
            href="/admin/content"
            className="flex items-center justify-center rounded-lg border border-gray-200 bg-white p-4 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <MessageSquare className="mr-2 h-5 w-5 text-green-600" />
            Content Moderation
          </Link>
          <button
            onClick={handleSystemMaintenance}
            className="flex items-center justify-center rounded-lg border border-gray-200 bg-white p-4 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Zap className="mr-2 h-5 w-5 text-yellow-600" />
            System Maintenance
          </button>
        </div>
      </div>

      {rateLimitHealth?.alerts && rateLimitHealth.alerts.length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-medium text-gray-900">
            Aktuelle Alerts
          </h2>
          <div className="space-y-3">
            {rateLimitHealth.alerts.slice(0, 3).map((alert, index) => (
              <div
                key={index}
                className={`rounded-lg border p-4 ${
                  alert.severity === 'high'
                    ? 'border-red-200 bg-red-50'
                    : alert.severity === 'medium'
                      ? 'border-yellow-200 bg-yellow-50'
                      : 'border-blue-200 bg-blue-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {alert.alert_type}
                    </h4>
                    <p className="text-sm text-gray-600">{alert.message}</p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                      alert.severity === 'high'
                        ? 'bg-red-100 text-red-800'
                        : alert.severity === 'medium'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {alert.severity}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
