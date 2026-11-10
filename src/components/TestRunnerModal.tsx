/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, CheckCircle, AlertCircle, RefreshCw, Cpu, Check, ShieldCheck } from 'lucide-react';
import { runAllTests } from '../utils/calculatorTests';
import { TestSuiteSummary } from '../types/calculator';

interface TestRunnerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TestRunnerModal: React.FC<TestRunnerModalProps> = ({ isOpen, onClose }) => {
  const [suite, setSuite] = useState<TestSuiteSummary>(() => runAllTests());
  const [isRunning, setIsRunning] = useState(false);

  if (!isOpen) return null;

  const handleReRun = () => {
    setIsRunning(true);
    setTimeout(() => {
      setSuite(runAllTests());
      setIsRunning(false);
    }, 250);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white rounded-t-3xl sm:rounded-2xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                <span>계산 엔진 자동 검증 테스트</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {suite.allPassed ? '전체 정상 통과' : '오류 발견'}
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                11개 주요 비즈니스 규칙 및 0원 미만 방지 실시간 검증
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Scoreboard */}
        <div className="px-5 py-3.5 bg-emerald-50/70 border-b border-emerald-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
            <div>
              <div className="text-xs font-semibold text-emerald-900">
                총 {suite.total}개 테스트 중 <span className="font-bold text-emerald-700">{suite.passed}개 성공</span> ({suite.failed}개 실패)
              </div>
              <div className="text-[11px] text-emerald-700">마지막 검증 시각: {suite.executedAt}</div>
            </div>
          </div>
          <button
            onClick={handleReRun}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-emerald-800 rounded-lg text-xs font-semibold shadow-xs border border-emerald-200 hover:bg-emerald-100 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
            <span>재검증</span>
          </button>
        </div>

        {/* Test List */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3">
          {suite.results.map((test, index) => (
            <div
              key={test.id}
              className={`p-3.5 rounded-xl border text-xs transition-colors ${
                test.passed
                  ? 'bg-white border-slate-200/80 hover:border-slate-300'
                  : 'bg-rose-50 border-rose-200'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-[10px] font-bold">
                    {index + 1}
                  </span>
                  <span className="font-bold text-slate-900 text-sm">{test.name}</span>
                </div>
                {test.passed ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                    <Check className="w-3 h-3" /> 통과
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                    <AlertCircle className="w-3 h-3" /> 실패
                  </span>
                )}
              </div>
              <p className="text-slate-600 mb-2">{test.description}</p>
              <div className="p-2 bg-slate-50 rounded-lg font-mono text-[11px] text-slate-700 break-all">
                {test.details}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-white flex items-center justify-between gap-3">
          <p className="text-[11px] text-slate-500">
            초보자도 신뢰할 수 있도록 모든 연산은 자동 테스트 검증을 거칩니다.
          </p>
          <button
            onClick={onClose}
            className="py-2.5 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs transition-colors shrink-0"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
