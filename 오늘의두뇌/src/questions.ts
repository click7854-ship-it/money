export type Question = {
  id: string;
  category: '기억력' | '수리력' | '논리력' | '관찰력';
  prompt: string;
  memoryItems?: string[];
  options: string[];
  answer: number;
  explanation: string;
};

const baseQuestionBank: Omit<Question, 'id'>[] = [
  { category: '기억력', prompt: '두 번째 단어는 무엇이었나요?', memoryItems: ['사과', '우산', '기차', '구름'], options: ['사과', '우산', '기차', '구름'], answer: 1, explanation: '순서대로 떠올리면 두 번째 단어는 우산이에요.' },
  { category: '수리력', prompt: '다음 숫자에 들어갈 수는?\n3, 6, 12, 24, ?', options: ['30', '36', '48', '54'], answer: 2, explanation: '앞의 수에 2를 곱하는 규칙이에요. 24 × 2 = 48.' },
  { category: '논리력', prompt: '모든 장미는 꽃입니다.\n어떤 꽃은 빨간색입니다.\n반드시 참인 문장은 무엇일까요?', options: ['모든 꽃은 장미다', '모든 장미는 꽃이다', '모든 장미는 빨갛다', '빨간 꽃은 장미다'], answer: 1, explanation: '첫 번째 문장에서 이미 모든 장미가 꽃이라고 주어졌어요.' },
  { category: '관찰력', prompt: '다른 하나를 찾아보세요.', options: ['▲ ● ▲ ●', '● ▲ ● ▲', '▲ ● ● ▲', '● ● ▲ ▲'], answer: 2, explanation: '세 번째 배열만 같은 도형이 연달아 있어요.' },
  { category: '수리력', prompt: '사과 3개의 값이 1,200원입니다.\n사과 5개는 얼마일까요?', options: ['1,800원', '2,000원', '2,200원', '2,400원'], answer: 1, explanation: '한 개는 400원, 다섯 개는 2,000원이에요.' },
  { category: '논리력', prompt: '민수는 지수보다 키가 크고,\n지수는 현우보다 키가 큽니다.\n가장 키가 큰 사람은?', options: ['민수', '지수', '현우', '알 수 없음'], answer: 0, explanation: '민수 > 지수 > 현우 순서예요.' },
  { category: '기억력', prompt: '세 번째 색깔은 무엇이었나요?', memoryItems: ['파랑', '노랑', '초록', '빨강'], options: ['빨강', '파랑', '노랑', '초록'], answer: 3, explanation: '세 번째에 있던 색은 초록이에요.' },
  { category: '수리력', prompt: '규칙에 맞는 숫자를 골라보세요.\n2, 5, 8, 11, ?', options: ['12', '13', '14', '15'], answer: 2, explanation: '3씩 커지는 수열이에요. 11 + 3 = 14.' },
  { category: '관찰력', prompt: '다른 모양을 고르세요.', options: ['한글', '한글', '한귤', '한글'], answer: 2, explanation: '세 번째 보기만 마지막 글자가 ‘귤’이에요.' },
  { category: '논리력', prompt: '시계가 3시를 가리킬 때\n시침과 분침이 이루는 작은 각도는?', options: ['45도', '90도', '120도', '180도'], answer: 1, explanation: '3시에는 두 바늘이 직각을 이루어 90도예요.' },
  { category: '수리력', prompt: '20의 절반에 6을 더하면 얼마일까요?', options: ['10', '13', '16', '26'], answer: 2, explanation: '20의 절반은 10이고, 10 + 6 = 16이에요.' },
  { category: '기억력', prompt: '가장 먼저 나온 동물은 무엇이었나요?', memoryItems: ['여우', '고래', '토끼', '참새'], options: ['고래', '토끼', '여우', '참새'], answer: 2, explanation: '가장 앞에 있던 동물은 여우예요.' },
  { category: '논리력', prompt: '오늘이 화요일이라면\n10일 뒤는 무슨 요일일까요?', options: ['목요일', '금요일', '토요일', '일요일'], answer: 1, explanation: '7일 뒤도 화요일, 3일을 더하면 금요일이에요.' },
  { category: '관찰력', prompt: '숫자 7은 몇 번 나올까요?\n717 · 277 · 570', options: ['3번', '4번', '5번', '6번'], answer: 2, explanation: '717에 2번, 277에 2번, 570에 1번, 총 5번이에요.' },
  { category: '수리력', prompt: '빈칸에 알맞은 수는?\n1, 4, 9, 16, ?', options: ['20', '24', '25', '36'], answer: 2, explanation: '1², 2², 3², 4² 다음은 5²인 25예요.' },
  { category: '논리력', prompt: '네모는 세모보다 무겁고\n세모는 동그라미보다 무겁습니다.\n가장 가벼운 도형은?', options: ['네모', '세모', '동그라미', '같은 무게'], answer: 2, explanation: '네모 > 세모 > 동그라미 순으로 무거워요.' },
  { category: '관찰력', prompt: '짝이 맞지 않는 단어는?', options: ['월요일', '수요일', '금요일', '사과요일'], answer: 3, explanation: '나머지는 요일 이름이고 사과요일은 요일이 아니에요.' },
  { category: '기억력', prompt: '가장 마지막 숫자는 무엇이었나요?', memoryItems: ['8', '3', '5', '1'], options: ['8', '3', '5', '1'], answer: 3, explanation: '마지막에 나온 숫자는 1이에요.' },
  { category: '수리력', prompt: '1시간 20분은 모두 몇 분일까요?', options: ['70분', '80분', '90분', '120분'], answer: 1, explanation: '60분 + 20분 = 80분이에요.' },
  { category: '논리력', prompt: '모든 고양이는 동물입니다.\n나비는 고양이입니다.\n맞는 결론은?', options: ['나비는 동물이다', '나비는 새다', '모든 동물은 고양이다', '알 수 없다'], answer: 0, explanation: '고양이는 동물이고 나비는 고양이이므로 나비도 동물이에요.' },
  { category: '관찰력', prompt: '숫자 2가 들어 있지 않은 것은?', options: ['2026', '1204', '5210', '3106'], answer: 3, explanation: '마지막 숫자에는 2가 없어요.' },
  { category: '수리력', prompt: '한 변이 4cm인 정사각형의\n둘레는 몇 cm일까요?', options: ['8cm', '12cm', '16cm', '20cm'], answer: 2, explanation: '정사각형 둘레는 한 변 × 4, 즉 16cm예요.' },
  { category: '기억력', prompt: '세 번째 단어는 무엇이었나요?', memoryItems: ['열쇠', '컵', '모자', '책'], options: ['열쇠', '책', '컵', '모자'], answer: 3, explanation: '세 번째에 있던 단어는 모자예요.' },
  { category: '논리력', prompt: '어제는 금요일이었습니다.\n내일은 무슨 요일일까요?', options: ['토요일', '일요일', '월요일', '화요일'], answer: 1, explanation: '어제가 금요일이면 오늘은 토요일, 내일은 일요일이에요.' },
  { category: '관찰력', prompt: '반복되는 순서를 찾으세요.\n★ ● ▲ ★ ● ?', options: ['★', '●', '▲', '■'], answer: 2, explanation: '별, 동그라미, 세모가 반복되어 마지막은 세모예요.' },
  { category: '수리력', prompt: '48을 6으로 나눈 값에 2를 더하면?', options: ['8', '10', '12', '14'], answer: 1, explanation: '48 ÷ 6 = 8, 8 + 2 = 10이에요.' },
  { category: '기억력', prompt: '첫 번째 단어는 무엇이었나요?', memoryItems: ['기차', '구름', '나무', '연필'], options: ['연필', '기차', '구름', '나무'], answer: 1, explanation: '첫 번째에 있던 단어는 기차예요.' },
  { category: '논리력', prompt: '수진이는 보라보다 먼저 도착했고\n보라는 민호보다 먼저 도착했습니다.\n가장 늦게 도착한 사람은?', options: ['수진', '보라', '민호', '알 수 없음'], answer: 2, explanation: '수진 → 보라 → 민호 순으로 도착했어요.' },
  { category: '관찰력', prompt: '두 번째 글자가 ‘ㄷ’인 단어를 찾아보세요.', options: ['바다', '바라', '바가', '바차'], answer: 0, explanation: '바다의 두 번째 글자 첫소리는 ㄷ이에요.' },
  { category: '수리력', prompt: '10,000원에서 3,500원을 쓰고\n2,000원을 더 받았습니다. 얼마가 남았나요?', options: ['7,500원', '8,000원', '8,500원', '9,000원'], answer: 2, explanation: '10,000 - 3,500 + 2,000 = 8,500원이에요.' },
];

