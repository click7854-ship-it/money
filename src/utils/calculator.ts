/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PriceInput, CalculationResult, ComparisonResult, CalculationStep } from '../types/calculator';

/**
 * 한국 원화(KRW) 세 자리 콤마 포맷터 (예: 50,000원)
 */
export function formatKRW(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '0원';
  }
  return `${Math.round(amount).toLocaleString('ko-KR')}원`;
}

/**
 * 만/억 단위 한글 보조 표기 (예: 154,000 -> 15만 4,000원)
 */
export function formatKoreanUnit(amount: number): string {
  const val = Math.round(amount);
  if (val <= 0) return '0원';
  if (val < 10000) return `${val.toLocaleString('ko-KR')}원`;
  
  const man = Math.floor(val / 10000);
  const remainder = val % 10000;
  
  if (remainder === 0) {
    return `${man}만원`;
  }
  return `${man}만 ${remainder.toLocaleString('ko-KR')}원`;
}

/**
 * 핵심 계산 엔진
 * 계산 규칙:
 * 1. 정가에 할인율을 먼저 적용: discountAmount = round(정가 × 할인율 / 100)
 * 2. 할인 후 가격: priceAfterDiscount = max(0, 정가 - discountAmount)
 * 3. 쿠폰 할인 차감: couponDiscountApplied = min(priceAfterDiscount, 쿠폰입력)
 * 4. 상품 실구매가: productSubtotal = priceAfterDiscount - couponDiscountApplied
 * 5. 배송비 추가: subtotalWithShipping = productSubtotal + 배송비
 * 6. 적립금 차감: pointsUsedApplied = min(subtotalWithShipping, 적립금입력)
 * 7. 최종 결제금액: finalPrice = max(0, subtotalWithShipping - pointsUsedApplied)
 */
