/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface PriceInput {
  name: string;
  originalPrice: number;     // 상품 정가 (원)
  discountRate: number;      // 할인율 (0 ~ 100%)
  couponDiscount: number;    // 쿠폰 할인금액 (원)
  shippingFee: number;       // 배송비 (원)
  pointsUsed: number;        // 사용 적립금 (원)
}

export interface CalculationStep {
  stepNumber: number;
  title: string;
  expression: string;
  subtotal: number;
  diffText: string;
  type: 'base' | 'discount' | 'coupon' | 'shipping' | 'points' | 'final';
}

export interface CalculationResult {
  input: PriceInput;
  originalPrice: number;
  discountRate: number;
  discountAmount: number;         // 정가 × 할인율
  priceAfterDiscount: number;     // 정가 - 할인액
  couponDiscountApplied: number;  // 실제 적용된 쿠폰액 (상품가 초과 방지)
  productSubtotal: number;        // 할인 및 쿠폰 적용 후 상품 실구매가
  shippingFee: number;            // 배송비
  pointsUsedApplied: number;      // 실제 적용된 적립금 (잔여금액 초과 방지)
  finalPrice: number;             // 최종 결제금액 (>= 0원)
  totalSavings: number;           // 총 아낀 금액 (할인액 + 쿠폰 + 적립금)
  effectiveDiscountRate: number;  // 실질 체감 할인율 (%)
  warnings: string[];             // 초과 차감 보정 안내 등
  steps: CalculationStep[];       // 단계별 투명한 계산 영수증
}

export interface ComparisonResult {
  productA: CalculationResult;
  productB: CalculationResult;
  winner: 'A' | 'B' | 'TIE';
  priceDiff: number;              // 절댓값 차액
  cheaperProduct: 'A' | 'B' | null;
  summaryMessage: string;
  savingsDiff: number;            // 혜택 금액 차이
  higherDiscountProduct: 'A' | 'B' | 'TIE';
}

export interface TestResultItem {
  id: string;
  name: string;
  description: string;
  passed: boolean;
  expectedFinalPrice: number;
  actualFinalPrice: number;
  details: string;
}

export interface TestSuiteSummary {
  total: number;
  passed: number;
  failed: number;
  allPassed: boolean;
  results: TestResultItem[];
  executedAt: string;
}

export interface SavedCalculation {
  id: string;
  timestamp: number;
  mode: 'single' | 'compare';
  title: string;
  singleResult?: CalculationResult;
  compareResult?: ComparisonResult;
}
