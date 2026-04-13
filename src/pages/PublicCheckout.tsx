import { useParams } from "react-router-dom";
import { useCheckoutPageBySlug } from "@/hooks/useCheckoutPages";
import { CheckoutPreview } from "@/components/checkout/CheckoutPreview";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Loader2, CheckCircle2, Copy, QrCode } from "lucide-react";
import { useEffect, useCallback, useState } from "react";
import { useTrackEvent } from "@/hooks/useTrackEvent";
import type { LeadFormData } from "@/components/checkout/LeadCaptureForm";
import { toast } from "sonner";

interface PaymentResult {
  id: string;
  status: string;
  qr_code?: string;
  qr_code_base64?: string;
  ticket_url?: string;
  barcode?: string;
  boleto_url?: string;
  init_point?: string;
}

export default function PublicCheckout() {
  const { slug } = useParams<{ slug: string }>();
  const { data: page, isLoading, error } = useCheckoutPageBySlug(slug ?? null);
  const { track } = useTrackEvent(page?.id);
  const [processing, setProcessing] = useState(false);
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null);

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

  const handleLeadSubmit = useCallback(async (data: LeadFormData) => {
    if (!page || !offer) return;

    const params = new URLSearchParams(window.location.search);

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
    });

    track("lead_captured");

    // 2. Process payment
    setProcessing(true);
    try {
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
            customer: {
              name: data.name.trim(),
              email: data.email.trim().toLowerCase(),
              document: data.document.trim(),
              whatsapp: data.whatsapp.trim(),
            },
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erro ao processar pagamento");
      }

      track("payment_initiated");
      setPaymentResult(result.payment);

      if (result.payment.status === "approved") {
        toast.success("Pagamento aprovado! 🎉");
        track("payment_approved");
      } else if (result.payment.init_point) {
        // Subscription - redirect to MP
        window.location.href = result.payment.init_point;
      } else {
        toast.success("Pagamento criado! Siga as instruções.");
      }
    } catch (e: any) {
      toast.error(e.message || "Erro ao processar pagamento");
    } finally {
      setProcessing(false);
    }
  }, [page, offer, track]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!page || error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground">
        <h1 className="text-2xl font-bold mb-2">Página não encontrada</h1>
        <p className="text-muted-foreground">Este checkout não existe ou não está publicado.</p>
      </div>
    );
  }

  // Show payment result screen
  if (paymentResult) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-6">
        <div className="max-w-md w-full space-y-6 text-center">
          {paymentResult.status === "approved" ? (
            <>
              <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
              <h1 className="text-2xl font-bold text-gray-900">Pagamento Aprovado!</h1>
              <p className="text-gray-600">Seu pagamento foi processado com sucesso.</p>
            </>
          ) : paymentResult.qr_code ? (
            <>
              <QrCode className="h-12 w-12 text-blue-500 mx-auto" />
              <h1 className="text-2xl font-bold text-gray-900">Pague com Pix</h1>
              <p className="text-gray-600 text-sm">Escaneie o QR code ou copie o código abaixo</p>
              {paymentResult.qr_code_base64 && (
                <img
                  src={`data:image/png;base64,${paymentResult.qr_code_base64}`}
                  alt="QR Code Pix"
                  className="mx-auto w-48 h-48"
                />
              )}
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-2">Código Pix (copia e cola):</p>
                <div className="flex items-center gap-2">
                  <input
                    readOnly
                    value={paymentResult.qr_code}
                    className="flex-1 text-xs bg-white border rounded px-2 py-1.5 text-gray-700"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(paymentResult.qr_code!);
                      toast.success("Código copiado!");
                    }}
                    className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </>
          ) : paymentResult.boleto_url ? (
            <>
              <h1 className="text-2xl font-bold text-gray-900">Boleto Gerado</h1>
              <p className="text-gray-600 text-sm">Clique abaixo para visualizar seu boleto</p>
              {paymentResult.barcode && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Código de barras:</p>
                  <p className="text-xs font-mono text-gray-700 break-all">{paymentResult.barcode}</p>
                </div>
              )}
              <a
                href={paymentResult.boleto_url}
                target="_blank"
                rel="noreferrer"
                className="inline-block px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600"
              >
                Ver Boleto
              </a>
            </>
          ) : (
            <>
              <Loader2 className="h-12 w-12 text-blue-500 mx-auto animate-spin" />
              <h1 className="text-2xl font-bold text-gray-900">Processando...</h1>
              <p className="text-gray-600 text-sm">Seu pagamento está sendo processado.</p>
            </>
          )}
        </div>
      </div>
    );
  }

  // Show processing overlay
  if (processing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto" />
          <p className="text-gray-600 font-medium">Processando pagamento...</p>
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
        showGuarantee={page.show_guarantee}
        guaranteeText={page.guarantee_text ?? ""}
        offerName={offer?.name ?? "Oferta"}
        priceCents={offer?.price_cents ?? 0}
        billingType={offer?.billing_type ?? "one_time"}
        onLeadSubmit={handleLeadSubmit}
      />
    </div>
  );
}
