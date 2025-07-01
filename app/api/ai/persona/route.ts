import { NextRequest, NextResponse } from 'next/server';
import { Agent, run } from '@openai/agents';
import type { PersonaRequest } from '@/lib/spotify-types';

// ペルソナ生成エージェント（50件の視聴履歴ベース）
const personaAgent = new Agent({
  name: 'MusicPersonaAnalyst',
  instructions: `あなたは音楽分析の専門家です。ユーザーの過去50件の視聴履歴から個性的なペルソナを作成してください。
  
  以下の要素を含む、魅力的で個性的なペルソナを150-200文字で日本語で作成してください：
  - 視聴パターンの分析（時間帯、頻度、リピート傾向等）
  - 音楽的嗜好の特徴
  - 性格的特徴の推測
  - ユニークで親しみやすい表現
  - ポジティブなトーン`,
  model: 'gpt-4o',
});

export async function POST(request: NextRequest) {
  try {
    const body: PersonaRequest = await request.json();
    const { recentTracks } = body;

    if (!recentTracks || !Array.isArray(recentTracks) || recentTracks.length === 0) {
      return NextResponse.json(
        { error: 'Missing required data: recentTracks (50件の視聴履歴)' },
        { status: 400 },
      );
    }

    // 最大50件に制限
    const tracks = recentTracks.slice(0, 50);

    // 視聴履歴データの分析
    const trackNames = tracks.map(item =>
      `${item.track.name} by ${item.track.artists[0]?.name || 'Unknown'}`,
    );

    const artistNames = [...new Set(tracks.map(item => item.track.artists[0]?.name || 'Unknown'))];
    const albumNames = [...new Set(tracks.map(item => item.track.album.name))];

    // 時間帯分析
    const playTimes = tracks.map(item => new Date(item.played_at).getHours());
    const morningPlays = playTimes.filter(hour => hour >= 6 && hour < 12).length;
    const afternoonPlays = playTimes.filter(hour => hour >= 12 && hour < 18).length;
    const eveningPlays = playTimes.filter(hour => hour >= 18 && hour < 24).length;
    const nightPlays = playTimes.filter(hour => hour >= 0 && hour < 6).length;

    // リピート分析
    const trackCounts = tracks.reduce((acc, item) => {
      const key = `${item.track.name}_${item.track.artists[0]?.name}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const repeatTracks = Object.entries(trackCounts).filter(([, count]) => count > 1);

    // ペルソナ生成プロンプト
    const personaPrompt = `
以下のユーザーの過去50件の視聴履歴を分析して、その人の音楽的ペルソナを生成してください。

視聴楽曲（最新50件）:
${trackNames.slice(0, 20).join('\n')}
${trackNames.length > 20 ? '...他' + (trackNames.length - 20) + '件' : ''}

アーティスト数: ${artistNames.length}組
アルバム数: ${albumNames.length}枚

視聴時間帯:
- 朝 (6-12時): ${morningPlays}回
- 昼 (12-18時): ${afternoonPlays}回  
- 夜 (18-24時): ${eveningPlays}回
- 深夜 (0-6時): ${nightPlays}回

リピート楽曲: ${repeatTracks.length}曲

例: "あなたは感性豊かな音楽探検家です。メジャーからインディーまで幅広く聴き、新しい音楽への好奇心が旺盛。深夜に一人で音楽に浸る時間を大切にし、歌詞の世界観を深く味わうタイプ。友人には隠れた名曲を教えてくれる、音楽界のトレジャーハンターです。"
`;

    // エージェント実行
    const personaResult = await run(personaAgent, personaPrompt);
    const persona = personaResult.finalOutput;

    return NextResponse.json({
      persona,
      insights: {
        tracksAnalyzed: tracks.length,
        uniqueArtists: artistNames.length,
        uniqueAlbums: albumNames.length,
        timeDistribution: {
          morning: morningPlays,
          afternoon: afternoonPlays,
          evening: eveningPlays,
          night: nightPlays,
        },
        repeatTracks: repeatTracks.length,
        diversityScore: Math.round((artistNames.length / tracks.length) * 100),
      },
    });

  } catch (error) {
    // eslint-disable-next-line no-console
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
