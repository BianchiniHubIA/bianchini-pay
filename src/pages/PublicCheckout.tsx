import { useParams } from "react-router-dom";
import { useCheckoutPageBySlug } from "@/hooks/useCheckoutPages";
import { CheckoutPreview } from "@/components/checkout/CheckoutPreview";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useEffect, useCallback } from "react";
import { useTrackEvent } from "@/hooks/useTrackEvent";
import type { LeadFormData } from "@/components/checkout/LeadCaptureForm";

export default function PublicCheckout() {
  const { slug } = useParams<{ slug: string }>();
  const { data: page, isLoading, error } = useCheckoutPageBySlug(slug ?? null);
  const { track } = useTrackEvent(page?.id);

  const { data: offer } = useQuery({
    queryKey: ["public-offer", page?.offer_id],
    queryFn: async () => {
      if (!page?.offer_id) return null;
      const { data } = await supabase
        .from("offers")
        .select("name, price_cents, billing_type, product_id")
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
    if (!page) return;

    const params = new URLSearchParams(window.location.search);

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
