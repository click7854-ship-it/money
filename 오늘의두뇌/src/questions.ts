export type Question = {
  category: '기억력' | '수리력' | '논리력' | '관찰력';
  prompt: string;
  memoryItems?: string[];
  options: string[];
  answer: number;
  explanation: string;
};

export const questionBank: Question[] = [
  { category: '기억력', prompt: '두 번째 단어는 무엇이었나요?', memoryItems: ['사과', '우산', '기차', '구름'], options: ['사과', '우산', '기차', '구름'], answer: 1, explanation: '순서대로 떠올리면 두 번째 단어는 우산이에요.' },
  { category: '수리력', prompt: '다음 숫자에 들어갈 수는?\n3, 6, 12, 24, ?', options: ['30', '36', '48', '54'], answer: 2, explanation: '앞의 수에 2를 곱하는 규칙이에요. 24 × 2 = 48.' },
  { category: '논리력', prompt: '모든 장미는 꽃입니다.\n어떤 꽃은 빨간색입니다.\n반드시 참인 문장은 무엇일까요?', options: ['모든 꽃은 장미다', '모든 장미는 꽃이다', '모든 장미는 빨갛다', '빨간 꽃은 장미다'], answer: 1, explanation: '첫 번째 문장에서 이미 모든 장미가 꽃이라고 주어졌어요.' },
  { category: '관찰력', prompt: '다른 하나를 찾아보세요.', options: ['▲ ● ▲ ●', '● ▲ ● ▲', '▲ ● ▲ ●', '▲ ● ● ▲'], answer: 3, explanation: '마지막 배열만 같은 도형이 두 번 이어져요.' },
  { category: '수리력', prompt: '사과 3개의 값이 1,200원입니다.\n사과 5개는 얼마일까요?', options: ['1,800원', '2,000원', '2,200원', '2,400원'], answer: 1, explanation: '한 개는 400원, 다섯 개는 2,000원이에요.' },
  { category: '논리력', prompt: '민수는 지수보다 키가 크고,\n지수는 현우보다 키가 큽니다.\n가장 키가 큰 사람은?', options: ['민수', '지수', '현우', '알 수 없음'], answer: 0, explanation: '민수 > 지수 > 현우 순서예요.' },
  { category: '기억력', prompt: '세 번째 색깔은 무엇이었나요?', memoryItems: ['파랑', '노랑', '초록', '빨강'], options: ['파랑', '노랑', '초록', '빨강'], answer: 2, explanation: '세 번째에 있던 색은 초록이에요.' },
  { category: '수리력', prompt: '규칙에 맞는 숫자를 골라보세요.\n2, 5, 8, 11, ?', options: ['12', '13', '14', '15'], answer: 2, explanation: '3씩 커지는 수열이에요. 11 + 3 = 14.' },
  { category: '관찰력', prompt: '다른 모양을 고르세요.', options: ['한글', '한글', '한귤', '한글'], answer: 2, explanation: '세 번째 보기만 마지막 글자가 ‘귤’이에요.' },
  { category: '논리력', prompt: '시계가 3시를 가리킬 때\n시침과 분침이 이루는 작은 각도는?', options: ['45도', '90도', '120도', '180도'], answer: 1, explanation: '3시에는 두 바늘이 직각을 이루어 90도예요.' },
  { category: '수리력', prompt: '20의 절반에 6을 더하면 얼마일까요?', options: ['10', '13', '16', '26'], answer: 2, explanation: '20의 절반은 10이고, 10 + 6 = 16이에요.' },
  { category: '기억력', prompt: '동물을 기억해 보세요.\n여우 · 고래 · 토끼 · 참새\n가장 먼저 나온 동물은?', options: ['고래', '토끼', '여우', '참새'], answer: 2, explanation: '가장 앞에 나온 동물은 여우예요.' },
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
  { category: '기억력', prompt: '물건을 기억해 보세요.\n열쇠 · 컵 · 모자 · 책\n목에 쓰는 물건은 무엇일까요?', options: ['열쇠', '컵', '모자', '책'], answer: 2, explanation: '목에 쓰는 물건으로 말한 것은 모자예요.' },
  { category: '논리력', prompt: '어제는 금요일이었습니다.\n내일은 무슨 요일일까요?', options: ['토요일', '일요일', '월요일', '화요일'], answer: 1, explanation: '어제가 금요일이면 오늘은 토요일, 내일은 일요일이에요.' },
  { category: '관찰력', prompt: '반복되는 순서를 찾으세요.\n★ ● ▲ ★ ● ?', options: ['★', '●', '▲', '■'], answer: 2, explanation: '별, 동그라미, 세모가 반복되어 마지막은 세모예요.' },
  { category: '수리력', prompt: '48을 6으로 나눈 값에 2를 더하면?', options: ['8', '10', '12', '14'], answer: 1, explanation: '48 ÷ 6 = 8, 8 + 2 = 10이에요.' },
  { category: '기억력', prompt: '책을 빌릴 수 있는 곳은 어디였나요?', memoryItems: ['바다', '산', '공원', '도서관'], options: ['바다', '산', '공원', '도서관'], answer: 3, explanation: '책을 빌릴 수 있는 곳은 도서관이에요.' },
  { category: '논리력', prompt: '수진이는 보라보다 먼저 도착했고\n보라는 민호보다 먼저 도착했습니다.\n가장 늦게 도착한 사람은?', options: ['수진', '보라', '민호', '알 수 없음'], answer: 2, explanation: '수진 → 보라 → 민호 순으로 도착했어요.' },
  { category: '관찰력', prompt: '다른 문자를 찾아보세요.', options: ['ㅂㅏㄷㅏ', 'ㅂㅏㄷㅏ', 'ㅂㅏㄷㅏ', 'ㅍㅏㄷㅏ'], answer: 3, explanation: '마지막 배열만 첫 자음이 ㅍ이에요.' },
  { category: '수리력', prompt: '10,000원에서 3,500원을 쓰고\n2,000원을 더 받았습니다. 얼마가 남았나요?', options: ['7,500원', '8,000원', '8,500원', '9,000원'], answer: 2, explanation: '10,000 - 3,500 + 2,000 = 8,500원이에요.' },
];

function hashDate(value: string) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) hash = Math.imul(hash ^ value.charCodeAt(i), 16777619);
  return hash >>> 0;
}

export function getDailyQuestions(dateKey: string): Question[] {
  const seed = hashDate(dateKey);
  const start = seed % questionBank.length;
  const step = 7;
  return Array.from({ length: 5 }, (_, i) => questionBank[(start + i * step) % questionBank.length]);
}
