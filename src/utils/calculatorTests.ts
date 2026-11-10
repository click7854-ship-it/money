/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { calculatePrice, compareProducts, formatKRW } from './calculator';
import { TestResultItem, TestSuiteSummary } from '../types/calculator';

/**
 * 주요 계산 규칙 및 비즈니스 로직에 대한 내장 자동 테스트 슈트
 * 누구나(초보자, 운영자) 원클릭으로 계산식 정확성을 실시간 검증할 수 있습니다.
 */
export function runAllTests(): TestSuiteSummary {
  const results: TestResultItem[] = [];

  // Test 1: 기본 정가 및 할인율 계산
  {
    const input = {
      name: '테스트1',
      originalPrice: 50000,
      discountRate: 20,
      couponDiscount: 0,
      shippingFee: 0,
      pointsUsed: 0,
    };
    const res = calculatePrice(input);
    const expected = 40000;
    const passed = res.finalPrice === expected && res.discountAmount === 10000;
    results.push({
      id: 'test-1',
      name: '정가 및 기본 할인율(20%) 계산',
      description: '정가 50,000원에 20% 할인 적용 시 40,000원 산출 확인',
      passed,
      expectedFinalPrice: expected,
      actualFinalPrice: res.finalPrice,
      details: `정가 50,000원 - 할인 10,000원 = ${formatKRW(res.finalPrice)} (기대값: ${formatKRW(expected)})`,
    });
  }

  // Test 2: 할인 후 쿠폰 금액 차감
  {
    const input = {
      name: '테스트2',
      originalPrice: 50000,
      discountRate: 20,
      couponDiscount: 5000,
      shippingFee: 0,
      pointsUsed: 0,
    };
    const res = calculatePrice(input);
    const expected = 35000;
    const passed = res.finalPrice === expected;
    results.push({
      id: 'test-2',
      name: '할인 후 가격에서 쿠폰 차감',
      description: '할인 후 40,000원에서 5,000원 쿠폰 차감 시 35,000원 산출 확인',
      passed,
      expectedFinalPrice: expected,
      actualFinalPrice: res.finalPrice,
      details: `40,000원 - 쿠폰 5,000원 = ${formatKRW(res.finalPrice)} (기대값: ${formatKRW(expected)})`,
    });
  }

  // Test 3: 배송비 추가
  {
    const input = {
      name: '테스트3',
      originalPrice: 50000,
      discountRate: 20,
      couponDiscount: 5000,
      shippingFee: 3000,
      pointsUsed: 0,
    };
    const res = calculatePrice(input);
    const expected = 38000;
    const passed = res.finalPrice === expected;
    results.push({
      id: 'test-3',
      name: '배송비(3,000원) 가산 계산',
      description: '상품 실구매가 35,000원에 배송비 3,000원 가산 시 38,000원 산출 확인',
      passed,
      expectedFinalPrice: expected,
      actualFinalPrice: res.finalPrice,
      details: `35,000원 + 배송비 3,000원 = ${formatKRW(res.finalPrice)} (기대값: ${formatKRW(expected)})`,
    });
  }

  // Test 4: 적립금 차감 및 종합 계산
  {
    const input = {
      name: '테스트4',
      originalPrice: 50000,
      discountRate: 20,
      couponDiscount: 5000,
      shippingFee: 3000,
      pointsUsed: 2000,
    };
    const res = calculatePrice(input);
    const expected = 36000;
    const passed = res.finalPrice === expected && res.totalSavings === 17000;
    results.push({
      id: 'test-4',
      name: '적립금(2,000원) 차감 및 최종 결제금액',
      description: '38,000원에서 적립금 2,000원 사용 시 최종 36,000원 및 총혜택 17,000원',
      passed,
      expectedFinalPrice: expected,
      actualFinalPrice: res.finalPrice,
      details: `38,000원 - 적립금 2,000원 = ${formatKRW(res.finalPrice)} (총 절약: ${formatKRW(res.totalSavings)})`,
    });
  }

  // Test 5: 0원 미만 방지 (쿠폰 초과 시 상품가 한도까지만 차감)
  {
    const input = {
      name: '테스트5',
      originalPrice: 10000,
      discountRate: 50, // 할인 후 5,000원
      couponDiscount: 20000, // 2만원 쿠폰 (상품가 초과)
      shippingFee: 0,
      pointsUsed: 0,
    };
    const res = calculatePrice(input);
    const expected = 0;
    const passed = res.finalPrice === 0 && res.couponDiscountApplied === 5000;
    results.push({
      id: 'test-5',
      name: '0원 미만 방지 및 쿠폰 한도 보정',
      description: '할인 후 5,000원에 20,000원 쿠폰 입력 시 0원 미만이 되지 않고 0원으로 클램프',
      passed,
      expectedFinalPrice: expected,
      actualFinalPrice: res.finalPrice,
      details: `실제 적용 쿠폰 ${formatKRW(res.couponDiscountApplied)}, 최종 결제금액: ${formatKRW(res.finalPrice)}`,
    });
  }

  // Test 6: 적립금 초과 입력 시 결제금액 0원 보호
  {
    const input = {
      name: '테스트6',
      originalPrice: 20000,
      discountRate: 0,
      couponDiscount: 0,
      shippingFee: 3000, // 합계 23,000원
      pointsUsed: 50000, // 적립금 50,000원 입력
    };
    const res = calculatePrice(input);
    const expected = 0;
    const passed = res.finalPrice === 0 && res.pointsUsedApplied === 23000;
    results.push({
      id: 'test-6',
      name: '적립금 초과 사용 시 잔여 결제액 0원 처리',
      description: '필요금액 23,000원에 적립금 50,000원 사용 시 잔여금액까지만 차감되어 0원 결제',
      passed,
      expectedFinalPrice: expected,
      actualFinalPrice: res.finalPrice,
      details: `실제 사용 적립금: ${formatKRW(res.pointsUsedApplied)}, 최종 결제금액: ${formatKRW(res.finalPrice)}`,
    });
  }

  // Test 7: 100% 전액 할인 시 배송비만 결제
  {
    const input = {
      name: '테스트7',
      originalPrice: 30000,
      discountRate: 100, // 상품 0원
      couponDiscount: 0,
      shippingFee: 3000,
      pointsUsed: 0,
    };
    const res = calculatePrice(input);
    const expected = 3000;
    const passed = res.finalPrice === expected && res.productSubtotal === 0;
    results.push({
      id: 'test-7',
      name: '100% 전액 할인 시 배송비 결제 검증',
      description: '정가 30,000원 100% 할인 후 배송비 3,000원 부과 시 최종 결제금액 3,000원',
      passed,
      expectedFinalPrice: expected,
      actualFinalPrice: res.finalPrice,
      details: `상품가 0원 + 배송비 3,000원 = ${formatKRW(res.finalPrice)}`,
    });
  }

  // Test 8: 정가 0원 입력 시 안전한 기본값 처리
  {
    const input = {
      name: '테스트8',
      originalPrice: 0,
      discountRate: 20,
      couponDiscount: 1000,
      shippingFee: 3000,
      pointsUsed: 0,
    };
    const res = calculatePrice(input);
    const expected = 3000;
    const passed = res.finalPrice === expected && res.effectiveDiscountRate === 0;
    results.push({
      id: 'test-8',
      name: '정가 0원 입력 시 예외 방지',
      description: '정가가 0원일 때 NaN이나 음수 오류 없이 배송비만 정확히 계산',
      passed,
      expectedFinalPrice: expected,
      actualFinalPrice: res.finalPrice,
      details: `최종 결제금액: ${formatKRW(res.finalPrice)}, 체감 할인율: ${res.effectiveDiscountRate}%`,
    });
  }

  // Test 9: 상품 A vs 상품 B 비교 (상품 A가 더 저렴)
  {
    const prodA = {
      name: '상품 A',
      originalPrice: 45000,
      discountRate: 20, // 36,000원
      couponDiscount: 3000, // 33,000원
      shippingFee: 3000, // 36,000원
      pointsUsed: 0,
    };
    const prodB = {
      name: '상품 B',
      originalPrice: 50000,
      discountRate: 10, // 45,000원
      couponDiscount: 5000, // 40,000원
      shippingFee: 0, // 40,000원
      pointsUsed: 0,
    };
    const comp = compareProducts(prodA, prodB);
    const passed = comp.winner === 'A' && comp.priceDiff === 4000;
    results.push({
      id: 'test-9',
      name: 'A vs B 가격 비교 (A가 4,000원 저렴)',
      description: '상품 A 최종 36,000원 vs 상품 B 최종 40,000원 -> 상품 A 승리 및 차액 4,000원 검증',
      passed,
      expectedFinalPrice: 36000,
      actualFinalPrice: comp.productA.finalPrice,
      details: `승자: ${comp.winner}, 차액: ${formatKRW(comp.priceDiff)}`,
    });
  }

  // Test 10: 배송비로 인한 가격 역전 비교 검증
  {
    const prodA = {
      name: '상품 A',
      originalPrice: 28000,
      discountRate: 0,
      couponDiscount: 0,
      shippingFee: 3000, // 최종 31,000원
      pointsUsed: 0,
    };
    const prodB = {
      name: '상품 B',
      originalPrice: 30000, // 정가는 더 비쌈
      discountRate: 0,
      couponDiscount: 0,
      shippingFee: 0, // 무료배송 -> 최종 30,000원
      pointsUsed: 0,
    };
    const comp = compareProducts(prodA, prodB);
    const passed = comp.winner === 'B' && comp.priceDiff === 1000;
    results.push({
      id: 'test-10',
      name: '배송비로 인한 정가 역전 비교 검증',
      description: '정가가 더 비싸도 무료배송으로 인해 상품 B가 1,000원 더 저렴한 상황 감지',
      passed,
      expectedFinalPrice: 30000,
      actualFinalPrice: comp.productB.finalPrice,
      details: `A: 31,000원 vs B: 30,000원 -> 승자: ${comp.winner}, 차액: ${formatKRW(comp.priceDiff)}`,
    });
  }

  // Test 11: 동점(TIE) 케이스 검증
  {
    const prodA = {
      name: '상품 A',
      originalPrice: 20000,
      discountRate: 10,
      couponDiscount: 0,
      shippingFee: 3000,
      pointsUsed: 0,
    };
    const prodB = {
      name: '상품 B',
      originalPrice: 21000,
      discountRate: 0,
      couponDiscount: 0,
      shippingFee: 0,
      pointsUsed: 0,
    };
    const comp = compareProducts(prodA, prodB);
    const passed = comp.winner === 'TIE' && comp.priceDiff === 0;
    results.push({
      id: 'test-11',
      name: 'A vs B 동점(TIE) 처리 검증',
      description: '두 상품의 최종 결제금액이 동일(21,000원)할 때 TIE 결과 반환',
      passed,
      expectedFinalPrice: 21000,
      actualFinalPrice: comp.productA.finalPrice,
      details: `A: ${formatKRW(comp.productA.finalPrice)}, B: ${formatKRW(comp.productB.finalPrice)} -> 승자: ${comp.winner}`,
    });
  }

  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = results.length - passedCount;

  return {
    total: results.length,
    passed: passedCount,
    failed: failedCount,
    allPassed: failedCount === 0,
    results,
    executedAt: new Date().toLocaleTimeString('ko-KR'),
  };
}
