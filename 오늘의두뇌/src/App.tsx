import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Brain, Check, ChevronRight, Flame, Share2, Sparkles, Trophy } from 'lucide-react';
import { getDailyQuestions } from './questions';

type DayResult = { date: string; score: number; completedAt: number };
type Progress = { answers: number[]; complete: boolean };
const STORAGE_KEY = 'today-brain-progress-v1';
const DAY_MS = 86_400_000;

function todayKey() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
}
function dateBefore(key: string, days: number) {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day - days)).toISOString().slice(0, 10);
}
function readProgress(testMode: boolean): Record<string, Progress> {
  try { return JSON.parse(localStorage.getItem(testMode ? `${STORAGE_KEY}-test` : STORAGE_KEY) || '{}'); } catch { return {}; }
}
function formatDate(key: string) {
  const [year, month, day] = key.split('-').map(Number);
  return new Intl.DateTimeFormat('ko-KR', { month: 'long', day: 'numeric', weekday: 'long', timeZone: 'UTC' }).format(new Date(Date.UTC(year, month - 1, day, 12)));
}

export default function App() {
  const isTestMode = new URLSearchParams(window.location.search).get('test') === '1';
  const date = useMemo(todayKey, []);
  const questions = useMemo(() => getDailyQuestions(date), [date]);
  const [progressByDate, setProgressByDate] = useState(() => readProgress(isTestMode));
  const progress = progressByDate[date] ?? { answers: [], complete: false };
  const [selected, setSelected] = useState<number | null>(null);
  const [previewedIndex, setPreviewedIndex] = useState<number | null>(null);
  const [testPanelOpen, setTestPanelOpen] = useState(true);
  const [toast, setToast] = useState('');
  const index = progress.answers.length;
  const isDone = progress.complete || index >= questions.length;

  useEffect(() => {
    if (isDone || !questions[index]?.memoryItems || previewedIndex === index) return;
    const timer = window.setTimeout(() => setPreviewedIndex(index), 2600);
    return () => window.clearTimeout(timer);
  }, [index, isDone, previewedIndex, questions]);

  useEffect(() => {
    try { localStorage.setItem(isTestMode ? `${STORAGE_KEY}-test` : STORAGE_KEY, JSON.stringify(progressByDate)); } catch { /* 저장 공간을 사용할 수 없는 환경 */ }
  }, [isTestMode, progressByDate]);
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(''), 2200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const score = progress.answers.reduce((sum, answer, i) => sum + (answer === questions[i]?.answer ? 1 : 0), 0);
  const weekly = Array.from({ length: 7 }, (_, i) => {
    const key = dateBefore(date, 6 - i);
    return { key, result: progressByDate[key] };
  });
  const streak = (() => {
    let count = 0;
    let cursor = progressByDate[date]?.complete ? date : dateBefore(date, 1);
    while (progressByDate[cursor]?.complete) { count++; cursor = dateBefore(cursor, 1); }
    return count;
  })();

  const saveAnswer = (answer: number) => {
    const nextAnswers = [...progress.answers, answer];
    const complete = nextAnswers.length === questions.length;
    setProgressByDate((current) => ({ ...current, [date]: { answers: nextAnswers, complete } }));
    setSelected(null);
    setPreviewedIndex(null);
  };
  const setTestScore = (targetScore: number) => {
    const answers = questions.map((question, i) => i < targetScore ? question.answer : (question.answer === 0 ? 1 : 0));
    setProgressByDate((current) => ({ ...current, [date]: { answers, complete: true } }));
    setSelected(null);
  };
  const resetTestDay = () => {
    setProgressByDate((current) => { const next = { ...current }; delete next[date]; return next; });
    setSelected(null);
    setPreviewedIndex(null);
  };
  const seedTestWeek = (days: number) => {
    setProgressByDate((current) => {
      const next = { ...current };
      for (let i = 0; i < days; i++) {
        const key = dateBefore(date, i);
        const set = getDailyQuestions(key);
        const answers = set.map((question, index) => index < (i === 0 ? 3 : 4) ? question.answer : (question.answer === 0 ? 1 : 0));
        next[key] = { answers, complete: true };
      }
      return next;
    });
  };
  const shareResult = async () => {
    const text = `오늘의 두뇌 퀴즈 ${score}/5점! 당신의 오늘 점수는 몇 점인가요?`;
    try {
      if (navigator.share) await navigator.share({ title: '오늘의 두뇌', text });
      else if (navigator.clipboard) { await navigator.clipboard.writeText(text); setToast('결과를 복사했어요'); }
      else setToast(text);
    } catch { /* 공유 취소 */ }
  };

  return (
    <div className="app-shell">
      <header className="topbar"><div className="brand"><span className="brand-mark"><Brain size={20} strokeWidth={2.4} /></span><span>오늘의 두뇌</span></div><div className="top-actions">{isTestMode && <span className="test-mode-tag">TEST</span>}<button className="icon-button" aria-label="결과 공유" onClick={shareResult}><Share2 size={19} /></button></div></header>
      {isTestMode && <section className="test-console"><button className="test-console-toggle" onClick={() => setTestPanelOpen((open) => !open)}><span><b>테스트 도구</b><small>진행·결과·주간 기록 상태를 빠르게 확인해요</small></span><ChevronRight className={testPanelOpen ? 'test-chevron open' : 'test-chevron'} size={17}/></button>{testPanelOpen && <div className="test-console-body"><div className="test-tool-group"><span className="test-tool-label">오늘 진행 상태</span><div className="test-actions"><button onClick={resetTestDay}>처음부터 시작</button><button onClick={() => { setProgressByDate((current) => ({ ...current, [date]: { answers: questions.slice(0, 2).map((q) => q.answer), complete: false } })); setSelected(null); }}>2문제 진행</button><button onClick={() => { setProgressByDate((current) => ({ ...current, [date]: { answers: questions.slice(0, 4).map((q) => q.answer), complete: false } })); setSelected(null); }}>마지막 문제</button></div></div><div className="test-tool-group"><span className="test-tool-label">결과 화면 · 점수 선택</span><div className="test-actions score-presets">{[0, 1, 3, 5].map((value) => <button className={score === value && isDone ? 'active' : ''} key={value} onClick={() => setTestScore(value)}>{value}점</button>)}</div></div><div className="test-tool-group"><span className="test-tool-label">주간 기록 예시</span><div className="test-actions"><button onClick={() => seedTestWeek(3)}>3일 연속 기록</button><button onClick={() => seedTestWeek(7)}>7일 기록 채우기</button><button onClick={() => setProgressByDate({})}>기록 전체 초기화</button></div></div><p className="test-storage-note">테스트 모드는 별도 저장 공간을 사용해 실제 진행 기록에 영향을 주지 않아요.</p></div>}</section>}
      <main className="main-content">
        <section className="welcome-row"><div><p className="eyebrow">YOUR DAILY BRAIN BOOST</p><h1>하루 5문제,<br />두뇌를 깨워요 <span>✦</span></h1><p className="date-label">{formatDate(date)}</p></div><div className="brain-illustration" aria-hidden="true"><div className="orb orb-one"/><div className="orb orb-two"/><Brain size={52} strokeWidth={1.65}/><Sparkles className="spark" size={19}/></div></section>

        <section className="streak-card"><div className="streak-info"><span className="flame-icon"><Flame size={21} fill="currentColor" /></span><div><span className="streak-count">{streak}일째</span><span className="streak-caption">연속으로 두뇌 운동 중</span></div></div><div className="week-strip">{weekly.map(({ key, result }) => { const done = Boolean(result?.complete); const correct = done ? result!.answers.reduce((sum, answer, i) => sum + (answer === getDailyQuestions(key)[i]?.answer ? 1 : 0), 0) : 0; return <div className="week-day" key={key}><span>{new Intl.DateTimeFormat('ko-KR', { weekday: 'narrow', timeZone: 'UTC' }).format(new Date(`${key}T12:00:00Z`))}</span><i className={done ? 'day-dot done' : key === date ? 'day-dot today' : 'day-dot'}>{done ? <Check size={12} strokeWidth={3} /> : ''}</i><small>{done ? `${correct}점` : '·'}</small></div>; })}</div></section>

        {!isDone ? <section className="quiz-card">
          <div className="quiz-topline"><span className="category-pill">{questions[index].category}</span><span className="question-count">{index + 1}<b> / 5</b></span></div>
          <div className="progress-track"><div className="progress-fill" style={{ width: `${(index / 5) * 100}%` }} /></div>
          {questions[index].memoryItems && previewedIndex !== index ? <div className="memory-preview"><p>잠시 후 단어가 사라져요</p><div className="memory-items">{questions[index].memoryItems.map((item) => <span key={item}>{item}</span>)}</div><div className="memory-timer"><i/></div></div> : <h2 className="question-text">{questions[index].prompt.split('\n').map((line, i) => <span key={i}>{line}</span>)}</h2>}
          <div className={`answers ${questions[index].memoryItems && previewedIndex !== index ? 'answers-hidden' : ''}`}>{questions[index].options.map((option, i) => <button key={option} className={`answer-option ${selected === i ? 'selected' : ''}`} onClick={() => setSelected(i)}><span className="answer-letter">{String.fromCharCode(65 + i)}</span><span>{option}</span><span className="answer-check">{selected === i ? <Check size={17} /> : <ChevronRight size={17} />}</span></button>)}</div>
          <button className="primary-button" disabled={selected === null || Boolean(questions[index].memoryItems && previewedIndex !== index)} onClick={() => saveAnswer(selected!)}>{index === 4 ? '결과 확인하기' : '정답 확인하기'}<ArrowRight size={18}/></button>
          <p className="gentle-note">정답을 고르면 바로 다음 문제로 넘어가요</p>
        </section> : <section className="result-card">
          <div className="result-icon"><Trophy size={29} /></div><p className="eyebrow result-eyebrow">TODAY'S RESULT</p><h2>오늘도 잘했어요!</h2><p className="result-subtitle">꾸준한 하루가 똑똑한 내일을 만들어요.</p>
          <div className="score-board"><div><strong>{score}<small> / 5</small></strong><span>맞힌 문제</span></div><div className="score-divider"/><div><strong>{Math.round(score / 5 * 100)}<small>%</small></strong><span>정답률</span></div></div>
          <div className="result-review"><div className="review-heading">오늘의 답안 <span>정답 {score}개</span></div>{questions.map((question, i) => { const correct = progress.answers[i] === question.answer; return <div className="review-item" key={`${i}-${question.prompt}`}><span className={`review-status ${correct ? 'correct' : 'incorrect'}`}>{correct ? <Check size={14}/> : '×'}</span><div className="review-copy"><b>{i + 1}. {question.prompt.split('\n')[0]}</b><span>{correct ? '정답이에요' : `정답: ${question.options[question.answer]}`} · {question.explanation}</span></div></div>; })}</div>
          <button className="primary-button share-button" onClick={shareResult}>오늘 점수 공유하기<Share2 size={17}/></button><div className="tomorrow-note"><span>🌱</span> 내일 새로운 문제로 다시 만나요</div>
        </section>}

        <div className="bottom-note"><span className="note-icon">✳</span><span>기억력 · 수리력 · 논리력을 골고루 단련해요</span></div>
      </main>
      {toast && <div className="toast"><Check size={16}/>{toast}</div>}
    </div>
  );
}
