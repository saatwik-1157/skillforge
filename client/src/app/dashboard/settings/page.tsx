'use client';

import * as React from 'react';
import { Camera, Loader2, Save, UserCog } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar } from '@/components/ui/avatar';
import { PageHeader, Spinner } from '@/components/shared/states';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

interface Profile {
  id: string;
  name: string;
  email: string;
  bio: string | null;
  location: string | null;
  phone: string | null;
  avatarUrl: string | null;
}

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);

  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(null);
  const [form, setForm] = React.useState({ name: '', bio: '', location: '', phone: '' });
  const fileRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    let alive = true;
    api
      .get<Profile>('/users/me/profile')
      .then((res) => {
        if (!alive) return;
        setForm({
          name: res.data.name ?? '',
          bio: res.data.bio ?? '',
          location: res.data.location ?? '',
          phone: res.data.phone ?? '',
        });
        setAvatarUrl(res.data.avatarUrl ?? null);
      })
      .catch((err) => {
        if (alive) setError(err?.message ?? 'Failed to load your profile');
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      const res = await api.put<Profile>('/users/me/profile', {
        name: form.name.trim(),
        bio: form.bio.trim() || undefined,
        location: form.location.trim() || undefined,
        phone: form.phone.trim() || undefined,
      });
      updateUser({ name: res.data.name });
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not save profile');
    } finally {
      setSaving(false);
    }
  }

  async function onAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch(`${API_URL}/users/me/avatar`, {
        method: 'POST',
        credentials: 'include',
        headers: { Authorization: `Bearer ${useAuthStore.getState().accessToken ?? ''}` },
        body: fd,
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok || body?.success === false) {
        throw new Error(body?.message ?? 'Upload failed');
      }
      const newUrl: string | null = body?.data?.avatarUrl ?? null;
      setAvatarUrl(newUrl);
      updateUser({ avatarUrl: newUrl });
      toast.success('Profile photo updated');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not upload photo');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader title="Settings" description="Manage your profile and public information." />

      {loading ? (
        <Spinner />
      ) : error ? (
        <Card>
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            <UserCog className="mx-auto mb-3 h-8 w-8 text-muted-foreground/60" />
            {error}
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Avatar */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Profile photo</CardTitle>
              <CardDescription>PNG or JPG, shown across SkillForge.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center gap-5">
              <Avatar src={avatarUrl} name={form.name || user?.name} className="h-20 w-20 text-2xl" />
              <div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  onChange={onAvatarChange}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  disabled={uploading}
                  onClick={() => fileRef.current?.click()}
                >
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                  {uploading ? 'Uploading…' : 'Change photo'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Profile form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Personal details</CardTitle>
              <CardDescription>This information appears on your public profile.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={saveProfile} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="name">Full name</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => set('name', e.target.value)}
                    placeholder="Your name"
                    required
                    minLength={2}
                    maxLength={80}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={form.bio}
                    onChange={(e) => set('bio', e.target.value)}
                    placeholder="Tell others about yourself and your goals…"
                    rows={4}
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-foreground">{form.bio.length}/500</p>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={form.location}
                      onChange={(e) => set('location', e.target.value)}
                      placeholder="City, State"
                      maxLength={120}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={form.phone}
                      onChange={(e) => set('phone', e.target.value)}
                      placeholder="+91 98765 43210"
                      maxLength={20}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={user?.email ?? ''} disabled readOnly />
                  <p className="text-xs text-muted-foreground">
                    Your email address can&apos;t be changed here.
                  </p>
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={saving} className="gap-1.5">
                    {saving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    {saving ? 'Saving…' : 'Save changes'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
