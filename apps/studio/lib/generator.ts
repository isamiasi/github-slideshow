import type { GenerationInput, GenerationOutput } from './types.ts';

const toneMap: Record<string, string> = {
  孤独: '薄い蛍光灯の下に残る呼吸',
  郷愁: '遠い雨音が運ぶ記憶',
  希望: '夜明け前の歩道に滲む光',
  不安: '静かな機械音の奥のざわめき',
  再生: '冷えた手に戻る体温',
  誘惑: '振り返りたくなる街の気配'
};

export function generateDraft(input: GenerationInput): GenerationOutput {
  const tone = toneMap[input.emotion] ?? '静かな夜の端に残る息づかい';
  const title = `${input.theme}｜${input.place}、${input.time}の改札前`;

  return {
    title,
    poem: `${tone}\n${input.theme}の気配を、ポケットの硬貨が数えている\n列車の風だけが、名前を呼ばずに通り過ぎた`,
    sunoPrompt:
      'Vietnamese emotional atmosphere, cinematic, restrained emotion, ambient, soft piano, industrial ambience. Avoid hyperpop, EDM, aggressive beat.',
    imagePrompt: `realistic photo, cinematic lighting, Japanese night scenery, Vietnamese worker, subtle melancholy, ${input.place}, ${input.time}`,
    shortsScript: `0-3s: 字幕「${tone}」\n3-10s: ${input.protagonist}。${input.situation}\n10-15s: ${input.theme}。電車の残響と黒画面。タイトル「${title}」`,
    youtubeTitle: `【${input.emotion}の夜】${input.theme}｜${input.protagonist}が${input.place}で見た小さな光`
  };
}
