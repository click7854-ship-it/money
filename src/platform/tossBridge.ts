/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * 앱인토스 (App-in-Toss) WebView 환경 대비 브릿지 추상화 레이어
 * 
 * [개발 원칙 안내]
 * 1. 앱인토스 전용 SDK는 임의로 가상 구현하지 않고, 표준 브라우저 API를 기반으로 안전하게 동작합니다.
 * 2. 향후 토스 공식 최신 가이드 및 SDK(@toss/tds 또는 @toss/app-bridge 등) 배포 시
 *    본 파일의 어댑터 함수 내부만 1:1 교체하면 전체 비즈니스 로직 수정 없이 즉시 연동됩니다.
 */

export interface ShareOptions {
  title: string;
  text: string;
  url?: string;
}

export type HapticType = 'light' | 'medium' | 'success' | 'warning';

class TossPlatformBridge {
  /**
   * 토스 인앱 브라우저 / WebView 환경 감지
   */
  public isTossApp(): boolean {
    if (typeof window === 'undefined') return false;
    const ua = window.navigator.userAgent.toLowerCase();
    return ua.includes('toss') || ua.includes('tossapp');
  }

  /**
   * 햅틱/진동 피드백
   * - 브라우저 환경: navigator.vibrate() 활용
   * - 향후 토스 SDK: Toss.haptic() 또는 Native Interface 연동 위치
   */
  public triggerHaptic(type: HapticType = 'light'): void {
    if (typeof window === 'undefined') return;

    try {
      if ('vibrate' in navigator) {
        switch (type) {
          case 'light':
            navigator.vibrate(12);
            break;
          case 'medium':
            navigator.vibrate(24);
            break;
          case 'success':
            navigator.vibrate([15, 40, 20]);
            break;
          case 'warning':
            navigator.vibrate([30, 60, 30]);
            break;
        }
      }
    } catch {
      // 햅틱 미지원 환경 무시
    }
  }

  /**
   * 클립보드 복사
   * - 브라우저 환경: navigator.clipboard.writeText + fallback
   * - 향후 토스 SDK: Toss.copyToClipboard() 연동 위치
   */
  public async copyToClipboard(text: string): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    this.triggerHaptic('light');

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch {
      // fallback to document.execCommand
    }

    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textArea);
      return success;
    } catch {
      return false;
    }
  }

  /**
   * 네이티브 공유하기
   * - 브라우저 환경: Web Share API 우선 지원, 미지원 시 클립보드 복사로 fallback
   * - 향후 토스 SDK: Toss.share() 또는 카카오톡 공유 브릿지 연동 위치
   */
  public async share(options: ShareOptions): Promise<'shared' | 'copied' | 'failed'> {
    this.triggerHaptic('medium');

    const shareData = {
      title: options.title,
      text: options.text,
      url: options.url || (typeof window !== 'undefined' ? window.location.href : undefined),
    };

    // 1. Web Share API 시도
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share(shareData);
        return 'shared';
      } catch (err: unknown) {
        // 사용자가 취소한 경우 (AbortError) 무시
        if (err instanceof Error && err.name === 'AbortError') {
          return 'failed';
        }
      }
    }

    // 2. Web Share 미지원 시 클립보드 복사로 부드럽게 Fallback
    const copyContent = `${options.title}\n\n${options.text}${options.url ? `\n${options.url}` : ''}`;
    const copySuccess = await this.copyToClipboard(copyContent);
    return copySuccess ? 'copied' : 'failed';
  }

  /**
   * 상단 상태바 및 safe-area 높이 확인 헬퍼
   */
  public getSafeAreaInsets() {
    return {
      top: 'env(safe-area-inset-top, 0px)',
      bottom: 'env(safe-area-inset-bottom, 0px)',
    };
  }
}

export const tossBridge = new TossPlatformBridge();
