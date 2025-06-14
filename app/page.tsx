import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Music, Sparkles, TrendingUp, Users } from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white">
      {/* Navigation */}
      <nav className="border-b border-gray-800 bg-[#0D0D0D]/80 backdrop-blur-xs">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-linear-to-br from-[#1DB954] to-[#00FFC2] flex items-center justify-center">
                <Music className="h-5 w-5 text-black" />
              </div>
              <span className="text-xl font-bold">SpotifyWrapped</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-linear-to-r from-white via-[#00FFC2] to-[#33BBFF] bg-clip-text text-transparent">
              Your Week in Music
            </h1>
            <p className="text-xl md:text-2xl text-[#A1A1A1] mb-8 leading-relaxed">
              Discover your weekly listening patterns, top artists, and get an AI-generated music persona that captures
              your unique taste.
            </p>
          </div>

          {/* CTA Button */}
          <div className="mb-16">
            <Link href="/loading">
              <Button
                size="lg"
                className="bg-[#1DB954] hover:bg-[#1ed760] text-black font-semibold px-8 py-4 text-lg rounded-2xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(29,185,84,0.5)] hover:scale-105"
              >
                <Music className="mr-2 h-5 w-5" />
                Connect with Spotify
              </Button>
            </Link>
          </div>

          {/* Preview Image */}
          <div className="relative">
            <Card className="bg-linear-to-br from-gray-900/50 to-gray-800/30 border-gray-700 p-8 rounded-3xl backdrop-blur-xs">
              <div className="aspect-video bg-linear-to-br from-[#1DB954]/20 to-[#00FFC2]/20 rounded-2xl flex items-center justify-center border border-gray-700">
                <div className="text-center">
                  <Sparkles className="h-16 w-16 text-[#00FFC2] mx-auto mb-4" />
                  <p className="text-[#A1A1A1] text-lg">Preview of your personalized music summary</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="bg-linear-to-br from-gray-900/50 to-gray-800/30 border-gray-700 p-8 rounded-3xl backdrop-blur-xs hover:shadow-[0_0_30px_rgba(0,255,194,0.1)] transition-all duration-300">
            <TrendingUp className="h-12 w-12 text-[#00FFC2] mb-6" />
            <h3 className="text-2xl font-bold mb-4">Top Tracks & Artists</h3>
            <p className="text-[#A1A1A1] leading-relaxed">
              See your most played songs and artists from the past week with beautiful visualizations and play counts.
            </p>
          </Card>

          <Card className="bg-linear-to-br from-gray-900/50 to-gray-800/30 border-gray-700 p-8 rounded-3xl backdrop-blur-xs hover:shadow-[0_0_30px_rgba(51,187,255,0.1)] transition-all duration-300">
            <Sparkles className="h-12 w-12 text-[#33BBFF] mb-6" />
            <h3 className="text-2xl font-bold mb-4">AI Music Persona</h3>
            <p className="text-[#A1A1A1] leading-relaxed">
              Get a personalized AI-generated description of your music taste and listening personality.
            </p>
          </Card>

          <Card className="bg-linear-to-br from-gray-900/50 to-gray-800/30 border-gray-700 p-8 rounded-3xl backdrop-blur-xs hover:shadow-[0_0_30px_rgba(29,185,84,0.1)] transition-all duration-300">
            <Users className="h-12 w-12 text-[#1DB954] mb-6" />
            <h3 className="text-2xl font-bold mb-4">Share & Compare</h3>
            <p className="text-[#A1A1A1] leading-relaxed">
              Share your music summary on social media and compare your taste with friends.
            </p>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-[#A1A1A1]">Made with ❤️ for music lovers. Not affiliated with Spotify.</p>
        </div>
      </footer>
    </div>
  );
}
