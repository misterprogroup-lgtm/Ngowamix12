'use client';

import Link from 'next/link';
import { Music, Ticket, FileAudio, ArrowRight, Disc } from 'lucide-react';

const uploadOptions = [
  {
    href: '/artist/catalog',
    icon: Music,
    title: 'Nouvel album / Single',
    description: 'Créez un album, un single ou un EP et ajoutez vos morceaux.',
    gradient: 'from-primary/20 via-primary/5 to-transparent',
    border: 'border-primary/20 hover:border-primary/50',
    iconBg: 'bg-primary/10 text-primary',
  },
  {
    href: '/artist/catalog?tab=concerts',
    icon: Ticket,
    title: 'Nouveau concert',
    description: 'Publiez un concert, configurez les billets et la billetterie.',
    gradient: 'from-[#8b5cf6]/20 via-[#8b5cf6]/5 to-transparent',
    border: 'border-[#8b5cf6]/20 hover:border-[#8b5cf6]/50',
    iconBg: 'bg-[#8b5cf6]/10 text-[#8b5cf6]',
  },
  {
    href: '/artist/catalog',
    icon: FileAudio,
    title: 'Ajouter un morceau',
    description: 'Importez un fichier audio et rattachez-le à un album existant.',
    gradient: 'from-[#22c55e]/20 via-[#22c55e]/5 to-transparent',
    border: 'border-[#22c55e]/20 hover:border-[#22c55e]/50',
    iconBg: 'bg-[#22c55e]/10 text-[#22c55e]',
  },
];

export default function ArtistUploadPage() {
  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-3xl px-4 pt-8 pb-28">
        <div className="mb-10">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-3">
            Publier votre musique
          </h1>
          <p className="text-white text-sm md:text-base">
            Choisissez ce que vous souhaitez publier parmi les options ci-dessous.
          </p>
        </div>

        <div className="space-y-4">
          {uploadOptions.map((option) => {
            const Icon = option.icon;
            return (
              <Link
                key={option.href}
                href={option.href}
                className={`group relative block rounded-2xl border ${option.border} bg-gradient-to-br ${option.gradient} p-6 md:p-8 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] overflow-hidden`}
              >
                <div className="absolute top-0 right-0 w-32 h-32 opacity-[0.03] rounded-full blur-3xl bg-white -translate-y-1/2 translate-x-1/2" />
                <div className="flex items-start gap-5 relative z-10">
                  <div className={`shrink-0 h-14 w-14 rounded-2xl ${option.iconBg} flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}>
                    <Icon className="h-7 w-7" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-4">
                      <h2 className="text-lg md:text-xl font-bold text-white">
                        {option.title}
                      </h2>
                      <ArrowRight className="h-5 w-5 text-white group-hover:text-primary transition-colors shrink-0" />
                    </div>
                    <p className="text-sm text-white mt-1.5 leading-relaxed">
                      {option.description}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
