'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Music, RotateCcw, Crown, Play, Sparkles, Share2 } from 'lucide-react';
import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';
import type { RecentlyPlayedResponse, PersonaData } from '@/lib/spotify-types';
import { sendGAEvent } from '@next/third-parties/google';

const colors = ['#1DB954', '#00FFC2', '#33BBFF', '#FF6B6B', '#FFD93D'];

interface ArtistStats {
  name: string;
  plays: number;
  rank: number;
}

interface TrackStats {
  name: string;
  artist: string;
  plays: number;
}

export default function SummaryPage() {
  const router = useRouter();
  const t = useTranslations('summary');
  const [spotifyData, setSpotifyData] = useState<RecentlyPlayedResponse | null>(null);
  const [persona, setPersona] = useState<PersonaData | null>(null);
  const [topArtists, setTopArtists] = useState<ArtistStats[]>([]);
  const [topTracks, setTopTracks] = useState<TrackStats[]>([]);
  const [totalHours, setTotalHours] = useState(0);

  useEffect(()=>{
    sendGAEvent('event', 'view_result');
  });

  useEffect(() => {
    // sessionStorageからデータを取得
    const recentTracksData = sessionStorage.getItem('recentTracks');
    const personaData = sessionStorage.getItem('persona');

    if (!recentTracksData || !personaData) {
      router.push('/');
      return;
    }

    try {
      const parsedSpotifyData = JSON.parse(recentTracksData) as RecentlyPlayedResponse;
      const parsedPersona = JSON.parse(personaData) as PersonaData;

      setSpotifyData(parsedSpotifyData);
      setPersona(parsedPersona);

      // アーティスト統計を計算
      const artistMap = new Map<string, number>();
      parsedSpotifyData.tracks.forEach((item) => {
        const artistName = item.track.artists[0]?.name || 'Unknown Artist';
        artistMap.set(artistName, (artistMap.get(artistName) || 0) + 1);
      });

      const sortedArtists = Array.from(artistMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map((entry, index) => ({
          name: entry[0],
          plays: entry[1],
          rank: index + 1,
        }));
      setTopArtists(sortedArtists);

      // トラック統計を計算
      const trackMap = new Map<string, { artist: string; plays: number }>();
      parsedSpotifyData.tracks.forEach((item) => {
        const trackKey = item.track.name;
        const artistName = item.track.artists[0]?.name || 'Unknown Artist';

        if (!trackMap.has(trackKey)) {
          trackMap.set(trackKey, { artist: artistName, plays: 0 });
        }
        const stats = trackMap.get(trackKey)!;
        stats.plays += 1;
      });

      const sortedTracks = Array.from(trackMap.entries())
        .sort((a, b) => b[1].plays - a[1].plays)
        .slice(0, 5)
        .map((entry) => ({
          name: entry[0],
          artist: entry[1].artist,
          plays: entry[1].plays,
        }));
      setTopTracks(sortedTracks);

      // 合計時間を計算
      const totalMs = parsedSpotifyData.tracks.reduce((acc, item) => acc + item.track.duration_ms, 0);
      setTotalHours(Math.round((totalMs / (1000 * 60 * 60)) * 10) / 10);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to parse data:', error);
      router.push('/');
    }
  }, [router]);

  if (!spotifyData || !persona) {
    return null;
  }

  const chartData = topArtists.map((artist) => ({
    name: artist.name.split(' ')[0], // Shortened for chart
    plays: artist.plays,
  }));

  const handleShare = () => {
    const personaTitle = typeof persona.persona === 'string' ? persona.persona : persona.persona.title;

    // Twitterの文字数制限を考慮したテキスト作成（140文字）
    const baseText = `🎵 私の今週の音楽サマリー\n\nAI音楽ペルソナ: ${personaTitle}`;
    const stats = `\n\n聴いた曲数: ${spotifyData.total}曲`;
    const hashtags = '\n\n#WrappedYourTracks #音楽ペルソナ診断';
    const url = '\n\nhttps://wrapped-your-tracks.vercel.app/';

    // 140文字に収まるように調整
    let text = baseText;
    if ((text + stats + hashtags).length <= 140) {
      text += stats;
    }
    text += url;
    text += hashtags;

    // Twitter Intent URLを使用してシェア
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    sendGAEvent('event', 'share_result');
    window.open(tweetUrl, '_blank', 'width=550,height=420');
  };
  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-[#0D0D0D]/80 backdrop-blur-xs sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-linear-to-br from-[#1DB954] to-[#00FFC2] flex items-center justify-center">
                <Music className="h-5 w-5 text-black" />
              </div>
              <span className="text-xl font-bold">WrappedYourTracks</span>
            </Link>
            <div className="flex space-x-3">
              <Link
                href="/"
                className="inline-flex items-center justify-center px-3 py-1 text-sm font-medium rounded-md border border-gray-700 hover:bg-gray-800 transition-colors"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                {t('reanalyze')}
              </Link>
              <Button
                size="sm"
                className="bg-[#1DB954] hover:bg-[#1ed760] text-black"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4 mr-2" />
                シェア
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Title Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-linear-to-r from-white via-[#00FFC2] to-[#33BBFF] bg-clip-text text-transparent">
            {t('yourWeekInMusic')}
          </h1>
          <p className="text-xl text-[#A1A1A1]">{t('analyzedSongs', { count: spotifyData.total })}</p>
        </div>

        {/* AI Music Persona - Moved to top */}
        <div className="mb-8 max-w-4xl mx-auto">
          <Card className="bg-linear-to-br from-purple-900/30 via-gray-900/50 to-blue-900/30 border-gray-700 rounded-3xl backdrop-blur-xs">
            <CardHeader>
              <CardTitle className="text-3xl font-bold flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-[#00FFC2] mr-3" />
                {t('aiPersona.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="mb-6 px-4">
                <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-linear-to-r from-[#1DB954] via-[#00FFC2] to-[#33BBFF] bg-clip-text text-transparent">
                  {typeof persona.persona === 'string' ? persona.persona : persona.persona.title}
                </h2>
                <p className="text-lg md:text-xl text-gray-300 leading-relaxed max-w-2xl mx-auto">
                  {typeof persona.persona === 'string' ? '' : persona.persona.description}
                </p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div>
                  <p className="text-2xl font-bold text-[#1DB954]">{persona.insights.timeDistribution.morning}%</p>
                  <p className="text-sm text-[#A1A1A1]">{t('timeOfDay.morning')}</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#33BBFF]">{persona.insights.timeDistribution.afternoon}%</p>
                  <p className="text-sm text-[#A1A1A1]">{t('timeOfDay.afternoon')}</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#00FFC2]">{persona.insights.timeDistribution.evening}%</p>
                  <p className="text-sm text-[#A1A1A1]">{t('timeOfDay.evening')}</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-400">{persona.insights.timeDistribution.night}%</p>
                  <p className="text-sm text-[#A1A1A1]">{t('timeOfDay.night')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* Top Artists */}
          <Card className="bg-linear-to-br from-gray-900/50 to-gray-800/30 border-gray-700 rounded-3xl backdrop-blur-xs">
            <CardHeader>
              <CardTitle className="text-2xl font-bold flex items-center">
                <Crown className="h-6 w-6 text-[#1DB954] mr-3" />
                {t('topArtists.title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mb-6">
                {topArtists.map((artist) => (
                  <div
                    key={artist.name}
                    className="flex items-center justify-between p-4 rounded-2xl bg-gray-800/50 hover:bg-gray-800/70 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-linear-to-br from-[#1DB954] to-[#00FFC2] text-black font-bold text-sm">
                        {artist.rank}
                      </div>
                      <div>
                        <p className="font-semibold">{artist.name}</p>
                        <p className="text-sm text-[#A1A1A1]">{t('topArtists.plays', { count: artist.plays })}</p>
                      </div>
                    </div>
                    <Play className="h-5 w-5 text-[#A1A1A1] hover:text-[#1DB954] cursor-pointer transition-colors" />
                  </div>
                ))}
              </div>

              {/* Chart */}
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#A1A1A1', fontSize: 12 }} />
                    <YAxis hide />
                    <Bar dataKey="plays" radius={[8, 8, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Top Tracks */}
          <Card className="bg-linear-to-br from-gray-900/50 to-gray-800/30 border-gray-700 rounded-3xl backdrop-blur-xs">
            <CardHeader>
              <CardTitle className="text-2xl font-bold flex items-center">
                <Music className="h-6 w-6 text-[#33BBFF] mr-3" />
                {t('topTracks.title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topTracks.map((track, index) => (
                  <div
                    key={track.name}
                    className="flex items-center justify-between p-4 rounded-2xl bg-gray-800/50 hover:bg-gray-800/70 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-linear-to-br from-[#33BBFF] to-[#00FFC2] text-black font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold">{track.name}</p>
                        <p className="text-sm text-[#A1A1A1]">
                          {t('topTracks.byArtist', { artist: track.artist, plays: track.plays })}
                        </p>
                      </div>
                    </div>
                    <Play className="h-5 w-5 text-[#A1A1A1] hover:text-[#33BBFF] cursor-pointer transition-colors" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Summary */}
        <div className="mt-8 grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Card className="bg-linear-to-br from-gray-900/50 to-gray-800/30 border-gray-700 rounded-2xl backdrop-blur-xs text-center p-6">
            <h3 className="text-3xl font-bold text-[#1DB954] mb-2">{spotifyData.total}</h3>
            <p className="text-[#A1A1A1]">{t('stats.totalSongs')}</p>
          </Card>
          <Card className="bg-linear-to-br from-gray-900/50 to-gray-800/30 border-gray-700 rounded-2xl backdrop-blur-xs text-center p-6">
            <h3 className="text-3xl font-bold text-[#33BBFF] mb-2">{t('stats.hours', { hours: totalHours })}</h3>
            <p className="text-[#A1A1A1]">{t('stats.totalTime')}</p>
          </Card>
          <Card className="bg-linear-to-br from-gray-900/50 to-gray-800/30 border-gray-700 rounded-2xl backdrop-blur-xs text-center p-6">
            <h3 className="text-3xl font-bold text-[#00FFC2] mb-2">{persona.insights.uniqueArtists}</h3>
            <p className="text-[#A1A1A1]">{t('stats.uniqueArtists')}</p>
          </Card>
        </div>

        {/* Additional Stats */}
        <div className="mt-6 grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Card className="bg-linear-to-br from-gray-900/50 to-gray-800/30 border-gray-700 rounded-2xl backdrop-blur-xs text-center p-6">
            <h3 className="text-3xl font-bold text-purple-400 mb-2">{persona.insights.uniqueAlbums}</h3>
            <p className="text-[#A1A1A1]">{t('stats.uniqueAlbums')}</p>
          </Card>
          <Card className="bg-linear-to-br from-gray-900/50 to-gray-800/30 border-gray-700 rounded-2xl backdrop-blur-xs text-center p-6">
            <h3 className="text-3xl font-bold text-[#FFD93D] mb-2">{persona.insights.repeatTracks}</h3>
            <p className="text-[#A1A1A1]">{t('stats.repeatSongs')}</p>
          </Card>
          <Card className="bg-linear-to-br from-gray-900/50 to-gray-800/30 border-gray-700 rounded-2xl backdrop-blur-xs text-center p-6">
            <h3 className="text-3xl font-bold text-[#FF6B6B] mb-2">{persona.insights.diversityScore}%</h3>
            <p className="text-[#A1A1A1]">{t('stats.diversityScore')}</p>
          </Card>
        </div>

        {/* Recent Listening History */}
        <div className="mt-8 max-w-4xl mx-auto">
          <Card className="bg-linear-to-br from-gray-900/50 to-gray-800/30 border-gray-700 rounded-3xl backdrop-blur-xs">
            <CardHeader>
              <CardTitle className="text-2xl font-bold flex items-center">
                <Music className="h-6 w-6 text-[#FFD93D] mr-3" />
                {t('recentHistory', { count: spotifyData.total })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {spotifyData.tracks.map((item, index) => {
                  const playedDate = new Date(item.playedAt);
                  const timeString = playedDate.toLocaleTimeString('ja-JP', {
                    hour: '2-digit',
                    minute: '2-digit',
                  });
                  const dateString = playedDate.toLocaleDateString('ja-JP', {
                    month: 'short',
                    day: 'numeric',
                  });

                  return (
                    <div
                      key={`${item.track.id}-${index}`}
                      className="flex items-center justify-between p-3 rounded-xl bg-gray-800/30 hover:bg-gray-800/50 transition-colors"
                    >
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-700 text-xs font-medium text-gray-400">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{item.track.name}</p>
                          <p className="text-sm text-[#A1A1A1] truncate">
                            {item.track.artists[0]?.name} • {item.track.album.name}
                          </p>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-sm text-[#A1A1A1]">{timeString}</p>
                        <p className="text-xs text-gray-500">{dateString}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
