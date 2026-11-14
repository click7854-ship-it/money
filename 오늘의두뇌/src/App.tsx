import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, BookOpen, Brain, Check, ChevronRight, Copy, Flame, Home, Medal, RotateCcw, Share2, Sparkles, Trophy, Volume2, VolumeX, X } from 'lucide-react';
import { getDailyQuestions, getLegacyDailyQuestions, getQuestionsByIds, hasQuestionsByIds } from './questions';

type Progress = { answers: number[]; complete: boolean; questionIds?: string[]; retiredQuestionIds?: string[] };
const STORAGE_KEY = 'today-brain-progress-v1';
function todayKey() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
}
function dateBefore(key: string, days: number) {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day - days)).toISOString().slice(0, 10);
}
function readProgress(testMode: boolean, today: string): Record<string, Progress> {
  let saved: Record<string, Progress>;
  try { saved = JSON.parse(localStorage.getItem(testMode ? `${STORAGE_KEY}-test-v3` : STORAGE_KEY) || '{}'); } catch { saved = {}; }

  const usedIds = new Set<string>();
  for (const [day, result] of Object.entries(saved)) {
    result.retiredQuestionIds?.forEach((id) => usedIds.add(id));
    if (!Array.isArray(result.questionIds) || !hasQuestionsByIds(result.questionIds)) {
      result.questionIds = getLegacyDailyQuestions(day).map((question) => question.id!);
    }
    result.questionIds.forEach((id) => usedIds.add(id));
  }

  for (let offset = 6; offset >= 0; offset--) {
    const day = dateBefore(today, offset);
    if (saved[day]?.questionIds?.length === 5) continue;
    const questions = getDailyQuestions(day, usedIds);
    const questionIds = questions.map((question) => question.id!);
    saved[day] = { answers: [], complete: false, questionIds };
    questionIds.forEach((id) => usedIds.add(id));
  }
  return saved;
}
function formatDate(key: string) {
  const [year, month, day] = key.split('-').map(Number);
  return new Intl.DateTimeFormat('ko-KR', { month: 'long', day: 'numeric', weekday: 'long', timeZone: 'UTC' }).format(new Date(Date.UTC(year, month - 1, day, 12)));
}

