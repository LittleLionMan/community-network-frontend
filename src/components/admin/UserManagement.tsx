'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Users,
  Shield,
  ShieldOff,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Eye,
  Ban,
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { toast } from '@/components/ui/toast';
import { ProfileAvatar } from '@/components/profile/ProfileAvatar';
import type {
  AdminUser,
  UserSearchParams,
  UserRateLimitStats,
} from '@/types/admin';

interface UserCardProps {
  user: AdminUser;
  onViewDetails: (user: AdminUser) => void;
  onViewRateLimits: (user: AdminUser) => void;
  onToggleStatus: (user: AdminUser) => void;
  onToggleAdmin: (user: AdminUser) => void;
}

const UserCard: React.FC<UserCardProps> = ({
  user,
  onViewDetails,
  onViewRateLimits,
  onToggleStatus,
  onToggleAdmin,
}) => {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          <ProfileAvatar
            user={{
              display_name: user.display_name,
              profile_image_url: user.profile_image_url,
            }}
            size="md"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-2">
              <h3 className="truncate text-lg font-medium text-gray-900">
                {user.display_name}
              </h3>
              {user.is_admin && (
                <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800">
                  <Shield className="mr-1 h-3 w-3" />
                  Admin
                </span>
              )}
            </div>

            <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
              <span>{user.email}</span>
              {user.first_name && user.last_name && (
                <span>
                  {user.first_name} {user.last_name}
                </span>
              )}
            </div>

            <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
              <span className="flex items-center">
                <Clock className="mr-1 h-3 w-3" />
                Erstellt:{' '}
                {new Date(user.created_at).toLocaleDateString('de-DE')}
              </span>
              {user.last_login && (
                <span>
                  Letzter Login:{' '}
                  {new Date(user.last_login).toLocaleDateString('de-DE')}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                user.is_active
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {user.is_active ? (
                <CheckCircle className="mr-1 h-3 w-3" />
              ) : (
                <XCircle className="mr-1 h-3 w-3" />
              )}
              {user.is_active ? 'Aktiv' : 'Inaktiv'}
            </span>

            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                user.email_verified
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}
            >
              {user.email_verified ? 'Verifiziert' : 'Unverifiziert'}
            </span>
          </div>

          <div className="flex space-x-1">
            <button
              onClick={() => onViewDetails(user)}
              className="rounded-md bg-indigo-50 p-2 text-indigo-600 hover:bg-indigo-100"
              title="Details anzeigen"
            >
              <Eye className="h-4 w-4" />
            </button>
            <button
              onClick={() => onViewRateLimits(user)}
              className="rounded-md bg-yellow-50 p-2 text-yellow-600 hover:bg-yellow-100"
              title="Rate Limits anzeigen"
            >
              <Ban className="h-4 w-4" />
            </button>
            <button
              onClick={() => onToggleStatus(user)}
              className={`rounded-md p-2 ${
                user.is_active
                  ? 'bg-red-50 text-red-600 hover:bg-red-100'
                  : 'bg-green-50 text-green-600 hover:bg-green-100'
              }`}
              title={user.is_active ? 'User deaktivieren' : 'User aktivieren'}
            >
              {user.is_active ? (
                <XCircle className="h-4 w-4" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
            </button>
            <button
              onClick={() => onToggleAdmin(user)}
              className={`rounded-md p-2 ${
                user.is_admin
                  ? 'bg-purple-50 text-purple-600 hover:bg-purple-100'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
              title={user.is_admin ? 'Admin entfernen' : 'Zum Admin machen'}
            >
              {user.is_admin ? (
                <ShieldOff className="h-4 w-4" />
              ) : (
                <Shield className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface UserDetailsModalProps {
  isOpen: boolean;
  user: AdminUser | null;
  onClose: () => void;
}

const UserDetailsModal: React.FC<UserDetailsModalProps> = ({
  isOpen,
  user,
  onClose,
}) => {
  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">User Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XCircle className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <ProfileAvatar
              user={{
                display_name: user.display_name,
                profile_image_url: user.profile_image_url,
              }}
              size="lg"
            />
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                {user.display_name}
              </h3>
              <p className="text-gray-600">{user.email}</p>
              {user.first_name && user.last_name && (
                <p className="text-gray-600">
                  {user.first_name} {user.last_name}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <div className="mt-1 flex space-x-2">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    user.is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {user.is_active ? 'Aktiv' : 'Inaktiv'}
                </span>
                {user.is_admin && (
                  <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800">
                    Administrator
                  </span>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email Status
              </label>
              <span
                className={`mt-1 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  user.email_verified
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {user.email_verified ? 'Verifiziert' : 'Unverifiziert'}
              </span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Erstellt am
              </label>
              <p className="mt-1 text-sm text-gray-900">
                {new Date(user.created_at).toLocaleString('de-DE')}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                User ID
              </label>
              <p className="mt-1 text-sm text-gray-900">#{user.id}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
          >
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
};

interface RateLimitModalProps {
  isOpen: boolean;
  user: AdminUser | null;
  onClose: () => void;
}

const RateLimitModal: React.FC<RateLimitModalProps> = ({
  isOpen,
  user,
  onClose,
}) => {
  const [rateLimitStats, setRateLimitStats] =
    useState<UserRateLimitStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchRateLimitStats = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const stats = await apiClient.admin.getUserRateLimitStats(user.id);
      setRateLimitStats(stats);
    } catch (error) {
      toast.error('Fehler beim Laden der Rate Limit Statistiken');
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const handleClearRateLimits = async (contentType?: string) => {
    if (!user) return;

    try {
      await apiClient.admin.clearUserRateLimits(user.id, contentType);
      toast.success(
        contentType
          ? `Rate Limits für ${contentType} gelöscht`
          : 'Alle Rate Limits für User gelöscht'
      );
      await fetchRateLimitStats();
    } catch (error) {
      toast.error('Fehler beim Löschen der Rate Limits');
      console.log(error);
    }
  };

  useEffect(() => {
    if (isOpen && user) {
      fetchRateLimitStats();
    }
  }, [isOpen, user, fetchRateLimitStats]);

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-3xl rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            Rate Limits für {user.display_name}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XCircle className="h-6 w-6" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex h-32 items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin text-indigo-600" />
          </div>
        ) : rateLimitStats ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Letzte Aktualisierung:{' '}
                {new Date(rateLimitStats.timestamp).toLocaleString('de-DE')}
              </p>
              <button
                onClick={() => handleClearRateLimits()}
                className="rounded-md bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
              >
                Alle Rate Limits löschen
              </button>
            </div>

            {Object.keys(rateLimitStats.active_lockouts).length > 0 && (
              <div>
                <h3 className="mb-3 text-lg font-medium text-gray-900">
                  Aktive Lockouts
                </h3>
                <div className="space-y-2">
                  {Object.entries(rateLimitStats.active_lockouts).map(
                    ([contentType, unlockTime]) => (
                      <div
                        key={contentType}
                        className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-3"
                      >
                        <div>
                          <span className="font-medium text-red-900">
                            {contentType}
                          </span>
                          <p className="text-sm text-red-700">
                            Gesperrt bis:{' '}
                            {new Date(unlockTime * 1000).toLocaleString(
                              'de-DE'
                            )}
                          </p>
                        </div>
                        <button
                          onClick={() => handleClearRateLimits(contentType)}
                          className="text-sm text-red-600 hover:text-red-800"
                        >
                          Entsperren
                        </button>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            <div>
              <h3 className="mb-3 text-lg font-medium text-gray-900">
                Content Usage
              </h3>
              {Object.keys(rateLimitStats.content_usage).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(rateLimitStats.content_usage).map(
                    ([contentType, attempts]) => (
                      <div
                        key={contentType}
                        className="rounded-lg border border-gray-200 bg-gray-50 p-4"
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <span className="font-medium text-gray-900">
                            {contentType}
                          </span>
                          <span className="text-sm text-gray-600">
                            {attempts.length} Versuche in letzter Stunde
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {attempts
                            .slice(0, 5)
                            .map(([timestamp, count], index) => (
                              <div key={index}>
                                {new Date(timestamp * 1000).toLocaleTimeString(
                                  'de-DE'
                                )}
                                : {count} Versuche
                              </div>
                            ))}
                        </div>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  Keine aktuellen Rate Limiting Aktivitäten
                </p>
              )}
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-500">
            Keine Rate Limit Daten verfügbar
          </p>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
          >
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
};

interface ConfirmActionModalProps {
  isOpen: boolean;
  user: AdminUser | null;
  action: 'activate' | 'deactivate' | 'makeAdmin' | 'removeAdmin';
  onConfirm: () => void;
  onClose: () => void;
  isLoading?: boolean;
}

const ConfirmActionModal: React.FC<ConfirmActionModalProps> = ({
  isOpen,
  user,
  action,
  onConfirm,
  onClose,
  isLoading = false,
}) => {
  if (!isOpen || !user) return null;

  const actionConfig = {
    activate: {
      title: 'User aktivieren',
      message: `Möchten Sie ${user.display_name} wirklich wieder aktivieren?`,
      confirmText: 'Aktivieren',
      confirmClass: 'bg-green-600 hover:bg-green-700',
    },
    deactivate: {
      title: 'User deaktivieren',
      message: `Möchten Sie ${user.display_name} wirklich deaktivieren? Der User kann sich dann nicht mehr einloggen.`,
      confirmText: 'Deaktivieren',
      confirmClass: 'bg-red-600 hover:bg-red-700',
    },
    makeAdmin: {
      title: 'Zum Admin machen',
      message: `Möchten Sie ${user.display_name} wirklich Admin-Rechte geben?`,
      confirmText: 'Zum Admin machen',
      confirmClass: 'bg-purple-600 hover:bg-purple-700',
    },
    removeAdmin: {
      title: 'Admin entfernen',
      message: `Möchten Sie ${user.display_name} die Admin-Rechte entziehen?`,
      confirmText: 'Admin entfernen',
      confirmClass: 'bg-orange-600 hover:bg-orange-700',
    },
  };

  const config = actionConfig[action];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-xl font-bold text-gray-900">{config.title}</h2>
        <p className="mb-6 text-gray-600">{config.message}</p>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Abbrechen
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex items-center rounded-md px-4 py-2 text-white disabled:opacity-50 ${config.confirmClass}`}
          >
            {isLoading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Lädt...
              </>
            ) : (
              config.confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export function UserManagement() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<UserSearchParams>({
    page: 1,
    size: 20,
  });
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRateLimitModal, setShowRateLimitModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    isOpen: boolean;
    user: AdminUser | null;
    action: 'activate' | 'deactivate' | 'makeAdmin' | 'removeAdmin';
  } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = async (params: UserSearchParams = {}) => {
    setIsLoading(true);
    try {
      const response = await apiClient.admin.getUsers({
        ...filters,
        ...params,
        search: searchTerm || undefined,
      });

      if (Array.isArray(response)) {
        setUsers(response);
        setTotalUsers(response.length);
      } else {
        setUsers(response.users || []);
        setTotalUsers(response.total || 0);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error('Fehler beim Laden der User-Liste');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchUsers({ page: 1 });
  };

  const handleFilterChange = (newFilters: Partial<UserSearchParams>) => {
    const updatedFilters = { ...filters, ...newFilters, page: 1 };
    setFilters(updatedFilters);
    setCurrentPage(1);
    fetchUsers(updatedFilters);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchUsers({ page });
  };

  const handleViewDetails = (user: AdminUser) => {
    setSelectedUser(user);
    setShowDetailsModal(true);
  };

  const handleViewRateLimits = (user: AdminUser) => {
    setSelectedUser(user);
    setShowRateLimitModal(true);
  };

  const handleToggleUserStatus = (user: AdminUser) => {
    setSelectedUser(user);
    setConfirmAction({
      isOpen: true,
      user,
      action: user.is_active ? 'deactivate' : 'activate',
    });
  };

  const handleToggleAdminStatus = (user: AdminUser) => {
    setSelectedUser(user);
    setConfirmAction({
      isOpen: true,
      user,
      action: user.is_admin ? 'removeAdmin' : 'makeAdmin',
    });
  };

  const handleConfirmAction = async () => {
    if (!confirmAction?.user) return;

    setActionLoading(true);
    try {
      const { user, action } = confirmAction;

      switch (action) {
        case 'activate':
          await apiClient.admin.activateUser(user.id);
          toast.success(`${user.display_name} wurde aktiviert`);
          break;
        case 'deactivate':
          await apiClient.admin.deactivateUser(
            user.id,
            'Deaktiviert durch Admin'
          );
          toast.success(`${user.display_name} wurde deaktiviert`);
          break;
        case 'makeAdmin':
          await apiClient.admin.updateAdminStatus(user.id, true);
          toast.success(`${user.display_name} ist jetzt Admin`);
          break;
        case 'removeAdmin':
          await apiClient.admin.updateAdminStatus(user.id, false);
          toast.success(`${user.display_name} ist kein Admin mehr`);
          break;
      }

      await fetchUsers();
      setConfirmAction(null);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Aktion fehlgeschlagen';
      toast.error(message);
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const totalPages = Math.ceil(totalUsers / (filters.size || 20));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-sm text-gray-600">
            Verwalte Community-Mitglieder und ihre Rate Limits
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">
            {totalUsers} User gesamt
          </span>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex-1">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              User suchen
            </label>
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Name, Email oder Display Name..."
                  className="w-full rounded-md border border-gray-300 px-3 py-2 pl-10 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                />
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              </div>
              <button
                onClick={handleSearch}
                className="rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
              >
                Suchen
              </button>
            </div>
          </div>

          <div className="flex items-end space-x-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                value={filters.is_active?.toString() || ''}
                onChange={(e) =>
                  handleFilterChange({
                    is_active:
                      e.target.value === ''
                        ? undefined
                        : e.target.value === 'true',
                  })
                }
                className="rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Alle</option>
                <option value="true">Aktiv</option>
                <option value="false">Inaktiv</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Email Status
              </label>
              <select
                value={filters.email_verified?.toString() || ''}
                onChange={(e) =>
                  handleFilterChange({
                    email_verified:
                      e.target.value === ''
                        ? undefined
                        : e.target.value === 'true',
                  })
                }
                className="rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Alle</option>
                <option value="true">Verifiziert</option>
                <option value="false">Unverifiziert</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Admin Status
              </label>
              <select
                value={filters.is_admin?.toString() || ''}
                onChange={(e) =>
                  handleFilterChange({
                    is_admin:
                      e.target.value === ''
                        ? undefined
                        : e.target.value === 'true',
                  })
                }
                className="rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Alle</option>
                <option value="true">Admins</option>
                <option value="false">User</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-32 items-center justify-center">
          <RefreshCw className="h-6 w-6 animate-spin text-indigo-600" />
        </div>
      ) : users.length > 0 ? (
        <div className="space-y-4">
          {users.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              onViewDetails={handleViewDetails}
              onViewRateLimits={handleViewRateLimits}
              onToggleStatus={handleToggleUserStatus}
              onToggleAdmin={handleToggleAdminStatus}
            />
          ))}
        </div>
      ) : (
        <div className="py-12 text-center">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Keine User gefunden
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm
              ? 'Versuche andere Suchbegriffe'
              : 'Noch keine User registriert'}
          </p>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Zurück
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Weiter
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Zeige{' '}
                <span className="font-medium">
                  {(currentPage - 1) * (filters.size || 20) + 1}
                </span>{' '}
                bis{' '}
                <span className="font-medium">
                  {Math.min(currentPage * (filters.size || 20), totalUsers)}
                </span>{' '}
                von <span className="font-medium">{totalUsers}</span> Usern
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="relative inline-flex items-center rounded-l-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Zurück
                </button>

                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`relative inline-flex items-center border px-4 py-2 text-sm font-medium ${
                        currentPage === pageNum
                          ? 'z-10 border-indigo-500 bg-indigo-50 text-indigo-600'
                          : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className="relative inline-flex items-center rounded-r-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Weiter
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      <UserDetailsModal
        isOpen={showDetailsModal}
        user={selectedUser}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedUser(null);
        }}
      />

      <RateLimitModal
        isOpen={showRateLimitModal}
        user={selectedUser}
        onClose={() => {
          setShowRateLimitModal(false);
          setSelectedUser(null);
        }}
      />
      {confirmAction && (
        <ConfirmActionModal
          isOpen={confirmAction.isOpen}
          user={confirmAction.user}
          action={confirmAction.action}
          onConfirm={handleConfirmAction}
          onClose={() => setConfirmAction(null)}
          isLoading={actionLoading}
        />
      )}
    </div>
  );
}
