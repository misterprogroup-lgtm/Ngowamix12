'use client';

import { useEffect, useState } from 'react';
import { SafeImage } from '@/components/ui/safe-image';
import { User, Save, Instagram, Twitter, Facebook, Youtube, Camera, Shield, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { COUNTRIES, GENRES } from '@/lib/constants';

export default function ArtistProfilePage() {
  const [data, setData] = useState({
    name: '',
    bio: '',
    country: '',
    genres: '',
    socialLinks: { instagram: '', twitter: '', facebook: '', youtube: '' },
    coverImage: '',
  });
  const [verificationStatus, setVerificationStatus] = useState('NONE');
  const [verificationRequestedAt, setVerificationRequestedAt] = useState<string | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const fetchProfile = () => {
    fetch('/api/artist/dashboard')
      .then((res) => res.json())
      .then((res) => {
        if (res.artist) {
          setData({
            name: res.artist.name || '',
            bio: res.artist.bio || '',
            country: res.artist.country || '',
            genres: res.artist.genres || '',
            socialLinks: res.artist.socialLinks ? (typeof res.artist.socialLinks === 'string' ? JSON.parse(res.artist.socialLinks) : res.artist.socialLinks) : { instagram: '', twitter: '', facebook: '', youtube: '' },
            coverImage: res.artist.coverImage || '',
          });
          setAvatarPreview(res.artist.avatar || null);
          setCoverPreview(res.artist.coverImage || null);
          setVerificationStatus(res.artist.verificationStatus || 'NONE');
          setVerificationRequestedAt(res.artist.verificationRequestedAt || null);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const fd = new FormData();
      fd.append('name', data.name);
      fd.append('bio', data.bio);
      fd.append('country', data.country);
      fd.append('genres', data.genres);
      fd.append('socialLinks', JSON.stringify(data.socialLinks));
      if (coverFile) fd.append('coverImage', coverFile);
      else if (coverPreview) fd.append('coverImage', coverPreview);
      else fd.append('coverImage', '');
      if (avatarFile) fd.append('avatar', avatarFile);
      else if (!avatarPreview) fd.append('avatar', '');

      const res = await fetch('/api/artist/profile', {
        method: 'PUT',
        body: fd,
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Erreur lors de la sauvegarde');
      }
      setMessage('Profil mis à jour avec succès');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Erreur');
    } finally {
      setSaving(false);
    }
  };

  const requestVerification = async () => {
    setIsRequesting(true);
    setMessage('');
    try {
      const res = await fetch('/api/artist/verification', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setVerificationStatus('PENDING');
        setVerificationRequestedAt(data.artist.verificationRequestedAt);
        setMessage('Demande de vérification envoyée');
      } else {
        setMessage(data.error || 'Erreur lors de la demande');
      }
    } catch {
      setMessage('Erreur de connexion');
    } finally {
      setIsRequesting(false);
    }
  };

  const verificationIcon = {
    NONE: <Shield className="h-5 w-5 text-text-muted" />,
    PENDING: <Clock className="h-5 w-5 text-warning" />,
    VERIFIED: <CheckCircle2 className="h-5 w-5 text-primary" />,
    REJECTED: <XCircle className="h-5 w-5 text-error" />,
  };

  const verificationBadge = {
    NONE: <Badge variant="secondary">Non vérifié</Badge>,
    PENDING: <Badge variant="warning">En attente</Badge>,
    VERIFIED: <Badge variant="success">Vérifié</Badge>,
    REJECTED: <Badge variant="error">Rejeté</Badge>,
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-10 w-48 bg-surface-hover rounded-sm" />
        <div className="space-y-4">
          <div className="h-12 bg-surface-hover rounded-sm" />
          <div className="h-32 bg-surface-hover rounded-sm" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <User className="h-6 w-6 text-primary" />
        Profil artiste
      </h1>

      {message && (
        <div className={`rounded-lg border p-3 text-sm mb-6 ${
          message.includes('succès')
            ? 'border-primary/30 bg-primary/10 text-primary'
            : 'border-error/30 bg-error/10 text-error'
        }`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSave} className="max-w-2xl space-y-6">
        {/* Verification Status */}
        <div className="rounded-xl border border-border bg-surface p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {verificationIcon[verificationStatus as keyof typeof verificationIcon]}
              <div>
                <h2 className="font-medium">Vérification du compte</h2>
                {verificationRequestedAt && (
                  <p className="text-xs text-text-muted">
                    Demandé le {new Date(verificationRequestedAt).toLocaleDateString('fr-FR')}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              {verificationBadge[verificationStatus as keyof typeof verificationBadge]}
              {verificationStatus === 'NONE' && (
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  isLoading={isRequesting}
                  onClick={requestVerification}
                >
                  Demander la vérification
                </Button>
              )}
              {verificationStatus === 'REJECTED' && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  isLoading={isRequesting}
                  onClick={requestVerification}
                >
                  Refaire une demande
                </Button>
              )}
            </div>
          </div>
          {verificationStatus === 'VERIFIED' && (
            <p className="text-sm text-text-secondary mt-3">
              Votre compte artiste est vérifié. Un badge de vérification apparaît sur votre profil public.
            </p>
          )}
          {verificationStatus === 'PENDING' && (
            <p className="text-sm text-text-secondary mt-3">
              Votre demande est en cours d'examen par l'administration. Vous serez informé lorsqu'elle sera traitée.
            </p>
          )}
          {verificationStatus === 'REJECTED' && (
            <p className="text-sm text-text-secondary mt-3">
              Votre demande a été rejetée. Vous pouvez soumettre une nouvelle demande en complétant davantage votre profil.
            </p>
          )}
        </div>

        {/* Avatar */}
        <div className="flex items-center gap-6">
          <div className="relative h-24 w-24 rounded-full bg-surface-hover overflow-hidden">
              {avatarPreview ? (
                <SafeImage
                  src={avatarPreview}
                  alt="Avatar"
                  fill
                  className="object-cover"
                  sizes="128px"
                  fallback={<div className="flex h-full items-center justify-center text-text-muted"><User className="h-10 w-10" /></div>}
                />
            ) : (
              <div className="flex h-full items-center justify-center text-text-muted">
                <User className="h-10 w-10" />
              </div>
            )}
          </div>
          <div>
            <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-surface text-sm font-medium text-text-secondary hover:bg-surface-hover transition-colors cursor-pointer">
              <Camera className="h-4 w-4" />
              Changer la photo
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </label>
            <p className="text-xs text-text-muted mt-2">JPG, PNG ou WebP — Max 5MB</p>
          </div>
        </div>

        {/* Cover Image */}
        <div>
          <label className="text-sm font-medium text-text-secondary block mb-2">Photo de couverture</label>
          <div className="relative w-full h-48 rounded-xl bg-surface-hover overflow-hidden">
            {coverPreview ? (
              <SafeImage
                src={coverPreview}
                alt="Cover"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 400px"
                fallback={<div className="flex h-full items-center justify-center text-text-muted"><Camera className="h-10 w-10" /></div>}
              />
            ) : (
              <div className="flex h-full items-center justify-center text-text-muted">
                <Camera className="h-10 w-10" />
              </div>
            )}
          </div>
          <div className="mt-2">
            <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-surface text-sm font-medium text-text-secondary hover:bg-surface-hover transition-colors cursor-pointer">
              <Camera className="h-4 w-4" />
              {coverPreview ? 'Changer la couverture' : 'Ajouter une couverture'}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleCoverChange}
                className="hidden"
              />
            </label>
            {coverPreview && (
              <button
                type="button"
                onClick={() => { setCoverFile(null); setCoverPreview(null); }}
                className="ml-2 text-sm text-error hover:underline"
              >
                Supprimer
              </button>
            )}
            <p className="text-xs text-text-muted mt-1">JPG, PNG ou WebP — Max 5MB</p>
          </div>
        </div>

        <Input
          label="Nom d&apos;artiste"
          placeholder="Votre nom d'artiste"
          value={data.name}
          onChange={(e) => setData({ ...data, name: e.target.value })}
          required
        />

        <Textarea
          label="Biographie"
          placeholder="Parlez de vous..."
          value={data.bio}
          onChange={(e) => setData({ ...data, bio: e.target.value })}
          rows={5}
        />

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Pays"
            value={data.country}
            onChange={(e) => setData({ ...data, country: e.target.value })}
            options={[
              { value: '', label: 'Sélectionner un pays' },
              ...COUNTRIES.map((c) => ({ value: c, label: c })),
            ]}
          />
          <Select
            label="Genre principal"
            value={data.genres || ''}
            onChange={(e) => setData({ ...data, genres: e.target.value })}
            options={[
              { value: '', label: 'Sélectionner un genre' },
              ...GENRES.map((g) => ({ value: g, label: g })),
            ]}
          />
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium text-text-secondary">Réseaux sociaux</label>
          <Input
            label="Instagram"
            placeholder="https://instagram.com/..."
            value={data.socialLinks.instagram}
            onChange={(e) => setData({ ...data, socialLinks: { ...data.socialLinks, instagram: e.target.value } })}
          />
          <Input
            label="Twitter / X"
            placeholder="https://twitter.com/..."
            value={data.socialLinks.twitter}
            onChange={(e) => setData({ ...data, socialLinks: { ...data.socialLinks, twitter: e.target.value } })}
          />
          <Input
            label="Facebook"
            placeholder="https://facebook.com/..."
            value={data.socialLinks.facebook}
            onChange={(e) => setData({ ...data, socialLinks: { ...data.socialLinks, facebook: e.target.value } })}
          />
          <Input
            label="YouTube"
            placeholder="https://youtube.com/..."
            value={data.socialLinks.youtube}
            onChange={(e) => setData({ ...data, socialLinks: { ...data.socialLinks, youtube: e.target.value } })}
          />
        </div>

        <Button type="submit" variant="primary" size="lg" isLoading={saving}>
          <Save className="h-4 w-4 mr-2" />
          Enregistrer
        </Button>
      </form>
    </div>
  );
}
