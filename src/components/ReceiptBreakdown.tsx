/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CalculationResult } from '../types/calculator';
import { formatKRW, generateShareText } from '../utils/calculator';
import { tossBridge } from '../platform/tossBridge';
import { 
  Receipt, 
  Share2, 
  Copy, 
  BookmarkPlus, 
  AlertCircle, 
  Info, 
  CheckCircle2, 
  ArrowDown, 
  ChevronRight,
  TrendingDown,
  Gift
} from 'lucide-react';

interface ReceiptBreakdownProps {
  result: CalculationResult;
  onOpenMallPolicy: () => void;
  onSaveHistory: () => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const ReceiptBreakdown: React.FC<ReceiptBreakdownProps> = ({
  result,
  onOpenMallPolicy,
  onSaveHistory,
  onShowToast,
}) => {
  const handleShare = async () => {
    const text = generateShareText(result, result.input.name || '상품');
    const outcome = await tossBridge.share({
      title: '진짜 얼마? - 실제 결제금액 계산 결과',
      text,
    });

    if (outcome === 'shared') {
      onShowToast('공유창을 열었습니다.', 'info');
    } else if (outcome === 'copied') {
      onShowToast('결과가 클립보드에 복사되었습니다!', 'success');
    }
  };

  const handleCopy = async () => {
    const text = generateShareText(result, result.input.name || '상품');
    const success = await tossBridge.copyToClipboard(text);
    if (success) {
      onShowToast('결과가 클립보드에 복사되었습니다!', 'success');
    } else {
      onShowToast('복사에 실패했습니다. 권한을 확인해주세요.', 'error');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col">
      {/* Top Banner: Final Price Highlight */}
      <div className="p-5 sm:p-6 bg-gradient-to-br from-blue-600 via-blue-600 to-indigo-700 text-white">
        <div className="flex items-center justify-between text-blue-100 text-xs font-semibold mb-1">
          <div className="flex items-center gap-1.5">
            <Receipt className="w-4 h-4" />
            <span>최종 결제 예상 금액</span>
          </div>
          {result.effectiveDiscountRate > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-white/20 text-white font-bold backdrop-blur-xs">
              체감 {result.effectiveDiscountRate}% 할인 효과
            </span>
          )}
        </div>

        {/* Big Number */}
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-4xl sm:text-5xl font-black tracking-tight tabular-nums">
            {formatKRW(result.finalPrice)}
          </span>
        </div>

        {/* Savings Pill */}
        {result.totalSavings > 0 ? (
          <div className="mt-3.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/15 text-xs font-bold backdrop-blur-xs text-white">
            <Gift className="w-3.5 h-3.5 text-amber-300" />
            <span>정가 대비 총 {formatKRW(result.totalSavings)} 아꼈어요!</span>
          </div>
        ) : (
          <p className="mt-2 text-xs text-blue-100/90 font-medium">
            할인율이나 쿠폰을 적용하여 아낄 수 있는 금액을 확인해보세요.
          </p>
        )}
      </div>

      {/* Warnings (if any) */}
      {result.warnings.length > 0 && (
        <div className="px-5 py-3 bg-amber-50 border-b border-amber-100 text-xs text-amber-900 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            {result.warnings.map((w, idx) => (
              <p key={idx}>{w}</p>
            ))}
          </div>
        </div>
      )}

      {/* Step by Step Receipt Breakdown */}
      <div className="p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-400 tracking-wider uppercase">
            계산 순서 및 영수증 상세
          </h4>
          <span className="text-[11px] text-slate-400">1~5단계 순차 적용</span>
        </div>

        <div className="space-y-2.5 text-xs font-medium">
          {/* 1. 정가 */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
            <span className="text-slate-600">1. 상품 정가</span>
            <span className="font-bold text-slate-900 tabular-nums">
              {formatKRW(result.originalPrice)}
            </span>
          </div>

          {/* 2. 할인율 */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
            <div className="flex items-center gap-1.5 text-slate-600">
              <span>2. 할인율 적용 ({result.discountRate}%)</span>
            </div>
            <div className="text-right">
              <span className={`font-bold tabular-nums ${result.discountAmount > 0 ? 'text-indigo-600' : 'text-slate-400'}`}>
                {result.discountAmount > 0 ? `-${formatKRW(result.discountAmount)}` : '0원'}
              </span>
              <div className="text-[10px] text-slate-400">
                할인 후 {formatKRW(result.priceAfterDiscount)}
              </div>
            </div>
          </div>

          {/* 3. 쿠폰 할인 */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
            <span className="text-slate-600">3. 쿠폰 할인</span>
            <div className="text-right">
              <span className={`font-bold tabular-nums ${result.couponDiscountApplied > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                {result.couponDiscountApplied > 0 ? `-${formatKRW(result.couponDiscountApplied)}` : '0원'}
              </span>
              <div className="text-[10px] text-slate-400">
                상품가 {formatKRW(result.productSubtotal)}
              </div>
            </div>
          </div>

          {/* 4. 배송비 */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
            <span className="text-slate-600">4. 배송비</span>
            <span className={`font-bold tabular-nums ${result.shippingFee > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
              {result.shippingFee === 0 ? '0원 (무료)' : `+${formatKRW(result.shippingFee)}`}
            </span>
          </div>

          {/* 5. 적립금 */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
            <span className="text-slate-600">5. 사용 적립금</span>
            <span className={`font-bold tabular-nums ${result.pointsUsedApplied > 0 ? 'text-purple-600' : 'text-slate-400'}`}>
              {result.pointsUsedApplied > 0 ? `-${formatKRW(result.pointsUsedApplied)}` : '0원'}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-dashed border-slate-200 pt-3 flex items-center justify-between">
          <span className="text-sm font-black text-slate-900">진짜 최종 결제금액</span>
          <span className="text-lg font-black text-blue-600 tabular-nums">
            {formatKRW(result.finalPrice)}
          </span>
        </div>

        {/* Shopping Mall Policy Banner */}
        <button
          onClick={onOpenMallPolicy}
          className="w-full p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-left transition-colors flex items-center justify-between group"
        >
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-600 shrink-0" />
            <p className="text-[11px] text-slate-600 leading-tight">
              실제 쇼핑몰(쿠팡·네이버 등)마다 할인 적용 순서가 다를 수 있습니다.
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 shrink-0" />
        </button>
      </div>

      {/* Action Buttons: Copy, Share, Save */}
      <div className="p-4 sm:p-5 bg-slate-50/80 border-t border-slate-100 grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={handleCopy}
          className="h-11 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs border border-slate-200 shadow-2xs flex items-center justify-center gap-1.5 transition-colors active:scale-95"
        >
          <Copy className="w-4 h-4 text-slate-600" />
          <span>결과 복사</span>
        </button>

        <button
          type="button"
          onClick={handleShare}
          className="h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-1.5 transition-colors active:scale-95"
        >
          <Share2 className="w-4 h-4" />
          <span>공유하기</span>
        </button>

        <button
          type="button"
          onClick={onSaveHistory}
          className="h-11 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs border border-slate-200 shadow-2xs flex items-center justify-center gap-1.5 transition-colors active:scale-95"
        >
          <BookmarkPlus className="w-4 h-4 text-slate-600" />
          <span>기록 저장</span>
        </button>
      </div>
    </div>
  );
};