export function calculatePrice(input: PriceInput): CalculationResult {
  const originalPrice = Math.max(0, Math.round(Number(input.originalPrice) || 0));
  const discountRate = Math.min(100, Math.max(0, Number(input.discountRate) || 0));
  const couponDiscountInput = Math.max(0, Math.round(Number(input.couponDiscount) || 0));
  const shippingFee = Math.max(0, Math.round(Number(input.shippingFee) || 0));
  const pointsUsedInput = Math.max(0, Math.round(Number(input.pointsUsed) || 0));

  const warnings: string[] = [];

  // Step 1: 정가에 할인율 먼저 적용
  const discountAmount = Math.round((originalPrice * discountRate) / 100);
  const priceAfterDiscount = Math.max(0, originalPrice - discountAmount);

  // Step 2: 할인 후 가격에서 쿠폰 할인금액 차감
  // (쿠폰이 할인 후 상품가를 초과하면 상품가까지만 차감되고 배송비에는 적용되지 않는 표준 쇼핑몰 원칙 안내)
  let couponDiscountApplied = couponDiscountInput;
  if (couponDiscountInput > priceAfterDiscount) {
    couponDiscountApplied = priceAfterDiscount;
    if (couponDiscountInput > 0 && priceAfterDiscount > 0) {
      warnings.push(`쿠폰 금액(${formatKRW(couponDiscountInput)})이 상품가(${formatKRW(priceAfterDiscount)})를 초과하여 상품가 한도만큼만 차감되었습니다.`);
    }
  }
  const productSubtotal = Math.max(0, priceAfterDiscount - couponDiscountApplied);

  // Step 3: 배송비 추가
  const subtotalWithShipping = productSubtotal + shippingFee;

  // Step 4: 적립금 차감 (배송비 포함 잔여 결제금액 초과 방지)
  let pointsUsedApplied = pointsUsedInput;
  if (pointsUsedInput > subtotalWithShipping) {
    pointsUsedApplied = subtotalWithShipping;
    if (pointsUsedInput > 0 && subtotalWithShipping > 0) {
      warnings.push(`적립금 사용액(${formatKRW(pointsUsedInput)})이 결제 필요 금액(${formatKRW(subtotalWithShipping)})보다 커서 ${formatKRW(subtotalWithShipping)}까지만 사용되었습니다.`);
    }
  }

  // Step 5: 최종 결제금액 산출 (0원 미만 방지)
  const finalPrice = Math.max(0, subtotalWithShipping - pointsUsedApplied);

  // 총 혜택/절약 금액 (정가 대비 혜택 = 정가 할인액 + 쿠폰 + 적립금)
  const totalSavings = discountAmount + couponDiscountApplied + pointsUsedApplied;
  
  // 실질 체감 할인율 (%)
  const effectiveDiscountRate = originalPrice > 0 
    ? Math.round(((originalPrice - (finalPrice - shippingFee)) / originalPrice) * 100)
    : 0;

  // 단계별 계산 내역 구성
  const steps: CalculationStep[] = [
    {
      stepNumber: 1,
      title: '상품 정가',
      expression: '시작 금액',
      subtotal: originalPrice,
      diffText: '',
      type: 'base',
    },
    {
      stepNumber: 2,
      title: `할인율 적용 (${discountRate}%)`,
      expression: `${formatKRW(originalPrice)} × ${discountRate}% = -${formatKRW(discountAmount)}`,
      subtotal: priceAfterDiscount,
      diffText: `-${formatKRW(discountAmount)}`,
      type: 'discount',
    },
    {
      stepNumber: 3,
      title: '쿠폰 할인 차감',
      expression: `${formatKRW(priceAfterDiscount)} - ${formatKRW(couponDiscountApplied)}`,
      subtotal: productSubtotal,
      diffText: couponDiscountApplied > 0 ? `-${formatKRW(couponDiscountApplied)}` : '0원',
      type: 'coupon',
    },
    {
      stepNumber: 4,
      title: '배송비 추가',
      expression: shippingFee === 0 ? '무료 배송' : `+ ${formatKRW(shippingFee)}`,
      subtotal: subtotalWithShipping,
      diffText: shippingFee > 0 ? `+${formatKRW(shippingFee)}` : '0원 (무료)',
      type: 'shipping',
    },
    {
      stepNumber: 5,
      title: '적립금 사용',
      expression: pointsUsedApplied > 0 ? `- ${formatKRW(pointsUsedApplied)}` : '미사용',
      subtotal: finalPrice,
      diffText: pointsUsedApplied > 0 ? `-${formatKRW(pointsUsedApplied)}` : '0원',
      type: 'points',
    },
    {
      stepNumber: 6,
      title: '최종 결제금액',
      expression: '실제 내 통장에서 결제되는 금액',
      subtotal: finalPrice,
      diffText: '',
      type: 'final',
    },
  ];

  return {
    input,
    originalPrice,
    discountRate,
    discountAmount,
    priceAfterDiscount,
    couponDiscountApplied,
    productSubtotal,
    shippingFee,
    pointsUsedApplied,
    finalPrice,
    totalSavings,
    effectiveDiscountRate: Math.max(0, effectiveDiscountRate),
    warnings,
    steps,
  };
}

/**
 * 상품 A와 상품 B 가격 비교 함수
 */
export function compareProducts(inputA: PriceInput, inputB: PriceInput): ComparisonResult {
  const resultA = calculatePrice(inputA);
  const resultB = calculatePrice(inputB);

  const priceDiff = Math.abs(resultA.finalPrice - resultB.finalPrice);
  const savingsDiff = Math.abs(resultA.totalSavings - resultB.totalSavings);

  let winner: 'A' | 'B' | 'TIE' = 'TIE';
  let cheaperProduct: 'A' | 'B' | null = null;
  let summaryMessage = '';

  if (resultA.finalPrice < resultB.finalPrice) {
    winner = 'A';
    cheaperProduct = 'A';
    summaryMessage = `상품 A가 상품 B보다 ${formatKRW(priceDiff)} 더 저렴해요!`;
  } else if (resultB.finalPrice < resultA.finalPrice) {
    winner = 'B';
    cheaperProduct = 'B';
    summaryMessage = `상품 B가 상품 A보다 ${formatKRW(priceDiff)} 더 저렴해요!`;
  } else {
    winner = 'TIE';
    cheaperProduct = null;
    summaryMessage = '상품 A와 B의 최종 결제금액이 동일해요!';
  }

  let higherDiscountProduct: 'A' | 'B' | 'TIE' = 'TIE';
  if (resultA.effectiveDiscountRate > resultB.effectiveDiscountRate) {
    higherDiscountProduct = 'A';
  } else if (resultB.effectiveDiscountRate > resultA.effectiveDiscountRate) {
    higherDiscountProduct = 'B';
  }

  return {
    productA: resultA,
    productB: resultB,
    winner,
    priceDiff,
    cheaperProduct,
    summaryMessage,
    savingsDiff,
    higherDiscountProduct,
  };
}

