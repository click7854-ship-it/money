/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { X, QrCode, Smartphone, Copy, Check, ExternalLink, AlertCircle, Send, Bell } from 'lucide-react';
import { tossBridge } from '../platform/tossBridge';

interface MobileTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  sharedUrl: string;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const MobileTestModal: React.FC<MobileTestModalProps> = ({
  isOpen,
  onClose,
  sharedUrl,
  onShowToast,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (sharedUrl && isOpen) {
      QRCode.toDataURL(sharedUrl, {
        width: 240,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error('QR code generation error:', err));
    }
  }, [sharedUrl, isOpen]);

  if (!isOpen) return null;

  const handleCopyUrl = async () => {
    const success = await tossBridge.copyToClipboard(sharedUrl);
    if (success) {
      setCopied(true);
      onShowToast('모바일 접속 주소가 복사되었습니다!', 'success');
      setTimeout(() => setCopied(false), 2000);
    } else {
      onShowToast('복사에 실패했습니다.', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">내 휴대폰 / 토스에서 열어보기</h3>
              <p className="text-xs text-slate-500">QR 코드 스캔 및 모바일 링크 안내</p>
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

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5 text-sm text-slate-700">
          {/* 푸시 메시지 발송 관련 안내 배너 */}
          <div className="p-3.5 bg-blue-50/80 border border-blue-200/80 rounded-xl text-xs text-blue-900 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-blue-900">
              <Bell className="w-4 h-4 text-blue-600 shrink-0" />
              <span>토스 앱 푸시 알림 직접 발송이 불가능한 이유</span>
            </div>
            <p className="leading-relaxed text-blue-800">
              토스 앱의 공식 푸시 알림은 <strong>토스 파트너 개발자 센터</strong>에 승인된 기업 계정 및 사용자 기기 식별 토큰이 있어야만 전송할 수 있습니다. AI 개발 환경은 개인 휴대폰 번호나 토스 내부 푸시 발송망에 접근할 권한이 없으므로 직접 푸시를 전송해 드릴 수 없습니다.
            </p>
            <p className="leading-relaxed font-semibold text-blue-950">
              대신 아래의 <strong>QR 코드 스캔</strong> 또는 <strong>모바일 접속 주소</strong>를 통해 지금 즉시 내 스마트폰과 토스 인앱 브라우저에서 동일하게 테스트하실 수 있습니다!
            </p>
          </div>

          {/* QR Code Section */}
          <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
            <div className="text-xs font-bold text-slate-600 mb-2 flex items-center gap-1">
              <QrCode className="w-4 h-4 text-blue-600" />
              <span>휴대폰 기본 카메라 앱으로 비춰보세요</span>
            </div>

            {qrDataUrl ? (
              <div className="p-3 bg-white rounded-xl shadow-xs border border-slate-200">
                <img
                  src={qrDataUrl}
                  alt="모바일 접속 QR 코드"
                  className="w-48 h-48 block"
                />
              </div>
            ) : (
              <div className="w-48 h-48 bg-slate-200 rounded-xl animate-pulse flex items-center justify-center text-xs text-slate-400">
                QR 코드 생성 중...
              </div>
            )}

            <p className="text-[11px] text-slate-400 mt-2 text-center">
              아이폰 또는 갤럭시 기본 카메라로 QR 코드를 비추면 웹앱 링크가 즉시 열립니다.
            </p>
          </div>

          {/* URL 직접 복사 */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">모바일 테스트 링크</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={sharedUrl}
                className="flex-1 h-10 px-3 text-xs bg-slate-100 border border-slate-200 rounded-xl text-slate-600 font-mono focus:outline-hidden"
              />
              <button
                onClick={handleCopyUrl}
                className="h-10 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shrink-0 shadow-2xs"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? '복사됨!' : '주소 복사'}</span>
              </button>
            </div>
          </div>

          {/* 토스 앱(WebView)에서 여는 실전 팁 */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-2">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <span>💡 토스 앱 인앱 브라우저(WebView)로 여는 방법</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 pl-1 text-slate-700">
              <li>위 모바일 주소를 <strong>복사</strong>합니다.</li>
              <li>내 카카오톡 '나와의 채팅' 또는 문자메시지에 주소를 붙여넣어 전송합니다.</li>
              <li>링크를 터치하면 모바일 최적화 화면으로 즉시 실행됩니다.</li>
              <li>토스 앱 내 채팅이나 고객센터 링크 입력창에 주소를 전송하여 클릭하면 토스 인앱 브라우저(WebView) 환경 그대로 구동됩니다.</li>
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-white flex items-center justify-between gap-2">
          <a
            href={sharedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
          >
            <span>새 탭에서 모바일 화면 열기</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            onClick={onClose}
            className="py-2.5 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors"
          >
            확인 완료
          </button>
        </div>
      </div>
    </div>
  );
};
