import { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Camera, Pencil, Check, X, Trash2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useAvatar } from '@/context/AvatarContext';
import { getPlayerSummary } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { computeAge } from '@/lib/utils';
import { PageTransition } from '@/components/PageTransition';

export default function Profile() {
  const { player, signIn } = useAuth();
  const { getAvatar, setAvatar, removeAvatar } = useAvatar();

  if (!player) return null;

  const p = player;

  const avatarUrl = getAvatar(p.id);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const summaryQuery = useQuery({
    queryKey: ['player', p.id, 'summary'],
    queryFn: () => getPlayerSummary(p.id),
  });

  const summary = summaryQuery.data;
  const age = computeAge(p.dob);

  // Editable fields
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState('');

  const startEdit = (field: string, currentValue: string) => {
    setEditing(field);
    setDraft(currentValue);
  };

  const saveEdit = () => {
    if (!editing || !draft.trim()) return;
    const updated = { ...p, [editing]: draft.trim() };
    signIn(updated);
    setEditing(null);
    setDraft('');
  };

  const cancelEdit = () => {
    setEditing(null);
    setDraft('');
  };

  // Avatar upload
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    if (!file.type.startsWith('image/')) return;

    // Resize and store as data URL
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX = 256;
        let w = img.width;
        let h = img.height;
        if (w > h) {
          if (w > MAX) { h = (h * MAX) / w; w = MAX; }
        } else {
          if (h > MAX) { w = (w * MAX) / h; h = MAX; }
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, w, h);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setAvatar(p.id, dataUrl);
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);

    // Reset input so same file can be re-selected
    e.target.value = '';
  };

  return (
    <PageTransition>
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">Your player card</p>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* ── Player Card ────────────────────────────────── */}
      <div className="flex justify-center">
        <div className="w-full max-w-xs">
          <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-sky-300 via-sky-400 to-cyan-400 shadow-xl dark:from-sky-700 dark:via-sky-800 dark:to-cyan-900">
            {/* Logo */}
            <div className="flex justify-center pt-5">
              <img
                src="/toca-logo.png"
                alt="TOCA"
                className="h-5 w-auto object-contain brightness-0 opacity-70"
              />
            </div>

            {/* Profile picture */}
            <div className="flex justify-center py-6">
              <div className="relative">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={`${p.firstName} ${p.lastName}`}
                    className="h-24 w-24 rounded-full object-cover ring-2 ring-white/40"
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white/30 backdrop-blur-sm dark:bg-white/10">
                    <span className="text-3xl font-bold text-sky-900 dark:text-white">
                      {p.firstName[0]}{p.lastName[0]}
                    </span>
                  </div>
                )}
                {/* Camera button */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-md dark:bg-sky-800 cursor-pointer hover:scale-110 transition-transform"
                  aria-label="Upload profile picture"
                >
                  <Camera className="h-3.5 w-3.5 text-sky-700 dark:text-sky-200" />
                </button>
                {/* Remove button (only if avatar exists) */}
                {avatarUrl && (
                  <button
                    onClick={() => removeAvatar(p.id)}
                    className="absolute top-0 right-0 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 shadow-md cursor-pointer hover:scale-110 transition-transform"
                    aria-label="Remove profile picture"
                  >
                    <Trash2 className="h-3 w-3 text-white" />
                  </button>
                )}
              </div>
            </div>

            {/* Name */}
            <div className="pb-4 text-center">
              <h2 className="text-2xl font-extrabold uppercase tracking-wide text-sky-900 dark:text-white">
                {p.firstName} {p.lastName}
              </h2>
              <p className="mt-0.5 text-xs font-medium uppercase tracking-widest text-sky-900/50 dark:text-white/50">
                {p.centerName}
              </p>
            </div>

            {/* Stats */}
            <div className="border-t border-white/30 bg-white/10 dark:border-white/10 dark:bg-black/20">
              <div className="grid grid-cols-3 divide-x divide-white/30 dark:divide-white/10">
                <CardStat label="Age" value={age} />
                <CardStat label="Score" value={summary?.avgScore ?? '—'} />
                <CardStat label="Sessions" value={summary?.totalSessions ?? '—'} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Editable Info ──────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-0">
          <EditableField
            label="First Name"
            field="firstName"
            value={p.firstName}
            editing={editing}
            draft={draft}
            onStart={startEdit}
            onDraftChange={setDraft}
            onSave={saveEdit}
            onCancel={cancelEdit}
          />
          <EditableField
            label="Last Name"
            field="lastName"
            value={p.lastName}
            editing={editing}
            draft={draft}
            onStart={startEdit}
            onDraftChange={setDraft}
            onSave={saveEdit}
            onCancel={cancelEdit}
          />
          <EditableField
            label="Email"
            field="email"
            value={p.email}
            editing={editing}
            draft={draft}
            onStart={startEdit}
            onDraftChange={setDraft}
            onSave={saveEdit}
            onCancel={cancelEdit}
          />
          <EditableField
            label="Phone"
            field="phone"
            value={p.phone}
            editing={editing}
            draft={draft}
            onStart={startEdit}
            onDraftChange={setDraft}
            onSave={saveEdit}
            onCancel={cancelEdit}
          />
          <EditableField
            label="Gender"
            field="gender"
            value={p.gender}
            editing={editing}
            draft={draft}
            onStart={startEdit}
            onDraftChange={setDraft}
            onSave={saveEdit}
            onCancel={cancelEdit}
          />
          <EditableField
            label="Date of Birth"
            field="dob"
            value={p.dob}
            editing={editing}
            draft={draft}
            onStart={startEdit}
            onDraftChange={setDraft}
            onSave={saveEdit}
            onCancel={cancelEdit}
          />
          <EditableField
            label="Training Center"
            field="centerName"
            value={p.centerName}
            editing={editing}
            draft={draft}
            onStart={startEdit}
            onDraftChange={setDraft}
            onSave={saveEdit}
            onCancel={cancelEdit}
          />
        </CardContent>
      </Card>
    </div>
    </PageTransition>
  );
}

// ─── Sub-components ──────────────────────────────────────

function CardStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="py-3 text-center">
      <p className="text-xs text-sky-900/60 dark:text-white/50">{label}</p>
      <p className="text-lg font-bold text-sky-900 dark:text-white">{value}</p>
    </div>
  );
}

function EditableField({
  label,
  field,
  value,
  editing,
  draft,
  onStart,
  onDraftChange,
  onSave,
  onCancel,
}: {
  label: string;
  field: string;
  value: string;
  editing: string | null;
  draft: string;
  onStart: (field: string, value: string) => void;
  onDraftChange: (v: string) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  const isEditing = editing === field;

  return (
    <div className="flex items-center gap-3 border-b border-border py-3 last:border-b-0">
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        {isEditing ? (
          <Input
            value={draft}
            onChange={(e) => onDraftChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSave();
              if (e.key === 'Escape') onCancel();
            }}
            className="mt-1 h-8 text-sm"
            autoFocus
          />
        ) : (
          <p className="text-sm font-medium truncate">{value}</p>
        )}
      </div>
      {isEditing ? (
        <div className="flex shrink-0 gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onSave} aria-label={`Save ${label}`}>
            <Check className="h-3.5 w-3.5 text-emerald-600" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onCancel} aria-label={`Cancel editing ${label}`}>
            <X className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
        </div>
      ) : (
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 shrink-0"
          onClick={() => onStart(field, value)}
          aria-label={`Edit ${label}`}
        >
          <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
        </Button>
      )}
    </div>
  );
}
