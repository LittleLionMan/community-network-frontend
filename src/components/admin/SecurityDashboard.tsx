'use client';

import { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Users,
  Activity,
  RefreshCw,
  CheckCircle,
  XCircle,
  Zap,
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { toast } from '@/components/ui/toast';
import type { RateLimitHealth, RateLimitOverview } from '@/types/admin';

interface SecurityMetricProps {
  title: string;
  value: number | string;
  icon: React.ElementType;
  color: 'blue' | 'green' | 'yellow' | 'red' | 'indigo';
  description: string;
}

const SecurityMetric: React.FC<SecurityMetricProps> = ({
  title,
  value,
  icon: Icon,
  color,
  description,
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    red: 'bg-red-50 text-red-600 border-red-200',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-200',
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center">
        <div className={`rounded-lg p-3 ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="mt-1 text-xs text-gray-500">{description}</p>
        </div>
      </div>
    </div>
  );
};

interface HealthScoreProps {
  score: number;
  status: string;
}

const HealthScore: React.FC<HealthScoreProps> = ({ score, status }) => {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-blue-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="text-center">
      <div className="relative mx-auto h-32 w-32">
        <svg className="h-32 w-32 -rotate-90 transform" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="40"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-gray-200"
          />
          <circle
            cx="50"
            cy="50"
            r="40"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={`${score * 2.51} 251`}
            strokeLinecap="round"
            className={getScoreColor(score)}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className={`text-2xl font-bold ${getScoreColor(score)}`}>
              {score}
            </div>
            <div className="text-xs uppercase tracking-wide text-gray-500">
              {status}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export function SecurityDashboard() {
  const [rateLimitHealth, setRateLimitHealth] =
    useState<RateLimitHealth | null>(null);
  const [rateLimitOverview, setRateLimitOverview] =
    useState<RateLimitOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchSecurityData = async () => {
    try {
      const [healthData, overviewData] = await Promise.all([
        apiClient.admin.getRateLimitHealth(),
        apiClient.admin.getRateLimitOverview(),
      ]);

      setRateLimitHealth(healthData.health);
      setRateLimitOverview(overviewData);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch security data:', error);
      toast.error('Fehler beim Laden der Security-Daten');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    await fetchSecurityData();
    toast.success('Security Dashboard aktualisiert');
  };

  const handleClearRateLimits = async (ipAddress?: string) => {
    try {
      await apiClient.admin.clearRateLimits(ipAddress);
      toast.success(
        ipAddress
          ? `Rate Limits für IP ${ipAddress} gelöscht`
          : 'Alle Rate Limits gelöscht'
      );
      await fetchSecurityData();
    } catch (error) {
      toast.error('Fehler beim Löschen der Rate Limits');
      console.log(error);
    }
  };

  useEffect(() => {
    fetchSecurityData();

    if (autoRefresh) {
      const interval = setInterval(fetchSecurityData, 30000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  if (isLoading && !rateLimitHealth) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <RefreshCw className="mx-auto h-8 w-8 animate-spin text-indigo-600" />
          <p className="mt-2 text-sm text-gray-600">
            Security Dashboard wird geladen...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Security Monitoring
          </h1>
          <p className="text-sm text-gray-600">
            Rate Limiting Status und Security Health Monitoring
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

      {rateLimitHealth && (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-6 text-lg font-medium text-gray-900">
            Security Health Score
          </h2>
          <div className="flex items-center justify-between">
            <HealthScore
              score={rateLimitHealth.health_score}
              status={rateLimitHealth.status}
            />
            <div className="ml-8 flex-1">
              <h3 className="mb-4 text-base font-medium text-gray-900">
                Empfohlene Aktionen
              </h3>
              <div className="space-y-2">
                {rateLimitHealth.recommendations
                  .slice(0, 3)
                  .map((rec, index) => (
                    <div
                      key={index}
                      className={`rounded-md border p-3 ${
                        rec.priority === 'high'
                          ? 'border-red-200 bg-red-50'
                          : rec.priority === 'medium'
                            ? 'border-yellow-200 bg-yellow-50'
                            : 'border-blue-200 bg-blue-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900">
                            {rec.title}
                          </h4>
                          <p className="mt-1 text-xs text-gray-600">
                            {rec.action}
                          </p>
                        </div>
                        <span
                          className={`ml-2 rounded-full px-2 py-1 text-xs ${
                            rec.priority === 'high'
                              ? 'bg-red-100 text-red-800'
                              : rec.priority === 'medium'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {rec.priority}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {rateLimitHealth && rateLimitOverview && (
        <div>
          <h2 className="mb-4 text-lg font-medium text-gray-900">
            Rate Limiting Metrics
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SecurityMetric
              title="Aktive User"
              value={rateLimitHealth.content_rate_limits.active_users}
              icon={Users}
              color="blue"
              description="User mit aktueller Rate Limiting Aktivität"
            />
            <SecurityMetric
              title="Active Lockouts"
              value={rateLimitHealth.content_rate_limits.total_lockouts}
              icon={XCircle}
              color={
                rateLimitHealth.content_rate_limits.total_lockouts > 10
                  ? 'red'
                  : 'yellow'
              }
              description="Momentan gesperrte User"
            />
            <SecurityMetric
              title="Suspicious IPs"
              value={rateLimitHealth.read_rate_limits.suspicious_ips.length}
              icon={AlertTriangle}
              color={
                rateLimitHealth.read_rate_limits.suspicious_ips.length > 5
                  ? 'red'
                  : 'green'
              }
              description="IPs mit verdächtigen Aktivitäten"
            />
            <SecurityMetric
              title="Total Tracked"
              value={rateLimitOverview.content_rate_limits.total_tracked_users}
              icon={Activity}
              color="indigo"
              description="Gesamt überwachte User"
            />
          </div>
        </div>
      )}

      {rateLimitHealth?.alerts && rateLimitHealth.alerts.length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-medium text-gray-900">
            Aktuelle Alerts
          </h2>
          <div className="space-y-3">
            {rateLimitHealth.alerts.map((alert, index) => (
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
                  <div className="flex-1">
                    <div className="flex items-center">
                      <AlertTriangle
                        className={`mr-2 h-5 w-5 ${
                          alert.severity === 'high'
                            ? 'text-red-500'
                            : alert.severity === 'medium'
                              ? 'text-yellow-500'
                              : 'text-blue-500'
                        }`}
                      />
                      <h4 className="font-medium text-gray-900">
                        {alert.alert_type}
                      </h4>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">
                      {alert.message}
                    </p>
                    <p className="mt-2 text-xs text-gray-500">
                      {new Date(alert.timestamp).toLocaleString('de-DE')}
                    </p>
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

      {rateLimitHealth?.read_rate_limits.suspicious_ips &&
        rateLimitHealth.read_rate_limits.suspicious_ips.length > 0 && (
          <div>
            <h2 className="mb-4 text-lg font-medium text-gray-900">
              Suspicious IP Addresses
            </h2>
            <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    IPs mit verdächtigen Aktivitäten in der letzten Stunde
                  </p>
                  <button
                    onClick={() => handleClearRateLimits()}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Alle Rate Limits löschen
                  </button>
                </div>
              </div>
              <div className="divide-y divide-gray-200">
                {rateLimitHealth.read_rate_limits.suspicious_ips
                  .slice(0, 10)
                  .map((suspiciousIp, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between px-6 py-4"
                    >
                      <div className="flex-1">
                        <div className="flex items-center">
                          <span className="font-mono text-sm font-medium text-gray-900">
                            {suspiciousIp.ip}
                          </span>
                          <span className="ml-2 rounded-full bg-red-100 px-2 py-1 text-xs text-red-800">
                            {suspiciousIp.attempts_1h} Versuche
                          </span>
                        </div>
                        <div className="mt-1 text-xs text-gray-500">
                          Endpoints: {suspiciousIp.endpoints.join(', ')}
                        </div>
                      </div>
                      <button
                        onClick={() => handleClearRateLimits(suspiciousIp.ip)}
                        className="ml-4 text-sm text-indigo-600 hover:text-indigo-800"
                      >
                        Rate Limits löschen
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

      {rateLimitOverview && (
        <div>
          <h2 className="mb-4 text-lg font-medium text-gray-900">
            Rate Limit Konfiguration
          </h2>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h3 className="mb-4 text-base font-medium text-gray-900">
                Content Rate Limits
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Überwachte User:</span>
                  <span className="font-medium">
                    {rateLimitOverview.content_rate_limits.total_tracked_users}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Aktive Lockouts:</span>
                  <span className="font-medium">
                    {rateLimitOverview.content_rate_limits.active_lockouts}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Content Types:</span>
                  <span className="font-medium">
                    {rateLimitOverview.rate_limit_config.content_types.length}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h3 className="mb-4 text-base font-medium text-gray-900">
                Read Rate Limits
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Überwachte IPs:</span>
                  <span className="font-medium">
                    {rateLimitOverview.read_rate_limits.total_tracked_ips}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Aktive IPs:</span>
                  <span className="font-medium">
                    {rateLimitOverview.read_rate_limits.active_ips}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">User Tiers:</span>
                  <span className="font-medium">
                    {rateLimitOverview.rate_limit_config.user_tiers.length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div>
        <h2 className="mb-4 text-lg font-medium text-gray-900">
          Security Actions
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <button
            onClick={() => handleClearRateLimits()}
            className="flex items-center justify-center rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 hover:bg-red-100"
          >
            <XCircle className="mr-2 h-5 w-5" />
            Alle Rate Limits löschen
          </button>

          <button
            onClick={async () => {
              try {
                await apiClient.admin.testSecurityLogging();
                toast.success(
                  'Security Test erfolgreich - Check Application Logs'
                );
              } catch (error) {
                toast.error('Security Test fehlgeschlagen');
                console.log(error);
              }
            }}
            className="flex items-center justify-center rounded-lg border border-gray-200 bg-white p-4 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <CheckCircle className="mr-2 h-5 w-5 text-green-600" />
            Security Test
          </button>

          <button
            onClick={() => {
              toast.success(
                'Security Logs: Check Application Logs oder Setup ELK Stack für detaillierte Logs'
              );
            }}
            className="flex items-center justify-center rounded-lg border border-gray-200 bg-white p-4 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Activity className="mr-2 h-5 w-5 text-blue-600" />
            Security Logs
          </button>

          <button
            onClick={async () => {
              try {
                await apiClient.admin.triggerCleanup();
                toast.success('System Maintenance erfolgreich ausgeführt');
                await fetchSecurityData();
              } catch (error) {
                toast.error('System Maintenance fehlgeschlagen');
                console.log(error);
              }
            }}
            className="flex items-center justify-center rounded-lg border border-gray-200 bg-white p-4 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Zap className="mr-2 h-5 w-5 text-yellow-600" />
            System Maintenance
          </button>
        </div>
      </div>
    </div>
  );
}
