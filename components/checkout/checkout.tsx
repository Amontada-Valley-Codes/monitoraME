'use client';

import { useState } from 'react';
import { CheckoutConfirmation } from './checkout-confirmation';
import { CheckoutSteps } from './checkout-steps';
import { CheckoutSummary } from './checkout-summary';
import { PaymentStep, type CardDetails, type PaymentMethod } from './payment-step';
import { PlanReview } from './plan-review';
import type { CheckoutPlan } from './plans';

export function Checkout({ plan, onExit, onAccessPlatform }: { plan: CheckoutPlan; onExit: () => void; onAccessPlatform: () => void }) {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [cardDetails, setCardDetails] = useState<CardDetails>({ number: '', name: '', expiry: '', cvv: '' });

  const changeStep = (step: 1 | 2 | 3) => {
    setCurrentStep(step);
    document.getElementById('main-content')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section className="mx-auto w-full max-w-7xl py-1">
      <CheckoutSteps currentStep={currentStep} />
      <div key={currentStep} className="mt-10 animate-in fade-in slide-in-from-right-2 duration-300">
        {currentStep === 3 ? (
          <CheckoutConfirmation plan={plan} method={paymentMethod} onAccessPlatform={onAccessPlatform} />
        ) : (
          <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(18rem,1fr)]">
            {currentStep === 1 ? <PlanReview plan={plan} onBack={onExit} onContinue={() => changeStep(2)} /> : (
              <PaymentStep plan={plan} method={paymentMethod} onMethodChange={setPaymentMethod} cardDetails={cardDetails} onCardDetailsChange={setCardDetails} onBack={() => changeStep(1)} onContinue={() => changeStep(3)} />
            )}
            <CheckoutSummary plan={plan} />
          </div>
        )}
      </div>
    </section>
  );
}
