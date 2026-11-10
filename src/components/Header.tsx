/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Calculator, Scale, History, RotateCcw, ShieldCheck, HelpCircle, Smartphone } from 'lucide-react';
import { tossBridge } from '../platform/tossBridge';

interface HeaderProps {
  mode: 'single' | 'compare';
  onModeChange: (mode: 'single' | 'compare') => void;
  onOpenTestRunner: () => void;
  onOpenHistory: () => void;
  onOpenMallPolicy: () => void;
  onOpenMobileTest: () => void;
  onReset: () => void;
  historyCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  mode,
  onModeChange,
  onOpenTestRunner,
  onOpenHistory,
  onOpenMallPolicy,
  onOpenMobileTest,
  onReset,
  historyCount,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-5xl mx-auto px-4 py-2.5 flex items-center justify-between gap-2">
        {/* Brand Zone */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
            <Calculator className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-black tracking-tight text-slate-900">진짜 얼마?</span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium hidden sm:block">실제 결제금액 계산기</p>
          </div>
        </div>

        {/* Center / Mode Toggle */}
        <div className="flex items-center p-1 bg-slate-100/90 rounded-xl border border-slate-200/60">
          <button
            onClick={() => {
              tossBridge.triggerHaptic('light');
              onModeChange('single');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              mode === 'single'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>단일 상품</span>
          </button>
          <button
            onClick={() => {
              tossBridge.triggerHaptic('light');
              onModeChange('compare');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              mode === 'compare'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>A·B 비교</span>
          </button>
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center gap-1">
          {/* 모바일/토스 테스트 QR 열기 */}
          <button
            onClick={() => {
              tossBridge.triggerHaptic('light');
              onOpenMobileTest();
            }}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors shadow-2xs"
            title="스마트폰 및 토스 앱에서 열기 (QR 코드)"
          >
            <Smartphone className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">휴대폰/토스로 열기</span>
            <span className="sm:hidden">QR</span>
          </button>

          {/* 쇼핑몰 규칙 안내 */}
          <button
            onClick={() => {
              tossBridge.triggerHaptic('light');
              onOpenMallPolicy();
            }}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-blue-600 hover:bg-slate-100 transition-colors"
            title="계산 규칙 및 쇼핑몰 차이 안내"
            aria-label="쇼핑몰 계산 안내"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* 테스트 검증기 버튼 */}
          <button
            onClick={() => {
              tossBridge.triggerHaptic('light');
              onOpenTestRunner();
            }}
            className="hidden xs:flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200/80 transition-colors"
            title="11개 자동 테스트 실행 및 검증"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">공식 검증</span>
          </button>

          {/* 최근 기록 */}
          <button
            onClick={() => {
              tossBridge.triggerHaptic('light');
              onOpenHistory();
            }}
            className="relative w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="최근 계산 기록"
            aria-label="최근 기록"
          >
            <History className="w-4 h-4" />
            {historyCount > 0 && (
              <span className="absolute 1 top-1 right-1 w-2 h-2 rounded-full bg-blue-600" />
            )}
          </button>

          {/* 리셋 버튼 */}
          <button
            onClick={() => {
              tossBridge.triggerHaptic('medium');
              onReset();
            }}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            title="모든 값 초기화"
            aria-label="초기화"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
