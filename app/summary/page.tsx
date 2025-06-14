"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Music, Share2, RotateCcw, Crown, Play, Sparkles } from "lucide-react"
import Link from "next/link"
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from "recharts"

// Mock data
const topArtists = [
  { name: "The Weeknd", plays: 47, rank: 1 },
  { name: "Daft Punk", plays: 32, rank: 2 },
  { name: "Tame Impala", plays: 28, rank: 3 },
  { name: "Arctic Monkeys", plays: 24, rank: 4 },
  { name: "Radiohead", plays: 19, rank: 5 },
]

const topTracks = [
  { name: "Blinding Lights", artist: "The Weeknd", plays: 12 },
  { name: "One More Time", artist: "Daft Punk", plays: 9 },
  { name: "The Less I Know The Better", artist: "Tame Impala", plays: 8 },
  { name: "Do I Wanna Know?", artist: "Arctic Monkeys", plays: 7 },
  { name: "Paranoid Android", artist: "Radiohead", plays: 6 },
]

const chartData = topArtists.map((artist) => ({
  name: artist.name.split(" ")[0], // Shortened for chart
  plays: artist.plays,
}))

const colors = ["#1DB954", "#00FFC2", "#33BBFF", "#FF6B6B", "#FFD93D"]

export default function SummaryPage() {
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
              <span className="text-xl font-bold">SpotifyWrapped</span>
            </Link>
            <div className="flex space-x-3">
              <Button variant="outline" size="sm" className="border-gray-700 hover:bg-gray-800">
                <RotateCcw className="h-4 w-4 mr-2" />
                Re-analyze
              </Button>
              <Button size="sm" className="bg-[#1DB954] hover:bg-[#1ed760] text-black">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Title Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-linear-to-r from-white via-[#00FFC2] to-[#33BBFF] bg-clip-text text-transparent">
            Your Week in Music
          </h1>
          <p className="text-xl text-[#A1A1A1]">December 6-12, 2024</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* Top Artists */}
          <Card className="bg-linear-to-br from-gray-900/50 to-gray-800/30 border-gray-700 rounded-3xl backdrop-blur-xs">
            <CardHeader>
              <CardTitle className="text-2xl font-bold flex items-center">
                <Crown className="h-6 w-6 text-[#1DB954] mr-3" />
                Top Artists
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
                        <p className="text-sm text-[#A1A1A1]">{artist.plays} plays</p>
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
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#A1A1A1", fontSize: 12 }} />
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
                Top Tracks
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
                          {track.artist} • {track.plays} plays
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

        {/* AI Music Persona */}
        <div className="mt-8 max-w-4xl mx-auto">
          <Card className="bg-linear-to-br from-purple-900/30 via-gray-900/50 to-blue-900/30 border-gray-700 rounded-3xl backdrop-blur-xs">
            <CardHeader>
              <CardTitle className="text-3xl font-bold flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-[#00FFC2] mr-3" />
                Your AI Music Persona
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="mb-6">
                <Badge className="bg-linear-to-r from-[#1DB954] to-[#00FFC2] text-black font-semibold px-4 py-2 text-lg rounded-full">
                  The Nocturnal Dreamer
                </Badge>
              </div>
              <p className="text-lg leading-relaxed text-[#A1A1A1] mb-6">
                You&apos;re a sophisticated listener who gravitates toward atmospheric and emotionally rich music. Your taste
                blends modern electronic elements with classic alternative rock, suggesting someone who appreciates both
                innovation and timeless artistry. You likely listen to music as a form of escapism and emotional
                exploration, preferring tracks that create immersive sonic landscapes.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Badge variant="outline" className="border-[#1DB954] text-[#1DB954]">
                  Electronic
                </Badge>
                <Badge variant="outline" className="border-[#33BBFF] text-[#33BBFF]">
                  Alternative Rock
                </Badge>
                <Badge variant="outline" className="border-[#00FFC2] text-[#00FFC2]">
                  Atmospheric
                </Badge>
                <Badge variant="outline" className="border-purple-400 text-purple-400">
                  Indie
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Summary */}
        <div className="mt-8 grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Card className="bg-linear-to-br from-gray-900/50 to-gray-800/30 border-gray-700 rounded-2xl backdrop-blur-xs text-center p-6">
            <h3 className="text-3xl font-bold text-[#1DB954] mb-2">127</h3>
            <p className="text-[#A1A1A1]">Total Tracks Played</p>
          </Card>
          <Card className="bg-linear-to-br from-gray-900/50 to-gray-800/30 border-gray-700 rounded-2xl backdrop-blur-xs text-center p-6">
            <h3 className="text-3xl font-bold text-[#33BBFF] mb-2">8.5</h3>
            <p className="text-[#A1A1A1]">Hours Listened</p>
          </Card>
          <Card className="bg-linear-to-br from-gray-900/50 to-gray-800/30 border-gray-700 rounded-2xl backdrop-blur-xs text-center p-6">
            <h3 className="text-3xl font-bold text-[#00FFC2] mb-2">23</h3>
            <p className="text-[#A1A1A1]">Unique Artists</p>
          </Card>
        </div>
      </div>
    </div>
  )
}
