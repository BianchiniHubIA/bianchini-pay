export interface InstallmentOption {
  installments: number;
  installment_amount_cents: number;
  total_amount_cents: number;
  installment_rate: number; // monthly rate applied (0 = sem juros)
}

/**
 * Calcula opções de parcelamento usando a fórmula Price (PMT).
 * - Até `freeInstallments` parcelas: sem juros (a equipe absorve).
 * - Acima disso: aplica `monthlyRatePct`% ao mês, repassando o juros ao cliente.
 */
export function computeInstallmentOptions(
  principalCents: number,
  maxInstallments: number,
  freeInstallments: number,
  monthlyRatePct: number
): InstallmentOption[] {
  if (maxInstallments < 1 || principalCents <= 0) return [];
  const free = Math.max(1, Math.min(freeInstallments, maxInstallments));
  const r = (monthlyRatePct || 0) / 100;
  const options: InstallmentOption[] = [];

  for (let n = 1; n <= maxInstallments; n++) {
    if (n <= free || r === 0) {
      const per = Math.round(principalCents / n);
      options.push({
        installments: n,
        installment_amount_cents: per,
        total_amount_cents: per * n,
        installment_rate: 0,
      });
    } else {
      // PMT = PV * r / (1 - (1+r)^-n)
      const pmt = (principalCents * r) / (1 - Math.pow(1 + r, -n));
      const per = Math.round(pmt);
      const total = per * n;
      options.push({
        installments: n,
        installment_amount_cents: per,
        total_amount_cents: total,
        installment_rate: monthlyRatePct,
      });
    }
  }
  return options;
}
