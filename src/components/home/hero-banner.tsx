import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

export function HeroBanner() {
  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#141414] via-[#0b0b0b] to-[#141414] border border-[#ffffff08]">
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#ff9900] opacity-[0.03] rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-[#ff9900] opacity-[0.02] rounded-full blur-3xl" />
      <div className="relative grid md:grid-cols-2 gap-8 items-center p-8 md:p-12 lg:p-16">
        <div className="space-y-6">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black leading-tight text-white">
            The music platform{' '}
            <span className="text-[#ff9900]">empowering</span>{' '}
            artists
          </h1>
          <p className="text-base md:text-lg text-[#888] leading-relaxed max-w-md">
            Une plateforme qui aide les artistes à atteindre et engager leurs fans partout dans le monde.
          </p>
          <Button
            size="lg"
            className="bg-[#ff9900] hover:bg-[#e68a00] text-white rounded-full font-bold px-8 h-14 text-base shadow-lg shadow-[#ff9900]/25 hover:shadow-[#ff9900]/40 transition-all duration-300"
          >
            <Upload className="h-5 w-5" />
            Upload your music for FREE
          </Button>
        </div>
        <div className="hidden md:flex justify-center items-center">
          <div className="relative">
            <div className="w-64 h-[26rem] rounded-3xl border-4 border-[#222] bg-[#0b0b0b] overflow-hidden shadow-2xl">
              <div className="absolute top-0 left-0 right-0 h-6 bg-[#141414] flex items-center justify-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <div className="w-2 h-2 rounded-full bg-yellow-500" />
                <div className="w-2 h-2 rounded-full bg-green-500" />
              </div>
              <div className="mt-6 p-4 space-y-4">
                <div className="h-4 w-3/4 rounded bg-[#ff990022]" />
                <div className="h-3 w-1/2 rounded bg-[#ffffff08]" />
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="aspect-square rounded-lg bg-[#ffffff08] overflow-hidden">
                      <div className="w-full h-full bg-gradient-to-br from-[#ff990022] to-[#ff990008] flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-[#ff990033] flex items-center justify-center">
                          <div className="w-3 h-3 ml-0.5 border-l-2 border-b-2 border-transparent border-l-white border-b-white transform -rotate-45" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="h-2 w-full rounded-full bg-[#ffffff08] mt-2">
                  <div className="h-2 w-2/3 rounded-full bg-[#ff990044]" />
                </div>
              </div>
            </div>
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-[#ff9900] opacity-10 rounded-full blur-2xl" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-[#ff9900] opacity-[0.07] rounded-full blur-2xl" />
          </div>
        </div>
      </div>
    </section>
  );
}
