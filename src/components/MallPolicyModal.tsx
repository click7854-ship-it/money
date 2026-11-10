/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, HelpCircle, ShieldCheck, ArrowRight, Store, AlertTriangle } from 'lucide-react';

interface MallPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MallPolicyModal: React.FC<MallPolicyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">쇼핑몰별 계산 순서 안내</h3>
              <p className="text-xs text-slate-500">실제 결제 전 꼭 확인해보세요</p>
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

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-5 text-sm text-slate-700 leading-relaxed">
          {/* 표준 계산 규칙 */}
          <div className="p-4 bg-blue-50/70 border border-blue-100 rounded-xl space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-blue-900 text-sm">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>진짜 얼마?의 표준 계산 원칙</span>
            </div>
            <p className="text-xs text-blue-800">
              국내 주요 e-커머스 표준(전자상거래 결제 표준)을 따릅니다:
            </p>
            <div className="flex flex-col gap-1.5 pt-1 text-xs font-medium text-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[11px] font-bold shrink-0">1</span>
                <span><strong>정가에 할인율 먼저 적용</strong> (할인 후 상품가 계산)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[11px] font-bold shrink-0">2</span>
                <span><strong>쿠폰 할인 차감</strong> (할인된 가격에서 쿠폰액만큼 추가 차감)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[11px] font-bold shrink-0">3</span>
                <span><strong>배송비 합산</strong> (무료 또는 유료 배송비 추가)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[11px] font-bold shrink-0">4</span>
                <span><strong>보유 적립금/포인트 차감</strong> (최종 결제 필요액에서 차감)</span>
              </div>
            </div>
          </div>

          {/* 주요 쇼핑몰 차이점 */}
          <div>
            <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5">
              <Store className="w-4 h-4 text-slate-600" />
              <span>실제 쇼핑몰마다 다를 수 있는 부분</span>
            </h4>
            <div className="space-y-2.5 text-xs text-slate-600">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <strong className="text-slate-800 block mb-1">1. 쿠폰 중복 적용 및 순서</strong>
                상품 쿠폰과 장바구니 쿠폰이 분리되어 있거나, 정가가 아닌 할인 후 가격을 기준으로 % 쿠폰이 적용되는 경우가 있습니다.
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <strong className="text-slate-800 block mb-1">2. 적립금의 배송비 결제 가능 여부</strong>
                네이버페이나 쿠팡 등은 배송비까지 포인트로 결제할 수 있지만, 일부 자체 쇼핑몰은 상품 순수 가격에만 적립금 사용을 제한하기도 합니다.
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <strong className="text-slate-800 block mb-1">3. 최소 결제금액 제한</strong>
                일부 카드사 및 간편결제 시스템은 적립금 사용 후 100원 또는 1,000원 이상의 최소 실결제금액을 요구할 수 있습니다.
              </div>
            </div>
          </div>

          {/* 유의사항 */}
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              본 계산기는 구매 전 정확한 실구매가를 빠르게 비교·예측할 수 있도록 돕는 도구입니다. 최종 결제 단계에서 쇼핑몰 주문서의 청구 금액을 다시 한번 확인해 주세요.
            </span>
          </div>
        </div>

        {/* Footer Button */}
        <div className="p-4 border-t border-slate-100 bg-white">
          <button
            onClick={onClose}
            className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors shadow-sm"
          >
            확인했어요
          </button>
        </div>
      </div>
    </div>
  );
};
