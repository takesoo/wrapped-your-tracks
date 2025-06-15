import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'your_openai_api_key_here',
});

interface SpotifyTrack {
  id: string;
  name: string;
  artists: { id: string; name: string }[];
  album: { id: string; name: string };
}

interface SpotifyArtist {
  id: string;
  name: string;
  genres: string[];
  popularity: number;
}

interface PersonaRequest {
  topTracks: SpotifyTrack[];
  topArtists: SpotifyArtist[];
}

export async function POST(request: NextRequest) {
  try {
    const body: PersonaRequest = await request.json();
    const { topTracks, topArtists } = body;

    if (!topTracks || !topArtists) {
      return NextResponse.json(
        { error: 'Missing required data: topTracks and topArtists' },
        { status: 400 },
      );
    }

    // 音楽データの分析
    const artistNames = topArtists.map(artist => artist.name);
    const trackNames = topTracks.map(track =>
      `${track.name} by ${track.artists[0]?.name || 'Unknown'}`,
    );
    const genres = [...new Set(topArtists.flatMap(artist => artist.genres))];
    const avgPopularity = topArtists.reduce((sum, artist) => sum + artist.popularity, 0) / topArtists.length;

    // プロンプトの作成
    const prompt = `
あなたは音楽の専門家です。以下のユーザーの週間音楽データを分析して、その人の音楽的ペルソナを日本語で生成してください。

トップアーティスト: ${artistNames.join(', ')}
トップトラック: ${trackNames.join(', ')}
主要ジャンル: ${genres.slice(0, 10).join(', ')}
平均人気度: ${Math.round(avgPopularity)}

以下の要素を含む、魅力的で個性的なペルソナを150-200文字で作成してください：
- 音楽的傾向の分析
- 性格的特徴の推測
- ユニークで親しみやすい表現
- ポジティブなトーン

例: "あなたは感性豊かな音楽探検家です。メジャーからインディーまで幅広く聴き、新しい音楽への好奇心が旺盛。深夜に一人で音楽に浸る時間を大切にし、歌詞の世界観を深く味わうタイプ。友人には隠れた名曲を教えてくれる、音楽界のトレジャーハンターです。"
`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'あなたは音楽分析の専門家で、ユーザーの音楽的嗜好から個性的なペルソナを作成することができます。日本語で魅力的で親しみやすいペルソナを作成してください。',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 300,
      temperature: 0.8,
    });

    const persona = completion.choices[0]?.message?.content;

    if (!persona) {
      throw new Error('Failed to generate persona');
    }

    // 音楽スタイルの分析も追加
    const styleAnalysis = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: '音楽データから簡潔なスタイル分析を日本語で作成してください。',
        },
        {
          role: 'user',
          content: `以下の音楽データから、この人の音楽スタイルを一言で表現してください（30文字以内）：
          ジャンル: ${genres.slice(0, 5).join(', ')}
          人気度: ${Math.round(avgPopularity)}`,
        },
      ],
      max_tokens: 50,
      temperature: 0.7,
    });

    const musicStyle = styleAnalysis.choices[0]?.message?.content || '多様な音楽愛好家';

    return NextResponse.json({
      persona,
      musicStyle,
      insights: {
        topGenres: genres.slice(0, 5),
        averagePopularity: Math.round(avgPopularity),
        diversityScore: genres.length,
        topArtistsCount: topArtists.length,
        topTracksCount: topTracks.length,
      },
    });

  } catch (error) {
    console.error('Error generating AI persona:', error);

    if (error instanceof Error && error.message.includes('API key')) {
      return NextResponse.json(
        { error: 'OpenAI API key is not configured' },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate AI persona' },
      { status: 500 },
    );
  }
}
