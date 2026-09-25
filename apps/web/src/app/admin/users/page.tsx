'use client';

import { useCallback, useEffect, useState } from 'react';
import { Search, Users as UsersIcon, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { api, ApiClientError } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { Spinner, EmptyState, PageHeader } from '@/components/shared/states';
import { AdminPagination, type Pagination } from '@/components/shared/admin-pagination';
import { cn } from '@/lib/utils';

type Role = 'VISITOR' | 'ENTREPRENEUR' | 'MENTOR' | 'ADMIN';
const ROLES: Role[] = ['VISITOR', 'ENTREPRENEUR', 'MENTOR', 'ADMIN'];

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  isEmailVerified: boolean;
  avatarUrl: string | null;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [items, setItems] = useState<AdminUser[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [q, setQ] = useState('');
  const [roleFilter, setRoleFilter] = useState<Role | ''>('');
  const [page, setPage] = useState(1);
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      if (roleFilter) params.set('role', roleFilter);
      params.set('page', String(page));
      params.set('limit', '20');
      const res = await api.get<{ items: AdminUser[] }>(`/admin/users?${params.toString()}`);
      setItems(res.data.items);
      setPagination(res.meta?.pagination ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [q, roleFilter, page]);

  useEffect(() => {
    load();
  }, [load]);

  function onSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    setQ(search.trim());
  }

  async function patchUser(user: AdminUser, body: { isActive?: boolean; role?: Role }) {
    setSavingId(user.id);
    // Optimistic update.
    setItems((prev) => prev.map((u) => (u.id === user.id ? { ...u, ...body } : u)));
    try {
      await api.patch(`/admin/users/${user.id}`, body);
      toast.success('User updated');
    } catch (err) {
      // Roll back on failure.
      setItems((prev) => prev.map((u) => (u.id === user.id ? user : u)));
      toast.error(err instanceof ApiClientError ? err.message : 'Update failed');
    } finally {
      setSavingId(null);
    }
  }

  return (
    <>
      <PageHeader title="Users" description="Search, deactivate, and manage roles across all accounts." />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <form onSubmit={onSearchSubmit} className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="pl-9"
          />
        </form>
        <select
          value={roleFilter}
          onChange={(e) => {
            setPage(1);
            setRoleFilter(e.target.value as Role | '');
          }}
          className="h-11 rounded-xl border border-border bg-background px-3 text-sm"
        >
          <option value="">All roles</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <Spinner />
      ) : error ? (
        <EmptyState icon={UsersIcon} title="Couldn't load users" description={error} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={UsersIcon}
          title="No users found"
          description="Try a different search term or role filter."
        />
      ) : (
        <>
          <Card className="overflow-hidden rounded-2xl">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-4 py-3 font-medium">User</th>
                    <th className="px-4 py-3 font-medium">Role</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((u) => (
                    <tr key={u.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar src={u.avatarUrl ?? undefined} name={u.name} />
                          <div className="min-w-0">
                            <p className="truncate font-semibold">{u.name}</p>
                            <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={u.role}
                          disabled={savingId === u.id}
                          onChange={(e) => patchUser(u, { role: e.target.value as Role })}
                          className="h-9 rounded-lg border border-border bg-background px-2 text-sm disabled:opacity-50"
                        >
                          {ROLES.map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        {u.isActive ? (
                          <Badge variant="success">Active</Badge>
                        ) : (
                          <Badge variant="muted">Inactive</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end">
                          <Button
                            variant={u.isActive ? 'outline' : 'default'}
                            size="sm"
                            disabled={savingId === u.id}
                            onClick={() => patchUser(u, { isActive: !u.isActive })}
                            className={cn(u.isActive && 'text-destructive')}
                          >
                            {u.isActive ? (
                              <>
                                <XCircle className="h-4 w-4" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="h-4 w-4" />
                                Activate
                              </>
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {pagination && <AdminPagination pagination={pagination} onPageChange={setPage} />}
        </>
      )}
    </>
  );
}