export default function App() {
  const isTestMode = new URLSearchParams(window.location.search).get('test') === '1';
  const today = useMemo(todayKey, []);
  const [testDate, setTestDate] = useState(today);
  const date = isTestMode ? testDate : today;
  const [progressByDate, setProgressByDate] = useState(() => readProgress(isTestMode, today));
  const progress = progressByDate[date] ?? { answers: [], complete: false, questionIds: [] };
  const usedQuestionIds = useMemo(() => new Set(Object.values(progressByDate).flatMap((day) => day.questionIds ?? [])), [progressByDate]);
  const questions = useMemo(() => {
    const assigned = getQuestionsByIds(progress.questionIds ?? []);
    return assigned.length === 5 ? assigned : getDailyQuestions(date, usedQuestionIds);
  }, [date, progress.questionIds, usedQuestionIds]);
  const [selected, setSelected] = useState<number | null>(null);
  const [submittedAnswer, setSubmittedAnswer] = useState<number | null>(null);
  const [screen, setScreen] = useState<'home' | 'game'>('home');
  const [modal, setModal] = useState<'rules' | 'ranking' | null>(null);
  const [soundOn, setSoundOn] = useState(() => localStorage.getItem('today-brain-sound') !== 'off');
  const [previewedIndex, setPreviewedIndex] = useState<number | null>(null);
  const [testPanelOpen, setTestPanelOpen] = useState(true);
  const [toast, setToast] = useState('');
  const index = progress.answers.length;
  const isDone = progress.complete || index >= questions.length;
  const currentQuestion = questions[index];
  const isShowingMemory = !isDone && Boolean(currentQuestion?.memoryItems && previewedIndex !== index);

  useEffect(() => {
    if (isDone || !currentQuestion?.memoryItems || previewedIndex === index) return;
    const timer = window.setTimeout(() => setPreviewedIndex(index), 4000);
    return () => window.clearTimeout(timer);
  }, [currentQuestion, index, isDone, previewedIndex]);

  useEffect(() => {
    try { localStorage.setItem(isTestMode ? `${STORAGE_KEY}-test-v3` : STORAGE_KEY, JSON.stringify(progressByDate)); } catch { /* 저장 공간을 사용할 수 없는 환경 */ }
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
  const weeklyScores = weekly.map(({ key, result }) => {
    const set = getQuestionsByIds(result?.questionIds ?? []);
    const points = result ? result.answers.reduce((sum, answer, i) => sum + (answer === set[i]?.answer ? 1 : 0), 0) : 0;
    return { key, points, answered: result?.answers.length ?? 0 };
  });
  const weeklyPoints = weeklyScores.reduce((sum, day) => sum + day.points, 0);
  const weeklyAnswered = weeklyScores.reduce((sum, day) => sum + day.answered, 0);
  const weeklyPercent = Math.round(weeklyPoints / 35 * 100);
  const availableTestDays = Array.from({ length: 7 }, (_, i) => dateBefore(today, 6 - i));
  const streak = (() => {
    let count = 0;
    let cursor = progressByDate[date]?.complete ? date : dateBefore(date, 1);
    while (progressByDate[cursor]?.complete) { count++; cursor = dateBefore(cursor, 1); }
    return count;
  })();

  const playSound = (kind: 'tap' | 'correct' | 'wrong' | 'finish') => {
    if (!soundOn) return;
    try {
      const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      const context = new AudioContextClass();
      const notes = kind === 'correct' ? [660, 880] : kind === 'wrong' ? [220, 180] : kind === 'finish' ? [523, 659, 784] : [520];
      notes.forEach((frequency, i) => {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.type = 'sine'; oscillator.frequency.value = frequency;
        gain.gain.setValueAtTime(0.0001, context.currentTime + i * 0.09);
        gain.gain.exponentialRampToValueAtTime(0.08, context.currentTime + i * 0.09 + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + i * 0.09 + 0.16);
        oscillator.connect(gain); gain.connect(context.destination);
        oscillator.start(context.currentTime + i * 0.09); oscillator.stop(context.currentTime + i * 0.09 + 0.17);
      });
      window.setTimeout(() => void context.close(), 700);
    } catch { /* 기기에서 소리를 지원하지 않으면 조용히 진행 */ }
  };

  const saveAnswer = (answer: number) => {
    const nextAnswers = [...progress.answers, answer];
    const complete = nextAnswers.length === questions.length;
    setProgressByDate((current) => ({ ...current, [date]: { ...current[date], questionIds: questions.map((question) => question.id!), answers: nextAnswers, complete } }));
    setSelected(null);
    setSubmittedAnswer(null);
    setPreviewedIndex(null);
    if (complete) playSound('finish');
  };
  const startReplay = () => {
    const used = new Set(Object.values(progressByDate).flatMap((day) => [...(day.questionIds ?? []), ...(day.retiredQuestionIds ?? [])]));
    const nextSet = getDailyQuestions(`${date}:replay:${Date.now()}`, used);
    if (nextSet.length < 5) { setToast('새 문제를 준비하고 있어요.'); return; }
    const retiredQuestionIds = [...new Set([...(progress.retiredQuestionIds ?? []), ...(progress.questionIds ?? [])])];
    setProgressByDate((current) => ({ ...current, [date]: { ...current[date], answers: [], complete: false, retiredQuestionIds, questionIds: nextSet.map((question) => question.id!) } }));
    setSelected(null); setSubmittedAnswer(null); setPreviewedIndex(null); setScreen('game'); playSound('tap');
  };
  const setTestScore = (targetScore: number) => {
    const answers = questions.map((question, i) => i < targetScore ? question.answer : (question.answer === 0 ? 1 : 0));
    setProgressByDate((current) => ({ ...current, [date]: { ...current[date], questionIds: questions.map((question) => question.id!), answers, complete: true } }));
    setSelected(null);
  };
  const resetTestDay = () => {
    setProgressByDate((current) => ({ ...current, [date]: { ...current[date], questionIds: questions.map((question) => question.id!), answers: [], complete: false } }));
    setSelected(null);
    setPreviewedIndex(null);
  };
  const seedTestWeek = (days: number) => {
    setProgressByDate((current) => {
      const next = { ...current };
      const seen = new Set(Object.values(next).flatMap((day) => day.questionIds ?? []));
      for (let i = 0; i < days; i++) {
        const key = dateBefore(date, i);
        const set = next[key]?.questionIds?.length === 5 ? getQuestionsByIds(next[key].questionIds) : getDailyQuestions(key, seen);
        const questionIds = set.map((question) => question.id!);
        questionIds.forEach((id) => seen.add(id));
        const answers = set.map((question, index) => index < (i === 0 ? 3 : 4) ? question.answer : (question.answer === 0 ? 1 : 0));
        next[key] = { ...next[key], questionIds, answers, complete: true };
      }
      return next;
    });
  };
  const shareResult = async () => {
    const text = `오늘의 두뇌 퀴즈 ${score}/5점! 당신의 오늘 점수는 몇 점인가요?`;
    try {
      if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(text);
      else {
        const field = document.createElement('textarea');
        field.value = text;
        field.setAttribute('readonly', '');
        field.style.position = 'fixed';
        field.style.opacity = '0';
        document.body.appendChild(field);
        field.select();
        const copied = document.execCommand('copy');
        field.remove();
        if (!copied) throw new Error('Clipboard copy failed');
      }
      setToast('점수를 복사했어요. 채팅창에 붙여넣어 공유해보세요.');
    } catch {
      setToast('복사하지 못했어요. 다시 눌러주세요.');
    }
  };

  return (
    <div className="app-shell">
      <header className="topbar"><button className="brand brand-button" onClick={() => setScreen('home')} aria-label="홈으로"><span className="brand-mark"><Brain size={20} strokeWidth={2.4} /></span><span>오늘의 두뇌</span></button><div className="top-actions">{isTestMode && <span className="test-mode-tag">TEST</span>}<button className="icon-button" aria-label={soundOn ? '효과음 끄기' : '효과음 켜기'} onClick={() => { const next = !soundOn; setSoundOn(next); localStorage.setItem('today-brain-sound', next ? 'on' : 'off'); if (next) playSound('tap'); }}>{soundOn ? <Volume2 size={19}/> : <VolumeX size={19}/>}</button><button className="icon-button" aria-label="게임 규칙 보기" onClick={() => setModal('rules')}><BookOpen size={19}/></button><button className="icon-button" aria-label="내 기록 보기" onClick={() => setModal('ranking')}><Medal size={19}/></button></div></header>
      {isTestMode && <section className="test-console"><button className="test-console-toggle" onClick={() => setTestPanelOpen((open) => !open)}><span><b>테스트 도구</b><small>문제 세트·진행·결과·주간 기록을 확인해요</small></span><ChevronRight className={testPanelOpen ? 'test-chevron open' : 'test-chevron'} size={17}/></button>{testPanelOpen && <div className="test-console-body"><div className="test-tool-group"><span className="test-tool-label">최근 7일 문제 세트 · 날짜를 선택해 풀어보세요</span><div className="test-days">{availableTestDays.map((key) => <button aria-pressed={date === key} className={date === key ? 'test-day selected' : 'test-day'} key={key} onClick={() => { setTestDate(key); setSelected(null); setSubmittedAnswer(null); setPreviewedIndex(null); }}><span>{key === today ? '오늘' : new Intl.DateTimeFormat('ko-KR', { weekday: 'short', timeZone: 'UTC' }).format(new Date(`${key}T12:00:00Z`))}</span><b>{Number(key.split('-')[2])}</b></button>)}</div></div><div className="test-tool-group"><span className="test-tool-label">선택한 날짜 · {formatDate(date)} 진행 상태</span><div className="test-actions"><button onClick={resetTestDay}>처음부터 시작</button><button onClick={() => { setProgressByDate((current) => ({ ...current, [date]: { ...current[date], questionIds: questions.map((question) => question.id!), answers: questions.slice(0, 2).map((q) => q.answer), complete: false } })); setSelected(null); setSubmittedAnswer(null); }}>3번 문제부터</button><button onClick={() => { setProgressByDate((current) => ({ ...current, [date]: { ...current[date], questionIds: questions.map((question) => question.id!), answers: questions.slice(0, 4).map((q) => q.answer), complete: false } })); setSelected(null); setSubmittedAnswer(null); }}>마지막 문제</button></div></div><div className="test-tool-group"><span className="test-tool-label">결과 화면 · 점수 선택</span><div className="test-actions score-presets">{[0, 1, 3, 5].map((value) => <button className={score === value && isDone ? 'active' : ''} key={value} onClick={() => setTestScore(value)}>{value}점</button>)}</div></div><div className="test-tool-group"><span className="test-tool-label">주간 기록 예시</span><div className="test-actions"><button onClick={() => seedTestWeek(3)}>3일 연속 기록</button><button onClick={() => seedTestWeek(7)}>7일 기록 채우기</button><button onClick={() => setProgressByDate({})}>테스트 기록 전체 초기화</button></div></div><p className="test-storage-note">테스트와 실제 기록은 분리되어 있고, 이미 출제한 문제는 날짜가 바뀌어도 다시 나오지 않아요.</p></div>}</section>}
      {screen === 'home' ? <main className="main-content home-screen">
        <section className="home-hero"><div className="hero-sticker"><span>🧠</span><i>✨</i><b>오늘의 챌린지</b></div><p className="eyebrow">A LITTLE BRAIN BREAK</p><h1>하루 5문제로<br/>가볍게 깨우는 두뇌</h1><p className="home-copy">기억력부터 생활 속 계산까지,<br/>내 속도에 맞춰 즐겨보세요.</p><div className="home-categories"><span>🧠 기억</span><span>🔢 계산</span><span>🧩 논리</span><span>🔎 관찰</span></div><button className="primary-button home-play" onClick={() => { setScreen('game'); playSound('tap'); }}>{progress.complete ? '오늘 결과 보기' : progress.answers.length ? '이어서 풀기' : '오늘의 문제 시작'}<ArrowRight size={19}/></button><div className="home-meta"><span>⏱ 약 3분</span><span>🪙 점수 경쟁 없이 편하게</span></div></section>
        <section className="weekly-best-card"><div className="weekly-card-head"><div><span className="weekly-kicker">🏆 MY WEEKLY BEST</span><h2>이번 주 최고기록</h2></div><span className="weekly-period">최근 7일</span></div><div className="weekly-score-main"><div className="weekly-dial" role="img" aria-label={`100점 만점 환산 ${weeklyPercent}점`}><svg viewBox="0 0 100 100" aria-hidden="true"><circle className="dial-track" cx="50" cy="50" r="40"/><circle className="dial-value" cx="50" cy="50" r="40" style={{ strokeDasharray: `${weeklyPercent * 2.513} 251.3` }}/></svg><div className="dial-label"><strong>{weeklyPercent}</strong><span>점</span></div><span className="dial-sparkle">✨</span></div><div className="weekly-score-copy"><b>{weeklyPoints === 0 ? '이번 주 첫 도전을 기다려요' : weeklyPercent >= 80 ? '대단해요! 최고 기록에 가까워요' : weeklyPercent >= 40 ? '좋은 흐름이에요, 계속해봐요' : '시작이 좋아요! 한 문제씩 쌓아봐요'}</b><span>맞힌 문제 {weeklyPoints} / 35개</span><small>주간 점수를 100점 만점으로 환산했어요</small></div></div><div className="weekly-bars" aria-label="요일별 맞힌 문제"><div className="weekly-bar-guides"><i/><i/><i/></div>{weeklyScores.map(({key,points},i)=><div className="weekly-bar-day" key={key}><div className="weekly-bar-track"><i style={{height:`${Math.max(points ? 14 : 0, points / 5 * 100)}%`}}/></div><span>{new Intl.DateTimeFormat('ko-KR',{weekday:'narrow',timeZone:'UTC'}).format(new Date(`${key}T12:00:00Z`))}</span></div>)}</div><div className="weekly-card-foot"><span>📅 {weeklyAnswered}문제 도전했어요</span><span>목표 <b>35점</b></span></div></section>
        <div className="home-shortcuts"><button onClick={() => setModal('rules')}><span>📖</span><b>게임 방법</b><small>쉽게 알아보기</small></button><button onClick={() => setModal('ranking')}><span>🏅</span><b>내 기록</b><small>이번 주 점수</small></button></div>
        <section className="home-streak"><span>🔥</span><div><b>{streak}일 연속 도전 중</b><small>꾸준히 참여한 날을 모아봐요</small></div><ChevronRight size={18}/></section>
      </main> : <main className="main-content">
        <section className="welcome-row"><div><p className="eyebrow">YOUR DAILY BRAIN BOOST</p><h1>하루 5문제,<br />두뇌를 깨워요 <span>✦</span></h1><p className="date-label">{formatDate(date)}</p></div><div className="brain-illustration" aria-hidden="true"><div className="orb orb-one"/><div className="orb orb-two"/><Brain size={52} strokeWidth={1.65}/><Sparkles className="spark" size={19}/></div></section>

        <section className="streak-card"><div className="streak-info"><span className="flame-icon"><Flame size={21} fill="currentColor" /></span><div><span className="streak-count">{streak}일째</span><span className="streak-caption">연속으로 두뇌 운동 중</span></div></div><div className="week-strip">{weekly.map(({ key, result }) => { const done = Boolean(result?.complete); const dayQuestions = getQuestionsByIds(result?.questionIds ?? []); const correct = done ? result!.answers.reduce((sum, answer, i) => sum + (answer === dayQuestions[i]?.answer ? 1 : 0), 0) : 0; return <div className="week-day" key={key}><span>{new Intl.DateTimeFormat('ko-KR', { weekday: 'narrow', timeZone: 'UTC' }).format(new Date(`${key}T12:00:00Z`))}</span><i className={done ? 'day-dot done' : key === date ? 'day-dot today' : 'day-dot'}>{done ? <Check size={12} strokeWidth={3} /> : ''}</i><small>{done ? `${correct}점` : '·'}</small></div>; })}</div></section>

        {questions.length < 5 ? <section className="result-card"><div className="result-icon"><Brain size={27}/></div><p className="eyebrow result-eyebrow">NEW QUESTIONS</p><h2>새 문제를 준비하고 있어요</h2><p className="result-subtitle">이미 나온 문제는 다시 출제하지 않도록 보관하고 있어요.</p></section> : !isDone ? <section className="quiz-card">
          <div className="quiz-topline"><span className="category-pill">{questions[index].category}</span><span className="question-count">{index + 1}<b> / 5</b></span></div>
          <div className="progress-track"><div className="progress-fill" style={{ width: `${(index / 5) * 100}%` }} /></div>
          {isShowingMemory ? <div className="memory-preview" role="status"><p>단어를 기억해 보세요 · 4초</p><div className="memory-items">{currentQuestion.memoryItems!.map((item) => <span key={item}>{item}</span>)}</div><div className="memory-timer"><i/></div></div> : <><h2 className="question-text">{currentQuestion.prompt.split('\n').map((line, i) => <span key={i}>{line}</span>)}</h2><div className="answers">{currentQuestion.options.map((option, i) => <button key={`${date}-${index}-${i}`} disabled={submittedAnswer !== null} className={`answer-option ${selected === i ? 'selected' : ''}`} onClick={() => { setSelected(i); playSound('tap'); }}><span className="answer-letter">{String.fromCharCode(65 + i)}</span><span>{option}</span><span className="answer-check">{selected === i ? <Check size={17} /> : <ChevronRight size={17} />}</span></button>)}</div>{submittedAnswer === null ? <button className="primary-button" disabled={selected === null} onClick={() => { if (selected !== null) { setSubmittedAnswer(selected); playSound(selected === currentQuestion.answer ? 'correct' : 'wrong'); } }} >선택한 답 확인하기<ArrowRight size={18}/></button> : <><div className={`answer-feedback ${submittedAnswer === currentQuestion.answer ? 'correct' : 'incorrect'}`} role="status"><b>{submittedAnswer === currentQuestion.answer ? '맞았어요!' : '괜찮아요, 함께 확인해요.'}</b><span>{currentQuestion.explanation}</span></div><button className="primary-button" onClick={() => saveAnswer(submittedAnswer)}>{index === 4 ? '결과 보기' : '다음 문제'}<ArrowRight size={18}/></button></>}</>}
          {!isShowingMemory && <p className="gentle-note">보기를 고른 뒤 ‘선택한 답 확인하기’를 누르면 정답과 풀이를 볼 수 있어요.</p>}
        </section> : <section className="result-card">
          <div className="result-icon"><Trophy size={29} /></div><p className="eyebrow result-eyebrow">TODAY'S RESULT</p><h2>오늘도 잘했어요!</h2><p className="result-subtitle">꾸준한 하루가 똑똑한 내일을 만들어요.</p>
          <div className="score-board"><div><strong>{score}<small> / 5</small></strong><span>맞힌 문제</span></div><div className="score-divider"/><div><strong>{Math.round(score / 5 * 100)}<small>%</small></strong><span>정답률</span></div></div>
          <div className="result-review"><div className="review-heading">오늘의 답안 <span>정답 {score}개</span></div>{questions.map((question, i) => { const correct = progress.answers[i] === question.answer; return <div className="review-item" key={`${i}-${question.prompt}`}><span className={`review-status ${correct ? 'correct' : 'incorrect'}`}>{correct ? <Check size={14}/> : '×'}</span><div className="review-copy"><b>{i + 1}. {question.prompt.split('\n')[0]}</b><span>{correct ? '정답이에요' : `정답: ${question.options[question.answer]}`} · {question.explanation}</span></div></div>; })}</div>
          <button className="primary-button share-button" onClick={shareResult}>점수 복사해서 공유하기<Copy size={17}/></button><div className="tomorrow-note"><span>🌱</span> 내일 새로운 문제로 다시 만나요</div>
        </section>}

        {isDone && <div className="result-actions"><button onClick={startReplay}><RotateCcw size={17}/> 새 문제로 다시하기</button><button onClick={() => setScreen('home')}><Home size={17}/> 홈</button><button onClick={() => setModal('ranking')}><Medal size={17}/> 기록보기</button></div>}
        <div className="bottom-note"><span className="note-icon">✳</span><span>내 속도로 즐기는 하루 두뇌 운동</span></div>
      </main>}
      {modal && <div className="modal-backdrop" role="presentation" onClick={() => setModal(null)}><section className="info-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" onClick={(event) => event.stopPropagation()}><button className="modal-close" onClick={() => setModal(null)} aria-label="닫기"><X size={20}/></button>{modal === 'rules' ? <><div className="modal-emoji">🎮</div><h2 id="modal-title">게임 방법</h2><ol className="rule-list"><li><span>1</span><div><b>하루 5문제</b><small>기억·계산·논리·관찰 문제를 하나씩 풀어요.</small></div></li><li><span>2</span><div><b>보기를 고르고 확인</b><small>답을 선택하고 ‘선택한 답 확인하기’를 눌러요.</small></div></li><li><span>3</span><div><b>풀이를 보고 다음으로</b><small>맞고 틀려도 괜찮아요. 풀이를 확인한 뒤 계속해요.</small></div></li><li><span>4</span><div><b>새 문제로 다시 도전</b><small>한 번 푼 문제는 다시 나오지 않아요.</small></div></li></ol><button className="primary-button" onClick={() => setModal(null)}>알겠어요<Check size={18}/></button></> : <><div className="modal-emoji">🏅</div><h2 id="modal-title">이번 주 내 기록</h2><p className="ranking-note">개인 기록이에요. 다른 사용자와 겨루는 온라인 순위는 출시 후 서버 연동이 필요해요.</p><div className="ranking-list">{weekly.slice().reverse().map(({key,result}, i) => { const set = getQuestionsByIds(result?.questionIds ?? []); const points = result?.complete ? result.answers.reduce((sum, answer, j) => sum + (answer === set[j]?.answer ? 1 : 0), 0) : null; return <div className="ranking-row" key={key}><span className="rank-medal">{points === null ? '·' : ['🥇','🥈','🥉'][i] ?? '⭐'}</span><b>{key === today ? '오늘' : formatDate(key).replace(/요일$/, '')}</b><div className="rank-track"><i style={{width:`${points === null ? 0 : points * 20}%`}}/></div><strong>{points === null ? '미참여' : `${points}점`}</strong></div>; })}</div><button className="primary-button" onClick={() => setModal(null)}>닫기<Check size={18}/></button></>}</section></div>}
      {toast && <div className="toast"><Check size={16}/>{toast}</div>}
    </div>
  );
}
