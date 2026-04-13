import { useParams } from "react-router-dom";
import { useCheckoutPageBySlug } from "@/hooks/useCheckoutPages";
import { CheckoutPreview } from "@/components/checkout/CheckoutPreview";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Loader2, CheckCircle2, Copy, QrCode } from "lucide-react";
import { useEffect, useCallback, useState, useRef } from "react";
import { useTrackEvent } from "@/hooks/useTrackEvent";
import type { LeadFormData } from "@/components/checkout/LeadCaptureForm";
import { toast } from "sonner";

declare global {
  interface Window {
    MercadoPago: any;
  }
}

interface PaymentResult {
  id: string;
  status: string;
  qr_code?: string;
  qr_code_base64?: string;
  ticket_url?: string;
  barcode?: string;
  boleto_url?: string;
}

export default function PublicCheckout() {
  const { slug } = useParams<{ slug: string }>();
  const { data: page, isLoading, error } = useCheckoutPageBySlug(slug ?? null);
  const { track } = useTrackEvent(page?.id);
  const [processing, setProcessing] = useState(false);
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount_percent: number } | null>(null);
  const mpInstanceRef = useRef<any>(null);

  const { data: offer } = useQuery({
    queryKey: ["public-offer", page?.offer_id],
    queryFn: async () => {
      if (!page?.offer_id) return null;
      const { data } = await supabase
        .from("offers")
        .select("name, price_cents, billing_type, billing_interval, product_id")
        .eq("id", page.offer_id)
        .single();
      return data;
    },
    enabled: !!page?.offer_id,
  });

  // Fetch MP public key from payment_gateways
  const { data: mpPublicKey } = useQuery({
    queryKey: ["mp-public-key", page?.organization_id],
    queryFn: async () => {
      if (!page?.organization_id) return null;
      const { data } = await supabase
        .from("payment_gateways")
        .select("credentials")
        .eq("organization_id", page.organization_id)
        .eq("provider", "mercado_pago")
        .eq("is_active", true)
        .limit(1)
        .single();
      if (!data) return null;
      return (data.credentials as Record<string, string>)?.public_key || null;
    },
    enabled: !!page?.organization_id,
  });

  // Load MP SDK
  useEffect(() => {
    if (!mpPublicKey) return;
    if (document.getElementById("mp-sdk-script")) {
      // SDK already loaded
      if (window.MercadoPago && !mpInstanceRef.current) {
        mpInstanceRef.current = new window.MercadoPago(mpPublicKey);
      }
      return;
    }
    const script = document.createElement("script");
    script.id = "mp-sdk-script";
    script.src = "https://sdk.mercadopago.com/js/v2";
    script.onload = () => {
      mpInstanceRef.current = new window.MercadoPago(mpPublicKey);
    };
    document.head.appendChild(script);
  }, [mpPublicKey]);

  // Inject tracking scripts
  useEffect(() => {
    if (!page) return;
    const scripts: HTMLElement[] = [];

    if (page.fb_pixel_id) {
      const s = document.createElement("script");
      s.innerHTML = `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${page.fb_pixel_id}');fbq('track','PageView');`;
      document.head.appendChild(s);
      scripts.push(s);
    }

    if (page.ga_tracking_id) {
      const s1 = document.createElement("script");
      s1.src = `https://www.googletagmanager.com/gtag/js?id=${page.ga_tracking_id}`;
      s1.async = true;
      document.head.appendChild(s1);
      scripts.push(s1);
      const s2 = document.createElement("script");
      s2.innerHTML = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${page.ga_tracking_id}');`;
      document.head.appendChild(s2);
      scripts.push(s2);
    }

    if (page.gtm_id) {
      const s = document.createElement("script");
      s.innerHTML = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${page.gtm_id}');`;
      document.head.appendChild(s);
      scripts.push(s);
    }

    if (page.custom_scripts) {
      const div = document.createElement("div");
      div.innerHTML = page.custom_scripts;
      Array.from(div.children).forEach((el) => {
        document.head.appendChild(el);
        scripts.push(el as HTMLElement);
      });
    }

    return () => { scripts.forEach((s) => s.remove()); };
  }, [page]);

  const handleCouponValidate = useCallback(async (code: string): Promise<{ valid: boolean; discount_percent: number } | null> => {
    if (!page || !offer) return null;

    const { data: coupons } = await supabase
      .from("coupons")
      .select("id, code, discount_percent, product_id")
      .eq("code", code)
      .eq("is_active", true);

    if (!coupons?.length) return { valid: false, discount_percent: 0 };

    const coupon = coupons.find(
      (c) => !c.product_id || c.product_id === offer.product_id
    );

    if (!coupon) return { valid: false, discount_percent: 0 };

    setAppliedCoupon({ code: coupon.code, discount_percent: Number(coupon.discount_percent) });
    return { valid: true, discount_percent: Number(coupon.discount_percent) };
  }, [page, offer]);

  const tokenizeCard = async (data: LeadFormData): Promise<string> => {
    const mp = mpInstanceRef.current;
    if (!mp) throw new Error("SDK do Mercado Pago não carregado");

    const cardNumber = (data.cardNumber || "").replace(/\D/g, "");
    const expiry = (data.cardExpiry || "").replace(/\D/g, "");
    const expirationMonth = parseInt(expiry.slice(0, 2), 10);
    const expirationYear = parseInt("20" + expiry.slice(2, 4), 10);
    const securityCode = (data.cardCvc || "").trim();
    const cardholderName = (data.cardHolder || data.name).trim();
    const docNumber = (data.document || "").replace(/\D/g, "");

    const cardTokenResponse = await mp.createCardToken({
      cardNumber,
      cardholderName,
      cardExpirationMonth: String(expirationMonth).padStart(2, "0"),
      cardExpirationYear: String(expirationYear),
      securityCode,
      identificationType: "CPF",
      identificationNumber: docNumber,
    });

    if (!cardTokenResponse?.id) {
      throw new Error("Não foi possível tokenizar o cartão. Verifique os dados.");
    }

    return cardTokenResponse.id;
  };

  const handleLeadSubmit = useCallback(async (data: LeadFormData) => {
    if (!page || !offer) return;

    const params = new URLSearchParams(window.location.search);

    const discountCents = appliedCoupon
      ? Math.round((offer.price_cents ?? 0) * appliedCoupon.discount_percent / 100)
      : 0;
    const finalPriceCents = (offer.price_cents ?? 0) - discountCents;

    // 1. Save lead
    await supabase.from("leads").insert({
      organization_id: page.organization_id,
      checkout_page_id: page.id,
      offer_id: page.offer_id,
      product_id: offer?.product_id ?? null,
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      whatsapp: data.whatsapp.trim(),
      document: data.document.trim(),
      payment_method: data.paymentMethod,
      status: "lead",
      utm_source: params.get("utm_source"),
      utm_medium: params.get("utm_medium"),
      utm_campaign: params.get("utm_campaign"),
      referrer: document.referrer || null,
      ip_address: null,
      user_agent: navigator.userAgent,
      metadata: appliedCoupon ? { coupon_code: appliedCoupon.code, coupon_discount: appliedCoupon.discount_percent } : null,
    });

    track("lead_captured");

    // 2. Process payment
    setProcessing(true);
    try {
      // Tokenize card if credit_card
      let cardToken: string | undefined;
      if (data.paymentMethod === "credit_card") {
        try {
          cardToken = await tokenizeCard(data);
        } catch (tokenError: any) {
          toast.error(tokenError.message || "Erro ao processar dados do cartão");
          setProcessing(false);
          return;
        }
      }

      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/process-payment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({
            offer_id: page.offer_id,
            checkout_page_id: page.id,
            payment_method: data.paymentMethod,
            amount_cents: finalPriceCents,
            coupon_code: appliedCoupon?.code ?? null,
            card_token: cardToken,
            installments: 1,
            customer: {
              name: data.name.trim(),
              email: data.email.trim().toLowerCase(),
              document: data.document.trim(),
              whatsapp: data.whatsapp.trim(),
            },
          }),
        }
      );

      if (response.ok) {
        const result = await response.json();
        track("payment_initiated");
        setPaymentResult(result.payment);

        if (result.payment.status === "approved") {
          const isSubscription = result.type === "subscription";
          toast.success(isSubscription ? "Assinatura ativada! 🎉" : "Pagamento aprovado! 🎉");
          track("payment_approved");
        } else if (result.payment.qr_code || result.payment.barcode) {
          toast.success("Pagamento criado! Siga as instruções.");
        } else {
          toast.success("Pagamento em processamento...");
        }
      } else {
        const errorData = await response.json().catch(() => null);
        const errorMsg = errorData?.error || "Erro ao processar pagamento";
        toast.error(errorMsg);
      }
    } catch (err: any) {
      console.error("Payment error:", err);
      toast.error("Erro de conexão. Tente novamente.");
    } finally {
      setProcessing(false);
    }
  }, [page, offer, track, appliedCoupon]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#1a1a1a" }}>
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: "#e9bf1e" }} />
      </div>
    );
  }

  if (!page || error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ backgroundColor: "#1a1a1a", color: "#ededed" }}>
        <h1 className="text-2xl font-bold mb-2">Página não encontrada</h1>
        <p style={{ color: "rgba(237,237,237,0.5)" }}>Este checkout não existe ou não está publicado.</p>
      </div>
    );
  }

  if (paymentResult) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: "#1a1a1a" }}>
        <div className="max-w-md w-full space-y-6 text-center">
          {paymentResult.status === "approved" ? (
            <>
              <CheckCircle2 className="h-16 w-16 mx-auto" style={{ color: "#22c55e" }} />
              <h1 className="text-2xl font-bold" style={{ color: "#ededed" }}>Pagamento Aprovado!</h1>
              <p style={{ color: "rgba(237,237,237,0.6)" }}>Seu pagamento foi processado com sucesso.</p>
            </>
          ) : paymentResult.qr_code ? (
            <>
              <QrCode className="h-12 w-12 mx-auto" style={{ color: "#3b82f6" }} />
              <h1 className="text-2xl font-bold" style={{ color: "#ededed" }}>Pague com Pix</h1>
              <p className="text-sm" style={{ color: "rgba(237,237,237,0.6)" }}>
                Escaneie o QR code ou copie o código abaixo
              </p>
              {paymentResult.qr_code_base64 && (
                <img
                  src={`data:image/png;base64,${paymentResult.qr_code_base64}`}
                  alt="QR Code Pix"
                  className="mx-auto w-48 h-48 rounded-xl"
                />
              )}
              <div className="rounded-lg p-3" style={{ backgroundColor: "rgba(237,237,237,0.05)", border: "1px solid rgba(237,237,237,0.1)" }}>
                <p className="text-xs mb-2" style={{ color: "rgba(237,237,237,0.4)" }}>Código Pix (copia e cola):</p>
                <div className="flex items-center gap-2">
                  <input
                    readOnly
                    value={paymentResult.qr_code}
                    className="flex-1 text-xs rounded px-2 py-1.5 font-mono"
                    style={{ backgroundColor: "rgba(237,237,237,0.08)", border: "1px solid rgba(237,237,237,0.1)", color: "#ededed" }}
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(paymentResult.qr_code!);
                      toast.success("Código copiado!");
                    }}
                    className="p-2 rounded hover:opacity-80 transition-opacity"
                    style={{ backgroundColor: "#3b82f6", color: "#ffffff" }}
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </>
          ) : paymentResult.boleto_url ? (
            <>
              <h1 className="text-2xl font-bold" style={{ color: "#ededed" }}>Boleto Gerado</h1>
              <p className="text-sm" style={{ color: "rgba(237,237,237,0.6)" }}>Clique abaixo para visualizar seu boleto</p>
              {paymentResult.barcode && (
                <div className="rounded-lg p-3" style={{ backgroundColor: "rgba(237,237,237,0.05)", border: "1px solid rgba(237,237,237,0.1)" }}>
                  <p className="text-xs mb-1" style={{ color: "rgba(237,237,237,0.4)" }}>Código de barras:</p>
                  <p className="text-xs font-mono break-all" style={{ color: "rgba(237,237,237,0.7)" }}>{paymentResult.barcode}</p>
                </div>
              )}
              <a
                href={paymentResult.boleto_url}
                target="_blank"
                rel="noreferrer"
                className="inline-block px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
                style={{ backgroundColor: "#3b82f6", color: "#ffffff" }}
              >
                Ver Boleto
              </a>
            </>
          ) : (
            <>
              <Loader2 className="h-12 w-12 mx-auto animate-spin" style={{ color: "#3b82f6" }} />
              <h1 className="text-2xl font-bold" style={{ color: "#ededed" }}>Processando...</h1>
              <p className="text-sm" style={{ color: "rgba(237,237,237,0.6)" }}>Seu pagamento está sendo processado.</p>
            </>
          )}
        </div>
      </div>
    );
  }

  if (processing) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#1a1a1a" }}>
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto" style={{ color: page.primary_color }} />
          <p className="font-medium" style={{ color: "rgba(237,237,237,0.7)" }}>Processando pagamento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <CheckoutPreview
        template={page.template}
        headline={page.headline}
        subheadline={page.subheadline ?? ""}
        description={page.description ?? ""}
        ctaText={page.cta_text}
        primaryColor={page.primary_color}
        bgColor={page.bg_color}
        accentColor={page.accent_color ?? ""}
        imageUrl={page.image_url ?? ""}
        logoUrl={page.logo_url ?? ""}
        showGuarantee={page.show_guarantee ?? false}
        guaranteeText={page.guarantee_text ?? ""}
        offerName={offer?.name ?? "Oferta"}
        priceCents={offer?.price_cents ?? 0}
        billingType={offer?.billing_type ?? "one_time"}
        blocksLayout={(page as any).blocks_layout ?? undefined}
        onLeadSubmit={handleLeadSubmit}
        onCouponValidate={handleCouponValidate}
        appliedCoupon={appliedCoupon}
      />
    </div>
  );
}