/**
 * 단일 상품 계산 결과 공유 텍스트 생성
 */
export function generateShareText(result: CalculationResult, productName = '상품'): string {
  const lines = [
    `🛒 [진짜 얼마?] ${productName} 실제 결제금액 계산 결과`,
    `──────────────────────`,
    `• 정가: ${formatKRW(result.originalPrice)}`,
    result.discountRate > 0 ? `• 할인율: ${result.discountRate}% (-${formatKRW(result.discountAmount)})` : null,
    result.couponDiscountApplied > 0 ? `• 쿠폰 할인: -${formatKRW(result.couponDiscountApplied)}` : null,
    `• 배송비: ${result.shippingFee === 0 ? '무료' : `+${formatKRW(result.shippingFee)}`}`,
    result.pointsUsedApplied > 0 ? `• 적립금 사용: -${formatKRW(result.pointsUsedApplied)}` : null,
    `──────────────────────`,
    `💳 최종 결제금액: ${formatKRW(result.finalPrice)}`,
    `🎉 총 절약 혜택: ${formatKRW(result.totalSavings)} (정가 대비 약 ${result.effectiveDiscountRate}% 절약)`,
    `──────────────────────`,
    `* 실제 쇼핑몰 정책에 따라 할인/쿠폰 적용 순서가 다를 수 있습니다.`,
    `계산기 바로가기: ${typeof window !== 'undefined' ? window.location.href : ''}`,
  ].filter(Boolean);

  return lines.join('\n');
}

/**
 * 상품 A vs B 비교 결과 공유 텍스트 생성
 */
export function generateComparisonShareText(comp: ComparisonResult): string {
  const winnerName = comp.winner === 'A' ? '상품 A' : comp.winner === 'B' ? '상품 B' : '둘 다 동일';
  const lines = [
    `⚖️ [진짜 얼마?] 상품 A vs 상품 B 가격 비교 결과`,
    `──────────────────────`,
    `🏆 더 저렴한 상품: ${winnerName}`,
    comp.priceDiff > 0 ? `💰 결제금액 차액: ${formatKRW(comp.priceDiff)} 절약 가능!` : '결제금액 동일',
    `──────────────────────`,
    `[상품 A]`,
    `• 정가: ${formatKRW(comp.productA.originalPrice)} | 할인율: ${comp.productA.discountRate}%`,
    `• 쿠폰: -${formatKRW(comp.productA.couponDiscountApplied)} | 배송비: ${comp.productA.shippingFee === 0 ? '무료' : `+${formatKRW(comp.productA.shippingFee)}`}`,
    `• 최종 결제금액: ${formatKRW(comp.productA.finalPrice)}`,
    ``,
    `[상품 B]`,
    `• 정가: ${formatKRW(comp.productB.originalPrice)} | 할인율: ${comp.productB.discountRate}%`,
    `• 쿠폰: -${formatKRW(comp.productB.couponDiscountApplied)} | 배송비: ${comp.productB.shippingFee === 0 ? '무료' : `+${formatKRW(comp.productB.shippingFee)}`}`,
    `• 최종 결제금액: ${formatKRW(comp.productB.finalPrice)}`,
    `──────────────────────`,
    `* 실제 쇼핑몰 정책에 따라 적용 방식이 다를 수 있습니다.`,
  ];

  return lines.join('\n');
}
