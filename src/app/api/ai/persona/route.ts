import { NextRequest, NextResponse } from 'next/server';
import { Agent, run } from '@openai/agents';
import type { PersonaRequest } from '@/lib/spotify-types';
import { getLocale } from 'next-intl/server';

// ペルソナ生成エージェント（50件の視聴履歴ベース）
const createPersonaAgent = (locale: string) => {
  const isJapanese = locale === 'ja';
  const instructions = isJapanese
    ? `あなたはユーモアセンス抜群の音楽診断士です。ユーザーの視聴履歴から、クスッと笑えて共感できる診断結果を作成してください。
  
  重要：以下の形式の純粋なJSON文字列のみを出力してください。コードブロック（\`\`\`）や余分な文字を含めないでください：
  {"title":"〇〇タイプ","description":"詳細な説明文"}
  
  タイトル（15-25文字程度）の例：
  - 「深夜の哲学者タイプ」
  - 「音楽界の気分屋タイプ」
  - 「プレイリスト迷子タイプ」
  - 「感情ジェットコースタータイプ」
  - 「音楽の浮気性タイプ」
  
  説明文（120-180文字程度）には：
  - 視聴傾向から見える「あるある」な行動パターン
  - 自虐的だけど愛おしい特徴
  - 「〜しがち」「〜するタイプ」などの親近感ある表現
  - 具体的な行動（例：「シャッフル再生なのに結局スキップしまくる」）
  - 最後は前向きで愛情あるフォロー
  
  注意：
  - 堅苦しい分析は避ける
  - 専門用語は使わない
  - 誰もが「それ私だ！」と思える内容に
  - 必ず純粋なJSON文字列のみを返す（マークダウンやコードブロックは使用しない）`
    : `You are a witty music personality analyst. Based on the user's listening history, create a humorous and relatable personality diagnosis.
  
  IMPORTANT: Output ONLY a pure JSON string in the following format. Do not include code blocks (\`\`\`) or any extra characters:
  {"title":"The [Type] Type","description":"Detailed description"}
  
  Title examples (keep it concise and catchy):
  - "The Midnight Philosopher Type"
  - "The Musical Mood Swing Type"
  - "The Playlist Wanderer Type"
  - "The Emotional Rollercoaster Type"
  - "The Musical Commitment Issues Type"
  
  Description (150-200 characters) should include:
  - Relatable behavior patterns from listening trends
  - Self-deprecating but endearing traits
  - Use phrases like "tends to...", "the type who..."
  - Specific behaviors (e.g., "hits shuffle but skips every song anyway")
  - End with a positive, affectionate note
  
  Guidelines:
  - Avoid stiff analysis
  - No technical jargon
  - Make it universally relatable ("that's so me!")
  - Return ONLY the pure JSON string (no markdown or code blocks)`;

  return new Agent({
    name: 'MusicPersonaAnalyst',
    instructions,
    model: 'gpt-4o-mini',
  });
};