function hashDate(value: string) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) hash = Math.imul(hash ^ value.charCodeAt(i), 16777619);
  return hash >>> 0;
}

const curatedQuestions = baseQuestionBank.map((question, index) => ({ ...question, id: `curated-${index + 1}` }));
const memoryWords = ['사과', '우산', '기차', '구름', '열쇠', '책', '안경', '꽃', '모자', '컵', '연필', '가방', '시계', '수건', '빵', '우유', '버스', '의자', '수박', '장갑', '전화기', '양말', '접시', '비누', '강아지', '자전거', '지갑', '나무', '수저', '달력', '창문', '신발'];
const names = ['민수', '지안', '서준', '하윤', '도윤', '수아', '유진', '지호', '예린', '현우', '다은', '시우'];
const oddOneOut = [
  { group: ['사과', '배', '포도'], odd: '당근', label: '과일' },
  { group: ['버스', '기차', '택시'], odd: '냉장고', label: '탈것' },
  { group: ['월요일', '수요일', '금요일'], odd: '일요일', label: '평일' },
  { group: ['숟가락', '젓가락', '포크'], odd: '베개', label: '식사 도구' },
  { group: ['봄', '여름', '가을'], odd: '아침', label: '계절' },
  { group: ['강아지', '고양이', '토끼'], odd: '장미', label: '동물' },
  { group: ['셔츠', '바지', '치마'], odd: '수박', label: '옷' },
  { group: ['삼각형', '네모', '동그라미'], odd: '연필', label: '도형' },
];
const generatedQuestions: Question[] = Array.from({ length: 500 }, (_, index) => {
  const variation = index + 1;
  const type = index % 4;
  if (type === 0) {
    const start = (index + 7) % memoryWords.length;
    const stride = 2 * (Math.floor(index / memoryWords.length) % 16) + 1;
    const memoryItems = Array.from({ length: 4 }, (_, offset) => memoryWords[(start + offset * stride) % memoryWords.length]);
    const position = index % memoryItems.length;
    const shift = 1 + (Math.floor(index / 4) % 3);
    const options = memoryItems.map((_, offset) => memoryItems[(offset + shift) % memoryItems.length]);
    const answer = options.indexOf(memoryItems[position]);
    const positionName = ['첫', '두 번째', '세 번째', '마지막'][position];
    return { id: `generated-v2-memory-${variation}`, category: '기억력', prompt: `잠깐 보여드린 단어 중 ${positionName}에 나온 것은 무엇인가요?`, memoryItems, options, answer, explanation: `단어를 나온 순서대로 떠올리면 ${positionName} 단어는 ${memoryItems[position]}예요.` };
  }
  if (type === 1) {
    const step = 2 + (variation % 4);
    const first = 2 + (variation % 8);
    const answer = first + step * 4;
    const options = [answer + step, answer - step, answer, answer + 1];
    return { id: `generated-v2-number-${variation}`, category: '수리력', prompt: `숫자가 같은 만큼씩 커집니다. 빈칸에 들어갈 수는 무엇인가요?\n${first}, ${first + step}, ${first + step * 2}, ${first + step * 3}, ?`, options: options.map((value) => String(value)), answer: 2, explanation: `숫자가 ${step}씩 커지므로 ${first + step * 3} 다음은 ${answer}예요.` };
  }
  if (type === 2) {
    const first = names[index % names.length];
    const second = names[(index + 3) % names.length];
    const third = names[(index + 7) % names.length];
    const minutes = 5 + (variation % 6) * 5;
    const options = [third, first, second, '알 수 없음'];
    const topic = (name: string) => {
      const syllable = name.charCodeAt(name.length - 1) - 0xac00;
      return syllable >= 0 && syllable <= 11171 && syllable % 28 !== 0 ? '은' : '는';
    };
    return { id: `generated-v2-logic-${variation}`, category: '논리력', prompt: `세 사람이 약속 장소에 도착한 순서입니다.\n${first}는 ${second}보다 ${minutes}분 먼저 왔고, ${second}는 ${third}보다 ${minutes}분 먼저 왔습니다.\n가장 늦게 도착한 사람은 누구일까요?`, options, answer: 0, explanation: `${first}, ${second}, ${third} 순서로 도착했으므로 ${third}가 가장 늦어요.` };
  }
  const item = oddOneOut[Math.floor((variation - 1) / 4) % oddOneOut.length];
  const shift = variation % item.group.length;
  const options = [...item.group.slice(shift), ...item.group.slice(0, shift), item.odd];
  const answer = options.indexOf(item.odd);
  return { id: `generated-v2-observation-${variation}`, category: '관찰력', prompt: `다음 중 나머지와 종류가 다른 것은 무엇인가요?`, options, answer, explanation: `다른 보기들은 모두 ${item.label}이고, ${item.odd}은(는) 여기에 속하지 않아요.` };
});

export const questionBank: Question[] = [...curatedQuestions, ...generatedQuestions];
const questionById = new Map(questionBank.map((question) => [question.id!, question]));

export function getQuestionsByIds(ids: string[]): Question[] {
  return ids.map((id) => questionById.get(id)).filter((question): question is Question => Boolean(question));
}

export function hasQuestionsByIds(ids: string[]): boolean {
  return ids.length === 5 && ids.every((id) => questionById.has(id));
}

export function getLegacyDailyQuestions(dateKey: string): Question[] {
  const seed = hashDate(dateKey);
  const start = seed % curatedQuestions.length;
  const step = 7;
  return Array.from({ length: 5 }, (_, i) => curatedQuestions[(start + i * step) % curatedQuestions.length]);
}

export function getDailyQuestions(dateKey: string, usedIds: ReadonlySet<string> = new Set()): Question[] {
  return questionBank
    .filter((question) => !usedIds.has(question.id!))
    .sort((left, right) => hashDate(`${dateKey}:${left.id}`) - hashDate(`${dateKey}:${right.id}`) || left.id!.localeCompare(right.id!))
    .slice(0, 5);
}
