/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { PriceInput, SavedCalculation } from './types/calculator';
import { calculatePrice, compareProducts, formatKRW } from './utils/calculator';
import { Header } from './components/Header';
import { PriceInputSection } from './components/PriceInputSection';
import { ReceiptBreakdown } from './components/ReceiptBreakdown';
import { ComparisonView } from './components/ComparisonView';
import { MallPolicyModal } from './components/MallPolicyModal';
import { TestRunnerModal } from './components/TestRunnerModal';
import { HistoryModal } from './components/HistoryModal';
import { MobileTestModal } from './components/MobileTestModal';
import { Toast, ToastProps } from './components/Toast';
import { tossBridge } from './platform/tossBridge';
import { 
  Sparkles, 
  HelpCircle, 
  ShieldCheck, 
  Zap, 
  ShoppingBag, 
  Check, 
  Info,
  Layers
} from 'lucide-react';

const STORAGE_KEY_SINGLE = 'real_price_calc_single_v1';
const STORAGE_KEY_COMPARE_A = 'real_price_calc_compare_a_v1';
const STORAGE_KEY_COMPARE_B = 'real_price_calc_compare_b_v1';
const STORAGE_KEY_HISTORY = 'real_price_calc_history_v1';

const DEFAULT_SINGLE: PriceInput = {
  name: '원피스 / 셔츠',
  originalPrice: 65000,
  discountRate: 20,
  couponDiscount: 5000,
  shippingFee: 3000,
  pointsUsed: 2000,
};

const DEFAULT_COMPARE_A: PriceInput = {
  name: '쿠팡 로켓배송',
  originalPrice: 49000,
  discountRate: 15,
  couponDiscount: 3000,
  shippingFee: 0,
  pointsUsed: 0,
};

const DEFAULT_COMPARE_B: PriceInput = {
  name: '네이버 스마트스토어',
  originalPrice: 42000,
  discountRate: 0,
  couponDiscount: 2000,
  shippingFee: 3000,
  pointsUsed: 1500,
};