export async function POST(request: NextRequest) {
  try {
    const body: PersonaRequest = await request.json();
    const { recentTracks } = body;
    const locale = await getLocale();

    if (!recentTracks || !Array.isArray(recentTracks) || recentTracks.length === 0) {
      return NextResponse.json(
        { error: 'Missing required data: recentTracks' },
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
    const personaPrompt = locale === 'ja'
      ? `
以下のユーザーの過去50件の視聴履歴を分析して、クスッと笑える診断結果を作成してください。

視聴楽曲（最新50件）:
${trackNames.slice(0, 20).join('\n')}
${trackNames.length > 20 ? '...他' + (trackNames.length - 20) + '件' : ''}

アーティスト数: ${artistNames.length}組
アルバム数: ${albumNames.length}枚

視聴時間帯:
- 朝 (6-12時): ${morningPlays}回 ${morningPlays === 0 ? '（朝は寝てるタイプ）' : morningPlays > 10 ? '（朝活勢）' : ''}
- 昼 (12-18時): ${afternoonPlays}回  
- 夜 (18-24時): ${eveningPlays}回 ${eveningPlays > 20 ? '（夜型人間）' : ''}
- 深夜 (0-6時): ${nightPlays}回 ${nightPlays > 5 ? '（深夜の哲学者）' : ''}

リピート楽曲: ${repeatTracks.length}曲 ${repeatTracks.length > 10 ? '（ヘビロテ勢）' : repeatTracks.length === 0 ? '（新曲マニア）' : ''}
多様性: ${Math.round((artistNames.length / tracks.length) * 100)}%

特記事項:
${repeatTracks.length > 5 ? '- 同じ曲を何度もリピート' : ''}
${artistNames.length > 30 ? '- アーティストの浮気性が高い' : ''}
${artistNames.length < 10 ? '- 推しアーティスト一筋' : ''}
${nightPlays > morningPlays * 3 ? '- 完全に夜型生活' : ''}

上記の指示に従い、純粋なJSON文字列のみを出力してください。コードブロックやマークダウンは使用しないでください。
`
      : `
Analyze the user's last 50 listening sessions and create a witty personality diagnosis.

Recent Tracks (Latest 50):
${trackNames.slice(0, 20).join('\n')}
${trackNames.length > 20 ? '...and ' + (trackNames.length - 20) + ' more' : ''}

Unique Artists: ${artistNames.length}
Unique Albums: ${albumNames.length}

Listening Times:
- Morning (6AM-12PM): ${morningPlays} plays ${morningPlays === 0 ? '(sleeps through mornings)' : morningPlays > 10 ? '(early bird)' : ''}
- Afternoon (12PM-6PM): ${afternoonPlays} plays  
- Evening (6PM-12AM): ${eveningPlays} plays ${eveningPlays > 20 ? '(night owl)' : ''}
- Late Night (12AM-6AM): ${nightPlays} plays ${nightPlays > 5 ? '(midnight philosopher)' : ''}

Repeat Tracks: ${repeatTracks.length} ${repeatTracks.length > 10 ? '(heavy repeater)' : repeatTracks.length === 0 ? '(new music explorer)' : ''}
Diversity Score: ${Math.round((artistNames.length / tracks.length) * 100)}%

Notable Behaviors:
${repeatTracks.length > 5 ? '- Plays the same songs on repeat' : ''}
${artistNames.length > 30 ? '- Musical commitment issues' : ''}
${artistNames.length < 10 ? '- Loyal to favorite artists' : ''}
${nightPlays > morningPlays * 3 ? '- Complete night owl lifestyle' : ''}

Follow the instructions above and output ONLY a pure JSON string. Do not use code blocks or markdown.
`;

    // エージェント作成と実行
    const personaAgent = createPersonaAgent(locale);
    const personaResult = await run(personaAgent, personaPrompt);

    // JSON形式のレスポンスをパース
    let personaData;
    try {
      // コードブロックが含まれている場合は除去
      let cleanOutput = personaResult.finalOutput ?? '{}';
      if (cleanOutput.includes('```json')) {
        cleanOutput = cleanOutput.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      }
      personaData = JSON.parse(cleanOutput);
    } catch (parseError) {
      // eslint-disable-next-line no-console
      console.error('Failed to parse persona data:', parseError);
      // eslint-disable-next-line no-console
      console.error('Raw output:', personaResult.finalOutput);
      // フォールバック
      personaData = locale === 'ja'
        ? {
          title: '音楽愛好家タイプ',
          description: 'あなたは独特な音楽センスを持つリスナーです。様々なジャンルを楽しみながら、自分だけの音楽世界を築いています。',
        }
        : {
          title: 'The Music Explorer Type',
          description: 'You have a unique taste in music. You enjoy various genres while building your own musical world.',
        };
    }

    return NextResponse.json({
      persona: personaData,
      insights: {
        tracksAnalyzed: tracks.length,
        uniqueArtists: artistNames.length,
        uniqueAlbums: albumNames.length,
        timeDistribution: {
          morning: Math.round((morningPlays / tracks.length) * 100),
          afternoon: Math.round((afternoonPlays / tracks.length) * 100),
          evening: Math.round((eveningPlays / tracks.length) * 100),
          night: Math.round((nightPlays / tracks.length) * 100),
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
