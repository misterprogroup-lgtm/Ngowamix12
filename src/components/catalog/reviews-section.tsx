'use client';

import { useEffect, useState } from 'react';
import { Star, Send, Trash2, Edit, X } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/feedback/toast';
import { formatDate, cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth-store';

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: {
    id: string;
    displayName: string | null;
    avatar: string | null;
    role: string;
  };
}

interface ReviewsSectionProps {
  albumId: string;
}

function StarRating({ rating, interactive, onChange, size = 'md' }: {
  rating: number;
  interactive?: boolean;
  onChange?: (r: number) => void;
  size?: 'sm' | 'md' | 'lg';
}) {
  const [hover, setHover] = useState(0);
  const sizeClass = size === 'lg' ? 'h-7 w-7' : size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          className={cn(
            'transition-colors',
            interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default',
          )}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => interactive && setHover(star)}
          onMouseLeave={() => interactive && setHover(0)}
        >
          <Star
            className={cn(
              sizeClass,
              star <= (hover || rating)
                ? 'fill-primary text-primary'
                : 'fill-none text-text-muted',
            )}
          />
        </button>
      ))}
    </div>
  );
}

export function ReviewsSection({ albumId }: ReviewsSectionProps) {
  const { user } = useAuthStore();
  const { addToast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [myRating, setMyRating] = useState(0);
  const [myComment, setMyComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/reviews?albumId=${albumId}`);
      const data = await res.json();
      setReviews(data.reviews || []);
      setAverageRating(data.averageRating || 0);
      setTotalReviews(data.totalReviews || 0);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [albumId]);

  useEffect(() => {
    if (user && reviews.length > 0) {
      const myReview = reviews.find((r) => r.user.id === user.id);
      if (myReview) {
        setMyRating(myReview.rating);
        setMyComment(myReview.comment || '');
        setShowForm(true);
      }
    }
  }, [user, reviews]);

  const handleSubmit = async () => {
    if (myRating === 0) {
      addToast({ title: 'Veuillez donner une note', type: 'error' });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          albumId,
          rating: myRating,
          comment: myComment,
        }),
      });

      if (!res.ok) throw new Error('Erreur');

      addToast({ title: editingId ? 'Avis modifié' : 'Avis publié', type: 'success' });
      setEditingId(null);
      setMyRating(0);
      setMyComment('');
      fetchReviews();
    } catch (err) {
      addToast({ title: err instanceof Error ? err.message : 'Erreur', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (reviewId: string) => {
    try {
      const res = await fetch(`/api/reviews?id=${reviewId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Erreur');
      setEditingId(null);
      setMyRating(0);
      setMyComment('');
      addToast({ title: 'Avis supprimé', type: 'success' });
      fetchReviews();
    } catch {
      addToast({ title: 'Erreur lors de la suppression', type: 'error' });
    }
  };

  const handleEdit = (review: Review) => {
    setMyRating(review.rating);
    setMyComment(review.comment || '');
    setEditingId(review.id);
    setShowForm(true);
  };

  const renderStars = (rating: number) => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            'h-4 w-4',
            star <= rating ? 'fill-primary text-primary' : 'fill-none text-text-muted',
          )}
        />
      ))}
    </div>
  );

  if (loading) {
    return (
      <section className="mt-12 pt-8 border-t border-border">
        <h2 className="text-xl font-semibold mb-6">Avis ({'...'})</h2>
        <div className="animate-pulse space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-20 bg-surface-hover rounded-xl" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="mt-12 pt-8 border-t border-border">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold">
            Avis ({totalReviews})
          </h2>
          {totalReviews > 0 && (
            <div className="flex items-center gap-2 mt-1">
              {renderStars(Math.round(averageRating))}
              <span className="text-sm text-text-secondary">
                {averageRating.toFixed(1)}/5
              </span>
            </div>
          )}
        </div>
        {user && !showForm && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowForm(true)}
          >
            <Star className="h-4 w-4 mr-1" />
            Donner mon avis
          </Button>
        )}
      </div>

      {showForm && (
        <div className="rounded-xl border border-border bg-surface p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">
              {editingId ? 'Modifier mon avis' : 'Votre avis'}
            </h3>
            <button onClick={() => { setShowForm(false); setEditingId(null); }}>
              <X className="h-4 w-4 text-text-muted hover:text-text-primary" />
            </button>
          </div>

          <div className="mb-4">
            <label className="text-sm text-text-secondary mb-2 block">Note</label>
            <StarRating rating={myRating} interactive onChange={setMyRating} size="lg" />
          </div>

          <div className="mb-4">
            <label className="text-sm text-text-secondary mb-2 block">
              Commentaire <span className="text-text-muted">(optionnel)</span>
            </label>
            <textarea
              value={myComment}
              onChange={(e) => setMyComment(e.target.value)}
              placeholder="Partagez votre avis sur cet album..."
              rows={3}
              className="w-full rounded-lg border border-border bg-background p-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
            />
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="primary"
              size="sm"
              onClick={handleSubmit}
              isLoading={isSubmitting}
              disabled={myRating === 0}
            >
              <Send className="h-4 w-4 mr-1" />
              {editingId ? 'Modifier' : 'Publier'}
            </Button>
            <button
              onClick={() => { setShowForm(false); setEditingId(null); setMyRating(0); setMyComment(''); }}
              className="text-sm text-text-secondary hover:text-text-primary"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {!user && (
        <div className="text-center py-6 text-sm text-text-secondary mb-6 rounded-xl border border-border bg-surface">
          Connectez-vous pour donner votre avis
        </div>
      )}

      {reviews.length === 0 ? (
        <p className="text-center py-6 text-text-muted text-sm">
          Aucun avis pour le moment. Soyez le premier à donner votre avis !
        </p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="rounded-xl border border-border bg-surface p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  {review.user.avatar ? (
                    <Image
                      src={review.user.avatar}
                      alt={review.user.displayName || ''}
                      width={36}
                      height={36}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium text-sm">
                      {review.user.displayName?.[0]?.toUpperCase() || '?'}
                    </div>
                  )}
                  <div>
                    <span className="font-medium text-sm">
                      {review.user.displayName || 'Utilisateur'}
                    </span>
                    <div className="flex items-center gap-2">
                      {renderStars(review.rating)}
                      <span className="text-xs text-text-muted">
                        {formatDate(review.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
                {review.user.id === user?.id && (
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleEdit(review)}
                      className="p-1 text-text-muted hover:text-primary transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(review.id)}
                      className="p-1 text-text-muted hover:text-error transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
              {review.comment && (
                <p className="mt-3 text-sm text-text-secondary whitespace-pre-wrap">
                  {review.comment}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
