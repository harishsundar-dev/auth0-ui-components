import { renderHook } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { showToast } from '@/components/auth0/shared/toast';
import { useErrorHandler } from '@/hooks/shared/use-error-handler';
import * as useTranslatorModule from '@/hooks/shared/use-translator';
import { createMockI18nService } from '@/tests/utils/__mocks__/core/i18n-service.mocks';

const { mockIsNotifiableError, mockResolveErrorMessage, mockGetStatusCode, mockHasApiErrorBody } =
  vi.hoisted(() => ({
    mockIsNotifiableError: vi.fn(),
    mockResolveErrorMessage: vi.fn(),
    mockGetStatusCode: vi.fn(),
    mockHasApiErrorBody: vi.fn(),
  }));

vi.mock('@auth0/universal-components-core', () => ({
  isNotifiableError: mockIsNotifiableError,
  resolveErrorMessage: mockResolveErrorMessage,
  getStatusCode: mockGetStatusCode,
  hasApiErrorBody: mockHasApiErrorBody,
  ERROR_CODES: { INSUFFICIENT_SCOPE: 'A0E-403-0002' },
}));

vi.mock('@/components/auth0/shared/toast');

describe('useErrorHandler', () => {
  const mockT = createMockI18nService().translator('common');

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(useTranslatorModule, 'useTranslator').mockReturnValue({
      t: mockT,
      changeLanguage: vi.fn(),
      currentLanguage: 'en',
      fallbackLanguage: undefined,
    });
    mockResolveErrorMessage.mockReturnValue('resolved error message');
  });

  const renderUseErrorHandler = () => renderHook(() => useErrorHandler());

  describe('when error is not notifiable', () => {
    it('should return early without showing a toast', () => {
      mockIsNotifiableError.mockReturnValue(false);

      const { result } = renderUseErrorHandler();
      result.current(new Error('non-notifiable'));

      expect(showToast).not.toHaveBeenCalled();
    });
  });

  describe('when error is notifiable', () => {
    beforeEach(() => {
      mockIsNotifiableError.mockReturnValue(true);
    });

    it.each([
      [400, 'error.bad_request'],
      [401, 'error.missing_token'],
      [404, 'error.not_found'],
      [429, 'error.rate_limit'],
    ])('%i error should show %s toast', (status, expectedMessage) => {
      mockGetStatusCode.mockReturnValue(status);

      const { result } = renderUseErrorHandler();
      result.current(new Error('error'));

      expect(showToast).toHaveBeenCalledWith({
        type: 'error',
        message: expectedMessage,
      });
    });

    describe('403 error', () => {
      beforeEach(() => {
        mockGetStatusCode.mockReturnValue(403);
      });

      it('should show insufficient_scope toast when error body type includes INSUFFICIENT_SCOPE', () => {
        mockHasApiErrorBody.mockReturnValue(true);
        const error = { body: { type: 'A0E-403-0002' } };

        const { result } = renderUseErrorHandler();
        result.current(error);

        expect(showToast).toHaveBeenCalledWith({
          type: 'error',
          message: 'error.insufficient_scope',
        });
      });

      it('should show forbidden toast when error body type does not include INSUFFICIENT_SCOPE', () => {
        mockHasApiErrorBody.mockReturnValue(true);
        const error = { body: { type: 'some-other-code' } };

        const { result } = renderUseErrorHandler();
        result.current(error);

        expect(showToast).toHaveBeenCalledWith({
          type: 'error',
          message: 'error.forbidden',
        });
      });

      it('should show forbidden toast when error has no body', () => {
        mockHasApiErrorBody.mockReturnValue(false);

        const { result } = renderUseErrorHandler();
        result.current(new Error('forbidden'));

        expect(showToast).toHaveBeenCalledWith({
          type: 'error',
          message: 'error.forbidden',
        });
      });
    });

    describe('unknown / unmapped status code', () => {
      beforeEach(() => {
        mockGetStatusCode.mockReturnValue(500);
        mockResolveErrorMessage.mockReturnValue('resolved error');
      });

      it('should use resolveErrorMessage with provided fallbackMessage', () => {
        const error = new Error('server error');

        const { result } = renderUseErrorHandler();
        result.current(error, { fallbackMessage: 'custom fallback' });

        expect(mockResolveErrorMessage).toHaveBeenCalledWith(error, 'custom fallback');
        expect(showToast).toHaveBeenCalledWith({
          type: 'error',
          message: 'resolved error',
        });
      });

      it('should fall back to generic error message when no fallbackMessage is provided', () => {
        const error = new Error('server error');

        const { result } = renderUseErrorHandler();
        result.current(error);

        expect(mockResolveErrorMessage).toHaveBeenCalledWith(error, 'error.generic');
        expect(showToast).toHaveBeenCalledWith({
          type: 'error',
          message: 'resolved error',
        });
      });

      it('should fall back to generic error message when status is undefined', () => {
        mockGetStatusCode.mockReturnValue(undefined);
        const error = new Error('unknown error');

        const { result } = renderUseErrorHandler();
        result.current(error);

        expect(mockResolveErrorMessage).toHaveBeenCalledWith(error, 'error.generic');
      });
    });
  });
});
