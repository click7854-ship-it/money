/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { PriceInput } from '../types/calculator';
import { formatKRW } from '../utils/calculator';
import { tossBridge } from '../platform/tossBridge';
import { Tag, Percent, Ticket, Truck, Coins, Sparkles, X } from 'lucide-react';

interface PriceInputSectionProps {
  value: PriceInput;
  onChange: (updated: PriceInput) => void;
  title?: string;
  badge?: string;
  badgeColor?: 'blue' | 'purple' | 'emerald';
  compact?: boolean;
}

export const PriceInputSection: React.FC<PriceInputSectionProps> = ({
  value,
  onChange,
  title,
  badge,
  badgeColor = 'blue',
  compact = false,
}) => {
  // 헬퍼: 숫자 안전 업데이트
  const updateField = (field: keyof PriceInput, val: number | string) => {
    let sanitized = val;
    if (typeof val === 'number') {
      sanitized = isNaN(val) ? 0 : Math.max(0, val);
    }
    onChange({
      ...value,
      [field]: sanitized,
    });
  };

  // 퀵 버튼 추가
  const addPrice = (amount: number) => {
    tossBridge.triggerHaptic('light');
    const current = Number(value.originalPrice) || 0;
    updateField('originalPrice', current + amount);
  };

  const setDiscountRate = (rate: number) => {
    tossBridge.triggerHaptic('light');
    updateField('discountRate', Math.min(100, Math.max(0, rate)));
  };

  const setCoupon = (amount: number) => {
    tossBridge.triggerHaptic('light');
    updateField('couponDiscount', amount);
  };

  const addCoupon = (amount: number) => {
    tossBridge.triggerHaptic('light');
    const current = Number(value.couponDiscount) || 0;
    updateField('couponDiscount', current + amount);
  };

  const setShipping = (amount: number) => {
    tossBridge.triggerHaptic('light');
    updateField('shippingFee', amount);
  };

  const setPoints = (amount: number) => {
    tossBridge.triggerHaptic('light');
    updateField('pointsUsed', amount);
  };

  // 전액 적립금 사용 시도 (정가에서 할인 및 쿠폰 적용 후 + 배송비)
  const handleFullPoints = () => {
    tossBridge.triggerHaptic('medium');
    const orig = Number(value.originalPrice) || 0;
    const rate = Number(value.discountRate) || 0;
    const discounted = Math.round(orig * (1 - rate / 100));
    const coupon = Number(value.couponDiscount) || 0;
    const prodAfterCoupon = Math.max(0, discounted - coupon);
    const shipping = Number(value.shippingFee) || 0;
    const maxPayable = prodAfterCoupon + shipping;
    updateField('pointsUsed', maxPayable);
  };

  const badgeStyles = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    purple: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-5 flex flex-col gap-5">
      {/* Card Header */}
      {title && (
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            {badge && (
              <span className={`px-2 py-0.5 rounded-md text-xs font-bold border ${badgeStyles[badgeColor]}`}>
                {badge}
              </span>
            )}
            <input
              type="text"
              value={value.name}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder="상품명 입력 (선택)"
              className="text-base font-bold text-slate-900 bg-transparent border-none focus:outline-hidden focus:ring-1 focus:ring-blue-500 rounded px-1.5 py-0.5 placeholder:text-slate-400"
            />
          </div>
          <button
            onClick={() => {
              tossBridge.triggerHaptic('light');
              onChange({
                name: value.name,
                originalPrice: 0,
                discountRate: 0,
                couponDiscount: 0,
                shippingFee: 0,
                pointsUsed: 0,
              });
            }}
            className="text-[11px] text-slate-400 hover:text-slate-700 font-medium"
          >
            초기화
          </button>
        </div>
      )}

      {/* 1. 상품 정가 입력 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Tag className="w-4 h-4 text-blue-600" />
            <span>1. 상품 정가</span>
          </label>
          <span className="text-xs text-slate-400 font-medium tabular-nums">
            {value.originalPrice > 0 ? formatKRW(value.originalPrice) : '금액을 입력해주세요'}
          </span>
        </div>

        {/* 정가 인풋 */}
        <div className="relative flex items-center">
          <input
            type="number"
            inputMode="numeric"
            min="0"
            step="100"
            placeholder="0"
            value={value.originalPrice === 0 ? '' : value.originalPrice}
            onChange={(e) => updateField('originalPrice', e.target.value === '' ? 0 : Number(e.target.value))}
            className="w-full h-14 pl-4 pr-12 text-2xl font-black tracking-tight text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 focus:outline-hidden transition-all tabular-nums"
          />
          <span className="absolute right-4 text-base font-bold text-slate-400 pointer-events-none">원</span>
        </div>

        {/* 퀵 추가 버튼 */}
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          <button
            type="button"
            onClick={() => addPrice(10000)}
            className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors active:scale-95"
          >
            +1만
          </button>
          <button
            type="button"
            onClick={() => addPrice(50000)}
            className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors active:scale-95"
          >
            +5만
          </button>
          <button
            type="button"
            onClick={() => addPrice(100000)}
            className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors active:scale-95"
          >
            +10만
          </button>
          {value.originalPrice > 0 && (
            <button
              type="button"
              onClick={() => updateField('originalPrice', 0)}
              className="px-2 py-1.5 text-xs text-rose-500 hover:bg-rose-50 rounded-lg transition-colors ml-auto font-medium"
            >
              지우기
            </button>
          )}
        </div>
      </div>

      {/* 2. 할인율 (%) */}
      <div className="space-y-2 pt-1 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Percent className="w-4 h-4 text-indigo-600" />
            <span>2. 할인율</span>
          </label>
          <div className="flex items-center gap-1">
            <input
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              placeholder="0"
              value={value.discountRate === 0 ? '' : value.discountRate}
              onChange={(e) => {
                const num = e.target.value === '' ? 0 : Number(e.target.value);
                setDiscountRate(num);
              }}
              className="w-16 h-8 text-right font-black text-blue-600 bg-blue-50/70 border border-blue-200 rounded-lg px-2 text-sm focus:outline-hidden focus:ring-1 focus:ring-blue-500 tabular-nums"
            />
            <span className="text-sm font-bold text-blue-600">%</span>
          </div>
        </div>

        {/* 슬라이더 */}
        <div className="px-1 py-1">
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={value.discountRate}
            onChange={(e) => setDiscountRate(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>

        {/* 대표 할인율 퀵 버튼 */}
        <div className="grid grid-cols-6 gap-1.5">
          {[10, 15, 20, 30, 50, 0].map((rate) => (
            <button
              key={rate}
              type="button"
              onClick={() => setDiscountRate(rate)}
              className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                value.discountRate === rate
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {rate === 0 ? '0%' : `${rate}%`}
            </button>
          ))}
        </div>
      </div>

      {/* 3. 쿠폰 할인금액 */}
      <div className="space-y-2 pt-1 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Ticket className="w-4 h-4 text-emerald-600" />
            <span>3. 쿠폰 할인</span>
          </label>
          <span className="text-xs text-slate-400 font-medium tabular-nums">
            {value.couponDiscount > 0 ? `-${formatKRW(value.couponDiscount)}` : '없음'}
          </span>
        </div>

        <div className="relative flex items-center">
          <input
            type="number"
            inputMode="numeric"
            min="0"
            step="500"
            placeholder="0"
            value={value.couponDiscount === 0 ? '' : value.couponDiscount}
            onChange={(e) => updateField('couponDiscount', e.target.value === '' ? 0 : Number(e.target.value))}
            className="w-full h-11 pl-4 pr-12 text-base font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-hidden transition-all tabular-nums"
          />
          <span className="absolute right-4 text-sm font-semibold text-slate-400 pointer-events-none">원</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {[1000, 3000, 5000, 10000].map((amt) => (
            <button
              key={amt}
              type="button"
              onClick={() => addCoupon(amt)}
              className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/60 transition-colors"
            >
              +{amt >= 10000 ? `${amt / 10000}만` : `${amt / 1000}천`}
            </button>
          ))}
          {value.couponDiscount > 0 && (
            <button
              type="button"
              onClick={() => updateField('couponDiscount', 0)}
              className="px-2 py-1.5 text-xs text-slate-400 hover:text-slate-700 ml-auto"
            >
              삭제
            </button>
          )}
        </div>
      </div>

      {/* 4. 배송비 입력 */}
      <div className="space-y-2 pt-1 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Truck className="w-4 h-4 text-amber-600" />
            <span>4. 배송비</span>
          </label>
          <span className="text-xs font-semibold text-slate-700">
            {value.shippingFee === 0 ? (
              <span className="text-emerald-600">무료배송 (0원)</span>
            ) : (
              `+${formatKRW(value.shippingFee)}`
            )}
          </span>
        </div>

        {/* 퀵 배송비 토글 버튼 */}
        <div className="grid grid-cols-4 gap-1.5">
          <button
            type="button"
            onClick={() => setShipping(0)}
            className={`py-2 rounded-xl text-xs font-bold transition-all ${
              value.shippingFee === 0
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            무료(0원)
          </button>
          <button
            type="button"
            onClick={() => setShipping(3000)}
            className={`py-2 rounded-xl text-xs font-bold transition-all ${
              value.shippingFee === 3000
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            3,000원
          </button>
          <button
            type="button"
            onClick={() => setShipping(2500)}
            className={`py-2 rounded-xl text-xs font-bold transition-all ${
              value.shippingFee === 2500
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            2,500원
          </button>
          <button
            type="button"
            onClick={() => setShipping(4000)}
            className={`py-2 rounded-xl text-xs font-bold transition-all ${
              value.shippingFee === 4000
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            4,000원
          </button>
        </div>

        {/* 직접 배송비 수동 인풋 (특수 도서산간 배송비 등) */}
        <div className="relative flex items-center pt-0.5">
          <input
            type="number"
            inputMode="numeric"
            min="0"
            step="500"
            placeholder="직접 입력 (예: 5,000원)"
            value={value.shippingFee === 0 ? '' : value.shippingFee}
            onChange={(e) => updateField('shippingFee', e.target.value === '' ? 0 : Number(e.target.value))}
            className="w-full h-9 pl-3 pr-10 text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-amber-500 tabular-nums"
          />
          <span className="absolute right-3 text-xs text-slate-400">원</span>
        </div>
      </div>

      {/* 5. 적립금 사용 */}
      <div className="space-y-2 pt-1 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Coins className="w-4 h-4 text-purple-600" />
            <span>5. 사용 적립금 / 포인트</span>
          </label>
          <span className="text-xs text-slate-400 font-medium tabular-nums">
            {value.pointsUsed > 0 ? `-${formatKRW(value.pointsUsed)}` : '미사용'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="number"
              inputMode="numeric"
              min="0"
              step="100"
              placeholder="0"
              value={value.pointsUsed === 0 ? '' : value.pointsUsed}
              onChange={(e) => updateField('pointsUsed', e.target.value === '' ? 0 : Number(e.target.value))}
              className="w-full h-11 pl-4 pr-10 text-base font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-hidden transition-all tabular-nums"
            />
            <span className="absolute right-3 text-sm font-semibold text-slate-400 pointer-events-none">P</span>
          </div>
          <button
            type="button"
            onClick={handleFullPoints}
            className="h-11 px-3.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold border border-purple-200 flex items-center gap-1 transition-colors shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>전액 사용</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {[1000, 3000, 5000].map((amt) => (
            <button
              key={amt}
              type="button"
              onClick={() => setPoints(amt)}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
            >
              {amt.toLocaleString('ko-KR')}P
            </button>
          ))}
          {value.pointsUsed > 0 && (
            <button
              type="button"
              onClick={() => updateField('pointsUsed', 0)}
              className="px-2 py-1 text-xs text-slate-400 hover:text-slate-700 ml-auto"
            >
              0P
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