export default function App() {
  const [mode, setMode] = useState<'single' | 'compare'>('single');

  // Input states
  const [singleInput, setSingleInput] = useState<PriceInput>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SINGLE);
      return saved ? JSON.parse(saved) : DEFAULT_SINGLE;
    } catch {
      return DEFAULT_SINGLE;
    }
  });

  const [compareA, setCompareA] = useState<PriceInput>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_COMPARE_A);
      return saved ? JSON.parse(saved) : DEFAULT_COMPARE_A;
    } catch {
      return DEFAULT_COMPARE_A;
    }
  });

  const [compareB, setCompareB] = useState<PriceInput>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_COMPARE_B);
      return saved ? JSON.parse(saved) : DEFAULT_COMPARE_B;
    } catch {
      return DEFAULT_COMPARE_B;
    }
  });

  // History state
  const [history, setHistory] = useState<SavedCalculation[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_HISTORY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Modals
  const [isTestRunnerOpen, setIsTestRunnerOpen] = useState(false);
  const [isMallPolicyOpen, setIsMallPolicyOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isMobileTestOpen, setIsMobileTestOpen] = useState(false);

  // Shared URL for mobile testing
  const sharedUrl = typeof window !== 'undefined' 
    ? (window.location.origin.includes('ais-dev') 
        ? window.location.origin.replace('ais-dev', 'ais-pre') 
        : window.location.href)
    : 'https://ais-pre-tq5p63qrhzfpzwl3ogtssp-352617199139.asia-east1.run.app';

  // Toast
  const [toast, setToast] = useState<{ message: string; type: ToastProps['type'] } | null>(null);

  const showToast = (message: string, type: ToastProps['type'] = 'success') => {
    setToast({ message, type });
  };

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SINGLE, JSON.stringify(singleInput));
    } catch {
      // Storage unavailable
    }
  }, [singleInput]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_COMPARE_A, JSON.stringify(compareA));
      localStorage.setItem(STORAGE_KEY_COMPARE_B, JSON.stringify(compareB));
    } catch {
      // Storage unavailable
    }
  }, [compareA, compareB]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history));
    } catch {
      // Storage unavailable
    }
  }, [history]);

  // Real-time calculation memos
  const singleResult = useMemo(() => calculatePrice(singleInput), [singleInput]);
  const comparisonResult = useMemo(() => compareProducts(compareA, compareB), [compareA, compareB]);

  // Quick Preset Scenarios for Operators & Users
  const applyPreset = (presetName: string) => {
    tossBridge.triggerHaptic('medium');
    if (presetName === 'fashion') {
      setSingleInput({
        name: '가을 트렌치 코트',
        originalPrice: 129000,
        discountRate: 30,
        couponDiscount: 10000,
        shippingFee: 3000,
        pointsUsed: 5000,
      });
      showToast('가을 패션 특가 예시가 적용되었습니다.');
    } else if (presetName === 'digital') {
      setSingleInput({
        name: '노이즈캔슬링 무선 헤드폰',
        originalPrice: 289000,
        discountRate: 15,
        couponDiscount: 20000,
        shippingFee: 0,
        pointsUsed: 10000,
      });
      showToast('전자기기 빅세일 예시가 적용되었습니다.');
    } else if (presetName === 'daily') {
      setSingleInput({
        name: '유기농 세탁세제 3개입 세트',
        originalPrice: 32000,
        discountRate: 10,
        couponDiscount: 3000,
        shippingFee: 2500,
        pointsUsed: 1000,
      });
      showToast('생활특가 예시가 적용되었습니다.');
    }
  };

  const handleReset = () => {
    if (mode === 'single') {
      setSingleInput({
        name: '',
        originalPrice: 0,
        discountRate: 0,
        couponDiscount: 0,
        shippingFee: 0,
        pointsUsed: 0,
      });
      showToast('단일 계산기가 초기화되었습니다.', 'info');
    } else {
      setCompareA({
        name: '상품 A',
        originalPrice: 0,
        discountRate: 0,
        couponDiscount: 0,
        shippingFee: 0,
        pointsUsed: 0,
      });
      setCompareB({
        name: '상품 B',
        originalPrice: 0,
        discountRate: 0,
        couponDiscount: 0,
        shippingFee: 0,
        pointsUsed: 0,
      });
      showToast('비교 계산기가 초기화되었습니다.', 'info');
    }
  };

  const saveCurrentToHistory = () => {
    tossBridge.triggerHaptic('success');
    const newRecord: SavedCalculation = {
      id: `calc_${Date.now()}`,
      timestamp: Date.now(),
      mode,
      title: mode === 'single' ? (singleInput.name || '단일 계산') : 'A vs B 비교 계산',
      singleResult: mode === 'single' ? singleResult : undefined,
      compareResult: mode === 'compare' ? comparisonResult : undefined,
    };

    setHistory((prev) => [newRecord, ...prev.slice(0, 19)]);
    showToast('최근 계산 기록에 저장되었습니다!', 'success');
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans selection:bg-blue-500 selection:text-white">
      {/* Top Header */}
      <Header
        mode={mode}
        onModeChange={setMode}
        onOpenTestRunner={() => setIsTestRunnerOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenMallPolicy={() => setIsMallPolicyOpen(true)}
        onOpenMobileTest={() => setIsMobileTestOpen(true)}
        onReset={handleReset}
        historyCount={history.length}
      />

      {/* Main Responsive Body Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-3 sm:p-5 lg:p-6 pb-20">
        {/* Mobile / Toss Test Quick Launcher Banner */}
        <div className="mb-3.5 p-3 sm:p-3.5 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 rounded-2xl text-white shadow-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0 backdrop-blur-xs">
              <span className="text-base">📱</span>
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold flex items-center gap-1.5">
                <span>내 휴대폰 / 토스 앱에서 직접 테스트하기</span>
                <span className="text-[10px] bg-white/25 px-1.5 py-0.5 rounded-full font-medium">QR 코드</span>
              </div>
              <p className="text-[11px] text-blue-100 hidden sm:block">
                카메라로 QR 코드를 스캔하거나 링크를 복사하여 토스 웹뷰에서 즉시 실행해보세요.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsMobileTestOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-white text-blue-600 hover:bg-blue-50 font-bold text-xs shadow-xs transition-colors shrink-0"
          >
            QR 코드 열기
          </button>
        </div>
        {/* Preset Chips (Single mode only) */}
        {mode === 'single' && (
          <div className="mb-4 flex items-center justify-between gap-2 overflow-x-auto pb-1 text-xs">
            <div className="flex items-center gap-1.5 shrink-0 text-slate-500 font-medium">
              <Zap className="w-3.5 h-3.5 text-blue-600" />
              <span>빠른 예시:</span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => applyPreset('fashion')}
                className="px-2.5 py-1 rounded-full bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 text-xs font-semibold shadow-2xs transition-colors"
              >
                패션 특가 (30% + 1만 쿠폰)
              </button>
              <button
                type="button"
                onClick={() => applyPreset('digital')}
                className="px-2.5 py-1 rounded-full bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 text-xs font-semibold shadow-2xs transition-colors"
              >
                전자기기 빅세일
              </button>
              <button
                type="button"
                onClick={() => applyPreset('daily')}
                className="px-2.5 py-1 rounded-full bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 text-xs font-semibold shadow-2xs transition-colors"
              >
                생활용품 (배송비 포함)
              </button>
            </div>
          </div>
        )}

        {/* View Mode Switching */}
        {mode === 'single' ? (
          /* Single Product Mode: 2 Columns on Desktop, Stack on Mobile */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left: Input Form (7 cols on lg:) */}
            <div className="lg:col-span-7">
              <PriceInputSection
                value={singleInput}
                onChange={setSingleInput}
                title="상품 및 할인 조건"
                badge="단일 계산"
                badgeColor="blue"
              />
            </div>

            {/* Right: Receipt Breakdown (5 cols on lg:) */}
            <div className="lg:col-span-5 lg:sticky lg:top-20">
              <ReceiptBreakdown
                result={singleResult}
                onOpenMallPolicy={() => setIsMallPolicyOpen(true)}
                onSaveHistory={saveCurrentToHistory}
                onShowToast={showToast}
              />
            </div>
          </div>
        ) : (
          /* Comparison Mode: Product A vs Product B */
          <ComparisonView
            productA={compareA}
            productB={compareB}
            onChangeProductA={setCompareA}
            onChangeProductB={setCompareB}
            comparison={comparisonResult}
            onOpenMallPolicy={() => setIsMallPolicyOpen(true)}
            onSaveHistory={saveCurrentToHistory}
            onShowToast={showToast}
          />
        )}

        {/* Footer Explanatory Information */}
        <footer className="mt-10 pt-6 border-t border-slate-200/80 text-center text-xs text-slate-500 space-y-2">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
            <button
              onClick={() => setIsMallPolicyOpen(true)}
              className="hover:text-blue-600 underline font-medium"
            >
              쇼핑몰별 계산 순서 차이 안내
            </button>
            <span>·</span>
            <button
              onClick={() => setIsTestRunnerOpen(true)}
              className="hover:text-emerald-700 font-medium inline-flex items-center gap-1"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>계산 엔진 11개 자동 검증 테스트</span>
            </button>
            <span>·</span>
            <button
              onClick={() => setIsHistoryOpen(true)}
              className="hover:text-blue-600 font-medium"
            >
              저장된 계산 내역 ({history.length}건)
            </button>
          </div>
          <p className="text-[11px] text-slate-400">
            진짜 얼마?는 정가, 할인율, 쿠폰, 배송비, 적립금을 원스톱으로 계산하여 합리적인 소비를 돕습니다.
          </p>
        </footer>
      </main>

      {/* Modals & Dialogs */}
      <MallPolicyModal
        isOpen={isMallPolicyOpen}
        onClose={() => setIsMallPolicyOpen(false)}
      />

      <TestRunnerModal
        isOpen={isTestRunnerOpen}
        onClose={() => setIsTestRunnerOpen(false)}
      />

      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onLoadSingle={(input) => {
          setMode('single');
          setSingleInput(input);
          showToast('저장된 단일 계산을 불러왔습니다.');
        }}
        onLoadCompare={(a, b) => {
          setMode('compare');
          setCompareA(a);
          setCompareB(b);
          showToast('저장된 A·B 비교 계산을 불러왔습니다.');
        }}
        onClearHistory={() => {
          setHistory([]);
          showToast('모든 기록이 삭제되었습니다.', 'info');
        }}
        onDeleteOne={(id) => {
          setHistory((prev) => prev.filter((item) => item.id !== id));
          showToast('해당 기록이 삭제되었습니다.', 'info');
        }}
      />

      {/* Mobile & Toss App Test Modal */}
      <MobileTestModal
        isOpen={isMobileTestOpen}
        onClose={() => setIsMobileTestOpen(false)}
        sharedUrl={sharedUrl}
        onShowToast={showToast}
      />

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
