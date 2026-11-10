/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Trash2, Clock, ArrowRight, RotateCcw } from 'lucide-react';
import { SavedCalculation, PriceInput } from '../types/calculator';
import { formatKRW } from '../utils/calculator';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: SavedCalculation[];
  onLoadSingle: (input: PriceInput) => void;
  onLoadCompare: (inputA: PriceInput, inputB: PriceInput) => void;
  onClearHistory: () => void;
  onDeleteOne: (id: string) => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  history,
  onLoadSingle,
  onLoadCompare,
  onClearHistory,
  onDeleteOne,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">최근 계산 기록</h3>
              <p className="text-xs text-slate-500">저장된 계산 내역 ({history.length}건)</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {history.length > 0 && (
              <button
                onClick={onClearHistory}
                className="px-2.5 py-1 text-xs text-rose-600 hover:bg-rose-50 rounded-lg transition-colors font-medium"
              >
                전체 삭제
              </button>
            )}
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="닫기"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3">
          {history.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Clock className="w-10 h-10 mx-auto mb-2 text-slate-300 stroke-[1.5]" />
              <p className="text-sm font-medium text-slate-600">아직 저장된 계산 기록이 없습니다</p>
              <p className="text-xs text-slate-400 mt-1">계산 결과에서 '기록에 저장'을 누르면 여기에 보관됩니다.</p>
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-200 transition-all flex flex-col gap-2.5 shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                      {item.mode === 'single' ? '단일 계산' : 'A·B 비교'}
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(item.timestamp).toLocaleDateString('ko-KR', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <button
                    onClick={() => onDeleteOne(item.id)}
                    className="p-1 text-slate-400 hover:text-rose-500 rounded transition-colors"
                    title="기록 삭제"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {item.mode === 'single' && item.singleResult && (
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900 text-sm">
                        {item.singleResult.input.name || '상품'}
                      </div>
                      <div className="text-xs text-slate-500">
                        정가 {formatKRW(item.singleResult.originalPrice)} · 할인 {item.singleResult.discountRate}%
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-400">최종 결제금액</div>
                      <div className="font-extrabold text-blue-600 text-base">
                        {formatKRW(item.singleResult.finalPrice)}
                      </div>
                    </div>
                  </div>
                )}

                {item.mode === 'compare' && item.compareResult && (
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900 text-sm">
                        A({formatKRW(item.compareResult.productA.finalPrice)}) vs B({formatKRW(item.compareResult.productB.finalPrice)})
                      </div>
                      <div className="text-xs text-emerald-600 font-medium">
                        {item.compareResult.summaryMessage}
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() => {
                      if (item.mode === 'single' && item.singleResult) {
                        onLoadSingle(item.singleResult.input);
                        onClose();
                      } else if (item.mode === 'compare' && item.compareResult) {
                        onLoadCompare(item.compareResult.productA.input, item.compareResult.productB.input);
                        onClose();
                      }
                    }}
                    className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>이 값 불러오기</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-white">
          <button
            onClick={onClose}
            className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
