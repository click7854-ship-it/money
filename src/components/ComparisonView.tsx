/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PriceInput, ComparisonResult } from '../types/calculator';
import { PriceInputSection } from './PriceInputSection';
import { formatKRW, generateComparisonShareText } from '../utils/calculator';
import { tossBridge } from '../platform/tossBridge';
import { 
  Trophy, 
  Scale, 
  Share2, 
  Copy, 
  BookmarkPlus, 
  ArrowRight, 
  CheckCircle2, 
  TrendingDown, 
  Sparkles,
  Info
} from 'lucide-react';

interface ComparisonViewProps {
  productA: PriceInput;
  productB: PriceInput;
  onChangeProductA: (val: PriceInput) => void;
  onChangeProductB: (val: PriceInput) => void;
  comparison: ComparisonResult;
  onOpenMallPolicy: () => void;
  onSaveHistory: () => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({
  productA,
  productB,
  onChangeProductA,
  onChangeProductB,
  comparison,
  onOpenMallPolicy,
  onSaveHistory,
  onShowToast,
}) => {
  // Mobile active tab between Product A and Product B
  const [activeTab, setActiveTab] = useState<'A' | 'B'>('A');

  const handleCopy = async () => {
    const text = generateComparisonShareText(comparison);
    const success = await tossBridge.copyToClipboard(text);
    if (success) {
      onShowToast('비교 결과가 복사되었습니다!', 'success');
    } else {
      onShowToast('복사에 실패했습니다.', 'error');
    }
  };

  const handleShare = async () => {
    const text = generateComparisonShareText(comparison);
    const outcome = await tossBridge.share({
      title: '진짜 얼마? - 상품 A vs B 가격 비교 결과',
      text,
    });
    if (outcome === 'shared') {
      onShowToast('공유창을 열었습니다.', 'info');
    } else if (outcome === 'copied') {
      onShowToast('비교 결과가 복사되었습니다!', 'success');
    }
  };

  const isTie = comparison.winner === 'TIE';
  const isAWinner = comparison.winner === 'A';
  const isBWinner = comparison.winner === 'B';

  return (
    <div className="space-y-4">
      {/* 1. Comparison Winner Banner Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 overflow-hidden">
        <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
          <div className="flex items-center gap-1.5 text-blue-600">
            <Scale className="w-4 h-4" />
            <span>실시간 가격 비교 판정</span>
          </div>
          {comparison.priceDiff > 0 && (
            <span className="text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              최대 {formatKRW(comparison.priceDiff)} 절약
            </span>
          )}
        </div>

        {/* Winner Highlight Box */}
        <div className={`p-4 rounded-xl text-center flex flex-col items-center justify-center transition-all ${
          isTie 
            ? 'bg-slate-100 text-slate-800' 
            : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/15'
        }`}>
          <div className="flex items-center gap-2 mb-1">
            {!isTie && <Trophy className="w-6 h-6 text-amber-300 animate-bounce" />}
            <span className="text-xl sm:text-2xl font-black tracking-tight">
              {comparison.summaryMessage}
            </span>
          </div>
          <p className={`text-xs ${isTie ? 'text-slate-500' : 'text-blue-100 font-medium'}`}>
            {isTie
              ? '두 상품의 할인 및 배송비 적용 후 결제금액이 정확히 일치합니다.'
              : `${comparison.winner === 'A' ? (productA.name || '상품 A') : (productB.name || '상품 B')}를 구매하시는 것이 훨씬 이득입니다!`}
          </p>
        </div>

        {/* Quick Side by Side Pill Comparison */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          {/* Card A */}
          <div className={`p-3.5 rounded-xl border text-center transition-all ${
            isAWinner
              ? 'bg-blue-50/80 border-blue-300 ring-2 ring-blue-500/20'
              : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center justify-center gap-1 text-xs font-bold text-slate-700 mb-1">
              {isAWinner && <span className="text-blue-600 font-black">WINNER</span>}
              <span>{productA.name || '상품 A'}</span>
            </div>
            <div className="text-xl font-black text-slate-900 tabular-nums">
              {formatKRW(comparison.productA.finalPrice)}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              정가 {formatKRW(comparison.productA.originalPrice)} · {comparison.productA.effectiveDiscountRate}% 절감
            </div>
          </div>

          {/* Card B */}
          <div className={`p-3.5 rounded-xl border text-center transition-all ${
            isBWinner
              ? 'bg-blue-50/80 border-blue-300 ring-2 ring-blue-500/20'
              : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center justify-center gap-1 text-xs font-bold text-slate-700 mb-1">
              {isBWinner && <span className="text-blue-600 font-black">WINNER</span>}
              <span>{productB.name || '상품 B'}</span>
            </div>
            <div className="text-xl font-black text-slate-900 tabular-nums">
              {formatKRW(comparison.productB.finalPrice)}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              정가 {formatKRW(comparison.productB.originalPrice)} · {comparison.productB.effectiveDiscountRate}% 절감
            </div>
          </div>
        </div>

        {/* Comparison Details Table */}
        <div className="mt-4 pt-3 border-t border-slate-100 overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400">
                <th className="pb-2 font-semibold">비교 항목</th>
                <th className="pb-2 text-center font-semibold text-slate-700">상품 A</th>
                <th className="pb-2 text-center font-semibold text-slate-700">상품 B</th>
                <th className="pb-2 text-right font-semibold">차이</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 tabular-nums">
              <tr>
                <td className="py-2 text-slate-600 font-medium">정가</td>
                <td className="py-2 text-center font-semibold">{formatKRW(comparison.productA.originalPrice)}</td>
                <td className="py-2 text-center font-semibold">{formatKRW(comparison.productB.originalPrice)}</td>
                <td className="py-2 text-right text-slate-500">
                  {formatKRW(Math.abs(comparison.productA.originalPrice - comparison.productB.originalPrice))}
                </td>
              </tr>
              <tr>
                <td className="py-2 text-slate-600 font-medium">할인율</td>
                <td className="py-2 text-center text-indigo-600 font-semibold">{comparison.productA.discountRate}%</td>
                <td className="py-2 text-center text-indigo-600 font-semibold">{comparison.productB.discountRate}%</td>
                <td className="py-2 text-right text-slate-500">
                  {Math.abs(comparison.productA.discountRate - comparison.productB.discountRate)}%
                </td>
              </tr>
              <tr>
                <td className="py-2 text-slate-600 font-medium">쿠폰 할인</td>
                <td className="py-2 text-center text-emerald-600 font-semibold">-{formatKRW(comparison.productA.couponDiscountApplied)}</td>
                <td className="py-2 text-center text-emerald-600 font-semibold">-{formatKRW(comparison.productB.couponDiscountApplied)}</td>
                <td className="py-2 text-right text-slate-500">
                  {formatKRW(Math.abs(comparison.productA.couponDiscountApplied - comparison.productB.couponDiscountApplied))}
                </td>
              </tr>
              <tr>
                <td className="py-2 text-slate-600 font-medium">배송비</td>
                <td className="py-2 text-center font-semibold">
                  {comparison.productA.shippingFee === 0 ? <span className="text-emerald-600">무료</span> : `+${formatKRW(comparison.productA.shippingFee)}`}
                </td>
                <td className="py-2 text-center font-semibold">
                  {comparison.productB.shippingFee === 0 ? <span className="text-emerald-600">무료</span> : `+${formatKRW(comparison.productB.shippingFee)}`}
                </td>
                <td className="py-2 text-right text-slate-500">
                  {formatKRW(Math.abs(comparison.productA.shippingFee - comparison.productB.shippingFee))}
                </td>
              </tr>
              <tr className="bg-blue-50/50 font-bold">
                <td className="py-2.5 text-slate-900 pl-2 rounded-l-lg">최종 결제금액</td>
                <td className={`py-2.5 text-center ${isAWinner ? 'text-blue-700 font-black' : 'text-slate-800'}`}>
                  {formatKRW(comparison.productA.finalPrice)}
                </td>
                <td className={`py-2.5 text-center ${isBWinner ? 'text-blue-700 font-black' : 'text-slate-800'}`}>
                  {formatKRW(comparison.productB.finalPrice)}
                </td>
                <td className="py-2.5 text-right text-blue-700 font-black pr-2 rounded-r-lg">
                  {comparison.priceDiff > 0 ? `${formatKRW(comparison.priceDiff)} 차이` : '동일'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Comparison Actions */}
        <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>비교 복사</span>
          </button>
          <button
            type="button"
            onClick={handleShare}
            className="h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>비교 공유</span>
          </button>
          <button
            type="button"
            onClick={onSaveHistory}
            className="h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <BookmarkPlus className="w-3.5 h-3.5" />
            <span>비교 저장</span>
          </button>
        </div>
      </div>

      {/* 2. Mobile Tab Switcher for inputs (or side-by-side on lg: desktop) */}
      <div className="lg:hidden flex items-center p-1 bg-slate-200/80 rounded-xl">
        <button
          type="button"
          onClick={() => {
            tossBridge.triggerHaptic('light');
            setActiveTab('A');
          }}
          className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'A'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>상품 A 조건 입력</span>
          <span className="text-[11px] font-semibold text-slate-400">
            ({formatKRW(comparison.productA.finalPrice)})
          </span>
        </button>
        <button
          type="button"
          onClick={() => {
            tossBridge.triggerHaptic('light');
            setActiveTab('B');
          }}
          className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'B'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>상품 B 조건 입력</span>
          <span className="text-[11px] font-semibold text-slate-400">
            ({formatKRW(comparison.productB.finalPrice)})
          </span>
        </button>
      </div>

      {/* Inputs: Tabbed on mobile, 2 columns on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className={activeTab === 'A' ? 'block' : 'hidden lg:block'}>
          <PriceInputSection
            title="상품 A 조건"
            badge="상품 A"
            badgeColor="blue"
            value={productA}
            onChange={onChangeProductA}
          />
        </div>
        <div className={activeTab === 'B' ? 'block' : 'hidden lg:block'}>
          <PriceInputSection
            title="상품 B 조건"
            badge="상품 B"
            badgeColor="purple"
            value={productB}
            onChange={onChangeProductB}
          />
        </div>
      </div>
    </div>
  );
};
