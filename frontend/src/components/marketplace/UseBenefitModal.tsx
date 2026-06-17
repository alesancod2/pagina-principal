'use client';

import React, { useState } from 'react';
import { useUseBenefit } from '../../hooks/useBenefits';
import { Benefit } from '../../services/partners.service';

interface UseBenefitModalProps {
  benefit: Benefit;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (result: UseBenefitResult) => void;
}

interface UseBenefitResult {
  couponCode: string;
  couponExpiresAt: string;
  pointsEarned: number;
  discountApplied: number;
  discountType: string;
  benefitTitle: string;
  partnerName?: string;
}

type ModalStep = 'confirm' | 'loading' | 'success' | 'error';

export default function UseBenefitModal({
  benefit,
  isOpen,
  onClose,
  onSuccess,
}: UseBenefitModalProps) {
  const [step, setStep] = useState<ModalStep>('confirm');
  const [amount, setAmount] = useState<string>('');
  const [result, setResult] = useState<UseBenefitResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const useBenefitMutation = useUseBenefit();

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setStep('loading');
    setErrorMessage('');

    try {
      const payload = {
        benefitId: benefit.id,
        partnerId: benefit.partnerId,
        amount: amount ? parseFloat(amount) : undefined,
      };

      const response = await useBenefitMutation.mutateAsync({
        id: benefit.id,
        payload,
      });

      setResult(response as unknown as UseBenefitResult);
      setStep('success');
      onSuccess?.(response as unknown as UseBenefitResult);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Erro ao utilizar beneficio. Tente novamente.';
      setErrorMessage(message);
      setStep('error');
    }
  };

  const handleClose = () => {
    setStep('confirm');
    setAmount('');
    setResult(null);
    setErrorMessage('');
    onClose();
  };

  const getDiscountLabel = () => {
    switch (benefit.benefitType) {
      case 'discount_percent':
        return `${benefit.discountPercent}% de desconto`;
      case 'discount_fixed':
        return `R$ ${benefit.discountFixed?.toFixed(2)} de desconto`;
      case 'cashback':
        return `${benefit.cashbackPercent}% de cashback`;
      case 'points':
        return `${benefit.pointsGenerated} pontos`;
      case 'freebie':
        return 'Brinde gratis';
      default:
        return 'Beneficio';
    }
  };

  const getDaysLabel = () => {
    const daysMap: Record<string, string> = {
      '1': 'Seg',
      '2': 'Ter',
      '3': 'Qua',
      '4': 'Qui',
      '5': 'Sex',
      '6': 'Sab',
      '7': 'Dom',
    };
    const days = benefit.daysAvailable.split(',');
    if (days.length === 7) return 'Todos os dias';
    return days.map((d) => daysMap[d.trim()] || d).join(', ');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-bold text-gray-900">
            {step === 'success' ? 'Beneficio Utilizado!' : 'Utilizar Beneficio'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            &times;
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step: Confirm */}
          {step === 'confirm' && (
            <div className="space-y-4">
              {/* Benefit Info */}
              <div className="bg-blue-50 rounded-xl p-4">
                <h3 className="font-semibold text-blue-900 text-base">
                  {benefit.title}
                </h3>
                {benefit.description && (
                  <p className="text-sm text-blue-700 mt-1">{benefit.description}</p>
                )}
                <div className="mt-3 flex items-center gap-2">
                  <span className="inline-block bg-blue-600 text-white text-xs font-medium px-2.5 py-1 rounded-full">
                    {getDiscountLabel()}
                  </span>
                  {benefit.pointsGenerated > 0 && (
                    <span className="inline-block bg-green-600 text-white text-xs font-medium px-2.5 py-1 rounded-full">
                      +{benefit.pointsGenerated} pts
                    </span>
                  )}
                </div>
              </div>

              {/* Details */}
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Disponibilidade:</span>
                  <span className="font-medium text-gray-900">{getDaysLabel()}</span>
                </div>
                {benefit.maxUsesPerUser && (
                  <div className="flex justify-between">
                    <span>Limite por usuario:</span>
                    <span className="font-medium text-gray-900">
                      {benefit.maxUsesPerUser} usos
                    </span>
                  </div>
                )}
                {benefit.endDate && (
                  <div className="flex justify-between">
                    <span>Valido ate:</span>
                    <span className="font-medium text-gray-900">
                      {new Date(benefit.endDate).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                )}
              </div>

              {/* Amount input (optional) */}
              {['discount_percent', 'discount_fixed', 'cashback'].includes(
                benefit.benefitType,
              ) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valor da compra (opcional)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="R$ 0,00"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Informe o valor para calcular o desconto aplicado.
                  </p>
                </div>
              )}

              {/* Confirm Button */}
              <button
                onClick={handleConfirm}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors"
              >
                Confirmar Uso do Beneficio
              </button>

              <p className="text-xs text-center text-gray-500">
                Ao confirmar, um cupom sera gerado e os pontos serao creditados.
              </p>
            </div>
          )}

          {/* Step: Loading */}
          {step === 'loading' && (
            <div className="flex flex-col items-center py-8">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
              <p className="mt-4 text-gray-600">Processando seu beneficio...</p>
            </div>
          )}

          {/* Step: Success */}
          {step === 'success' && result && (
            <div className="space-y-4">
              {/* Success icon */}
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>

              <div className="text-center">
                <h3 className="text-lg font-bold text-gray-900">Parabens!</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Seu beneficio foi utilizado com sucesso.
                </p>
              </div>

              {/* Coupon Code */}
              <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-4 text-center">
                <p className="text-xs text-gray-500 uppercase tracking-wide">
                  Codigo do Cupom
                </p>
                <p className="text-2xl font-mono font-bold text-blue-600 mt-1">
                  {result.couponCode}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Valido ate:{' '}
                  {new Date(result.couponExpiresAt).toLocaleDateString('pt-BR')}
                </p>
              </div>

              {/* Result Details */}
              <div className="space-y-2 text-sm">
                {result.discountApplied > 0 && (
                  <div className="flex justify-between text-gray-700">
                    <span>Desconto aplicado:</span>
                    <span className="font-semibold text-green-600">
                      R$ {result.discountApplied.toFixed(2)}
                    </span>
                  </div>
                )}
                {result.pointsEarned > 0 && (
                  <div className="flex justify-between text-gray-700">
                    <span>Pontos ganhos:</span>
                    <span className="font-semibold text-green-600">
                      +{result.pointsEarned} pontos
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-gray-700">
                  <span>Tipo:</span>
                  <span className="font-medium">{result.discountType}</span>
                </div>
              </div>

              {/* Close */}
              <button
                onClick={handleClose}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 px-4 rounded-xl transition-colors"
              >
                Fechar
              </button>
            </div>
          )}

          {/* Step: Error */}
          {step === 'error' && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
              </div>

              <div className="text-center">
                <h3 className="text-lg font-bold text-gray-900">Erro</h3>
                <p className="text-sm text-red-600 mt-1">{errorMessage}</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('confirm')}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors"
                >
                  Tentar novamente
                </button>
                <button
                  onClick={handleClose}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 px-4 rounded-xl transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
