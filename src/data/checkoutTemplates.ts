/**
 * Checkout Template Seeds
 * Cada template é um JSON estruturado com blocos lógicos, estilos visuais e
 * configuração pronta para carregar no editor.
 */

export interface TemplateBlock {
  id: string;
  type: string;
  label: string;
  order: number;
  props: Record<string, any>;
}

export interface CheckoutTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  thumbnail_style: {
    primary_color: string;
    bg_color: string;
    accent_color: string;
    font_heading: string;
    font_body: string;
  };
  form_defaults: {
    template: string;
    headline: string;
    subheadline: string;
    description: string;
    cta_text: string;
    primary_color: string;
    bg_color: string;
    accent_color: string;
    show_guarantee: boolean;
    guarantee_text: string;
  };
  blocks: TemplateBlock[];
}

export const CHECKOUT_TEMPLATES: CheckoutTemplate[] = [
  // ─── 1. HOTMART (Clássico Infoproduto Long Page) ───
  {
    id: "hotmart",
    name: "Estilo Hotmart",
    description: "Long page persuasiva com prova social, ideal para infoprodutos",
    category: "infoproduto",
    thumbnail_style: {
      primary_color: "#FF6B00",
      bg_color: "#FFFAF5",
      accent_color: "#7C3AED",
      font_heading: "Space Grotesk",
      font_body: "DM Sans",
    },
    form_defaults: {
      template: "hotmart",
      headline: "Transforme sua vida com o método comprovado",
      subheadline: "Mais de 10.000 alunos já transformaram seus resultados",
      description: "Acesso imediato a todo o conteúdo + bônus exclusivos + comunidade VIP + suporte prioritário.",
      cta_text: "QUERO GARANTIR MINHA VAGA",
      primary_color: "#FF6B00",
      bg_color: "#FFFAF5",
      accent_color: "#7C3AED",
      show_guarantee: true,
      guarantee_text: "7 dias de garantia incondicional",
    },
    blocks: [
      {
        id: "header-sticky",
        type: "header",
        label: "Header Fixo",
        order: 0,
        props: {
          sticky: true,
          show_logo: true,
          show_cta: true,
          cta_text: "Comprar Agora",
          bg_color: "#FFFFFF",
          shadow: true,
        },
      },
      {
        id: "hero-section",
        type: "hero",
        label: "Hero com Vídeo",
        order: 1,
        props: {
          layout: "centered",
          media_type: "video",
          media_placeholder: "https://youtube.com/embed/placeholder",
          title_size: "4xl",
          show_price: true,
          show_installments: true,
          installments_text: "ou 12x de {{installment_price}}",
          show_badge: true,
          badge_text: "🔥 OFERTA ESPECIAL",
          bg_gradient: "linear-gradient(180deg, #FFFAF5 0%, #FFF5EB 100%)",
        },
      },
      {
        id: "benefits-grid",
        type: "benefits",
        label: "O que você vai receber",
        order: 2,
        props: {
          columns: 4,
          style: "card",
          items: [
            { icon: "play-circle", title: "Aulas em Vídeo", desc: "+200 aulas organizadas em módulos" },
            { icon: "download", title: "Material de Apoio", desc: "PDFs, planilhas e templates" },
            { icon: "users", title: "Comunidade VIP", desc: "Grupo exclusivo de alunos" },
            { icon: "headphones", title: "Suporte Prioritário", desc: "Tire dúvidas diretamente" },
          ],
        },
      },
      {
        id: "testimonials",
        type: "testimonials",
        label: "Depoimentos",
        order: 3,
        props: {
          layout: "carousel",
          items: [
            { name: "Maria S.", photo: "", text: "Resultado incrível em apenas 30 dias!", rating: 5 },
            { name: "João P.", photo: "", text: "Melhor investimento que já fiz na minha carreira.", rating: 5 },
            { name: "Ana L.", photo: "", text: "Conteúdo de altíssima qualidade. Superou minhas expectativas.", rating: 5 },
          ],
        },
      },
      {
        id: "guarantee",
        type: "guarantee",
        label: "Garantia",
        order: 4,
        props: {
          days: 7,
          title: "Garantia Incondicional de 7 Dias",
          description: "Se por qualquer motivo você não ficar satisfeito, devolvemos 100% do seu investimento. Sem perguntas.",
          icon: "shield-check",
          bg_color: "#F0FDF4",
          border_color: "#22C55E",
        },
      },
      {
        id: "faq",
        type: "faq",
        label: "Perguntas Frequentes",
        order: 5,
        props: {
          items: [
            { q: "Como acesso o conteúdo?", a: "Imediatamente após a confirmação do pagamento, você receberá um e-mail com os dados de acesso." },
            { q: "Posso parcelar?", a: "Sim! Aceitamos cartão de crédito em até 12x." },
            { q: "Tem garantia?", a: "Sim, 7 dias de garantia incondicional." },
            { q: "Funciona no celular?", a: "Sim, a plataforma é 100% responsiva." },
          ],
        },
      },
      {
        id: "urgency",
        type: "urgency",
        label: "Escassez e Urgência",
        order: 6,
        props: {
          show_countdown: true,
          countdown_hours: 24,
          text: "⚡ Vagas limitadas — preço sobe em breve",
          bg_color: "#FEF2F2",
          text_color: "#DC2626",
        },
      },
      {
        id: "payment-block",
        type: "payment",
        label: "Bloco de Pagamento",
        order: 7,
        props: {
          position: "full-width",
          show_methods: ["pix", "credit_card", "boleto"],
          highlight_pix: true,
          bg_color: "#FFFFFF",
        },
      },
      {
        id: "footer",
        type: "footer",
        label: "Footer",
        order: 8,
        props: {
          show_security_badges: true,
          show_terms: true,
          show_support: true,
          links: ["Termos de Uso", "Política de Privacidade", "Suporte"],
        },
      },
    ],
  },

  // ─── 2. STRIPE (Minimalista SaaS) ───
  {
    id: "stripe",
    name: "Estilo Stripe",
    description: "Design limpo e profissional, ideal para SaaS e ferramentas",
    category: "saas",
    thumbnail_style: {
      primary_color: "#635BFF",
      bg_color: "#FFFFFF",
      accent_color: "#0ACF83",
      font_heading: "Inter",
      font_body: "Inter",
    },
    form_defaults: {
      template: "stripe",
      headline: "Comece a usar hoje mesmo",
      subheadline: "Simples, seguro e sem burocracia.",
      description: "Acesso completo a todas as funcionalidades. Cancele a qualquer momento.",
      cta_text: "Assinar agora",
      primary_color: "#635BFF",
      bg_color: "#FFFFFF",
      accent_color: "#0ACF83",
      show_guarantee: true,
      guarantee_text: "Cancele quando quiser, sem multas",
    },
    blocks: [
      {
        id: "header-clean",
        type: "header",
        label: "Header Limpo",
        order: 0,
        props: {
          sticky: false,
          show_logo: true,
          show_cta: false,
          bg_color: "#FFFFFF",
          border_bottom: true,
          minimal: true,
        },
      },
      {
        id: "split-main",
        type: "split_layout",
        label: "Conteúdo Principal",
        order: 1,
        props: {
          layout: "two-columns",
          left_ratio: 55,
          right_ratio: 45,
          left_content: "product_info",
          right_content: "payment_card",
          gap: 48,
        },
      },
      {
        id: "product-info",
        type: "product_details",
        label: "Detalhes do Produto",
        order: 2,
        props: {
          show_features_list: true,
          features: [
            "Acesso ilimitado a todos os recursos",
            "Suporte prioritário via chat",
            "Atualizações gratuitas",
            "API completa com documentação",
          ],
          list_style: "check",
          list_color: "#0ACF83",
        },
      },
      {
        id: "payment-card",
        type: "payment_card",
        label: "Card de Pagamento",
        order: 3,
        props: {
          style: "elevated",
          shadow: "lg",
          border_radius: 16,
          bg_color: "#FFFFFF",
          show_summary: true,
          show_total: true,
          show_methods: ["credit_card", "pix"],
        },
      },
      {
        id: "trust-bar",
        type: "trust_signals",
        label: "Selos de Confiança",
        order: 4,
        props: {
          layout: "inline",
          items: ["SSL Seguro", "Mercado Pago", "Dados Protegidos"],
          style: "subtle",
        },
      },
      {
        id: "faq-short",
        type: "faq",
        label: "FAQ",
        order: 5,
        props: {
          items: [
            { q: "Posso cancelar a qualquer momento?", a: "Sim, sem multas ou taxas de cancelamento." },
            { q: "Meus dados estão seguros?", a: "Usamos criptografia de ponta a ponta." },
          ],
        },
      },
      {
        id: "footer-minimal",
        type: "footer",
        label: "Footer",
        order: 6,
        props: {
          show_security_badges: false,
          show_terms: true,
          show_support: true,
          minimal: true,
        },
      },
    ],
  },

  // ─── 3. ASAAS (Focado em Pagamentos BR) ───
  {
    id: "asaas",
    name: "Estilo Asaas",
    description: "Foco em pagamentos brasileiros com Pix em destaque",
    category: "pagamentos",
    thumbnail_style: {
      primary_color: "#1B2A4A",
      bg_color: "#F8FAFC",
      accent_color: "#00C853",
      font_heading: "DM Sans",
      font_body: "DM Sans",
    },
    form_defaults: {
      template: "asaas",
      headline: "Finalize sua compra",
      subheadline: "Escolha a melhor forma de pagamento",
      description: "Pagamento seguro e processado instantaneamente. Pix, cartão ou boleto.",
      cta_text: "Pagar agora",
      primary_color: "#1B2A4A",
      bg_color: "#F8FAFC",
      accent_color: "#00C853",
      show_guarantee: true,
      guarantee_text: "Pagamento seguro via Mercado Pago",
    },
    blocks: [
      {
        id: "header-brand",
        type: "header",
        label: "Header",
        order: 0,
        props: {
          sticky: false,
          show_logo: true,
          show_cta: false,
          bg_color: "#1B2A4A",
          text_color: "#FFFFFF",
        },
      },
      {
        id: "offer-summary",
        type: "offer_summary",
        label: "Resumo da Oferta",
        order: 1,
        props: {
          show_price_large: true,
          show_installments: true,
          show_pix_discount: true,
          pix_discount_percent: 10,
          pix_discount_text: "Economize {{discount}}% pagando no Pix",
          tabs: ["Pix", "Cartão de Crédito", "Boleto"],
          default_tab: "Pix",
        },
      },
      {
        id: "pix-highlight",
        type: "pix_section",
        label: "Destaque Pix",
        order: 2,
        props: {
          show_qr_placeholder: true,
          title: "Pague em segundos com Pix",
          description: "Escaneie o QR Code ou copie o código. Aprovação instantânea!",
          bg_color: "#F0FFF4",
          border_color: "#00C853",
          icon: "qr-code",
          expiration_text: "O código Pix expira em 30 minutos",
        },
      },
      {
        id: "quick-benefits",
        type: "benefits",
        label: "Benefícios Rápidos",
        order: 3,
        props: {
          columns: 3,
          style: "compact",
          items: [
            { icon: "zap", title: "Entrega Imediata", desc: "Acesso instantâneo" },
            { icon: "headphones", title: "Suporte 24h", desc: "Sempre disponível" },
            { icon: "shield", title: "100% Seguro", desc: "Dados protegidos" },
          ],
        },
      },
      {
        id: "payment-main",
        type: "payment",
        label: "Bloco de Pagamento",
        order: 4,
        props: {
          position: "full-width",
          show_methods: ["pix", "credit_card", "boleto"],
          highlight_pix: true,
          show_tabs: true,
          bg_color: "#FFFFFF",
          border_radius: 12,
        },
      },
      {
        id: "security-info",
        type: "trust_signals",
        label: "Segurança",
        order: 5,
        props: {
          layout: "banner",
          items: ["Criptografia SSL", "Mercado Pago Protegido", "Dados Seguros"],
          bg_color: "#F1F5F9",
        },
      },
      {
        id: "faq-payment",
        type: "faq",
        label: "FAQ de Pagamento",
        order: 6,
        props: {
          items: [
            { q: "Como pagar com Pix?", a: "Copie o código ou escaneie o QR Code com o app do seu banco." },
            { q: "Quanto tempo leva para liberar?", a: "No Pix, a liberação é instantânea. Cartão em até 5 minutos." },
            { q: "Posso parcelar no cartão?", a: "Sim, em até 12x no cartão de crédito." },
          ],
        },
      },
      {
        id: "footer-info",
        type: "footer",
        label: "Footer",
        order: 7,
        props: {
          show_security_badges: true,
          show_terms: true,
          show_support: true,
        },
      },
    ],
  },

  // ─── 4. CAKTO (Alta Conversão BR) ───
  {
    id: "cakto",
    name: "Estilo Cakto",
    description: "Bold e visual, alta conversão com apelo emocional forte",
    category: "alta-conversao",
    thumbnail_style: {
      primary_color: "#E53E3E",
      bg_color: "#0F0F0F",
      accent_color: "#F6AD55",
      font_heading: "Space Grotesk",
      font_body: "DM Sans",
    },
    form_defaults: {
      template: "cakto",
      headline: "A ÚNICA oportunidade que vai mudar tudo",
      subheadline: "Já são mais de 5.000 resultados comprovados",
      description: "Método exclusivo testado e validado. Acesso vitalício + atualizações + bônus.",
      cta_text: "SIM, EU QUERO AGORA!",
      primary_color: "#E53E3E",
      bg_color: "#0F0F0F",
      accent_color: "#F6AD55",
      show_guarantee: true,
      guarantee_text: "30 dias de garantia total ou seu dinheiro de volta",
    },
    blocks: [
      {
        id: "hero-impact",
        type: "hero",
        label: "Hero de Impacto",
        order: 0,
        props: {
          layout: "full-width",
          media_type: "video",
          title_size: "5xl",
          bg_gradient: "linear-gradient(135deg, #0F0F0F 0%, #1A1A2E 100%)",
          show_price: true,
          show_badge: true,
          badge_text: "🏆 MAIS VENDIDO",
          badge_color: "#F6AD55",
          overlay: true,
          text_color: "#FFFFFF",
        },
      },
      {
        id: "price-highlight",
        type: "price_box",
        label: "Preço em Destaque",
        order: 1,
        props: {
          style: "premium",
          show_original_price: true,
          original_price_text: "De R$ 997,00",
          show_discount_badge: true,
          discount_badge_text: "MELHOR OFERTA",
          bg_gradient: "linear-gradient(135deg, #E53E3E 0%, #C53030 100%)",
          text_color: "#FFFFFF",
          border_radius: 16,
          animation: "pulse",
        },
      },
      {
        id: "benefits-impact",
        type: "benefits",
        label: "Benefícios de Impacto",
        order: 2,
        props: {
          columns: 3,
          style: "bold-card",
          bg_color: "#1A1A2E",
          items: [
            { icon: "rocket", title: "Resultado Rápido", desc: "Veja mudanças em 7 dias" },
            { icon: "trophy", title: "Método Comprovado", desc: "+5.000 alunos aprovam" },
            { icon: "infinity", title: "Acesso Vitalício", desc: "Estude no seu ritmo" },
          ],
        },
      },
      {
        id: "testimonials-visual",
        type: "testimonials",
        label: "Depoimentos Visuais",
        order: 3,
        props: {
          layout: "grid-large",
          show_results: true,
          items: [
            { name: "Carlos M.", photo: "", text: "Faturei R$ 50k no primeiro mês!", rating: 5, result: "R$ 50.000/mês" },
            { name: "Fernanda R.", photo: "", text: "Saí do zero e hoje tenho meu negócio.", rating: 5, result: "Negócio próprio" },
            { name: "Lucas T.", photo: "", text: "O melhor investimento da minha vida.", rating: 5, result: "3x mais produtivo" },
          ],
        },
      },
      {
        id: "social-proof-counter",
        type: "urgency",
        label: "Prova Social + Urgência",
        order: 4,
        props: {
          show_countdown: true,
          countdown_hours: 6,
          text: "🔥 {{sold_count}} unidades vendidas hoje",
          sold_count: 147,
          bg_gradient: "linear-gradient(90deg, #F6AD55 0%, #E53E3E 100%)",
          text_color: "#FFFFFF",
          animation: "slide",
        },
      },
      {
        id: "payment-central",
        type: "payment",
        label: "Bloco de Pagamento Central",
        order: 5,
        props: {
          position: "centered",
          show_methods: ["pix", "credit_card"],
          highlight_pix: true,
          bg_color: "#1A1A2E",
          border_color: "#E53E3E",
          border_radius: 16,
          shadow: "2xl",
        },
      },
      {
        id: "guarantee-strong",
        type: "guarantee",
        label: "Garantia Reforçada",
        order: 6,
        props: {
          days: 30,
          title: "GARANTIA BLINDADA DE 30 DIAS",
          description: "Se você não tiver resultados, devolvemos cada centavo. Sem letras miúdas.",
          icon: "shield-check",
          bg_gradient: "linear-gradient(135deg, #065F46 0%, #047857 100%)",
          text_color: "#FFFFFF",
          border_radius: 16,
          badge: "100% RISCO ZERO",
        },
      },
      {
        id: "footer-ctas",
        type: "footer",
        label: "Footer com CTAs",
        order: 7,
        props: {
          show_security_badges: true,
          show_terms: true,
          show_support: true,
          show_extra_cta: true,
          extra_cta_text: "ÚLTIMA CHANCE — COMPRAR AGORA",
          bg_color: "#0F0F0F",
          text_color: "#FFFFFF",
        },
      },
    ],
  },

  // ─── 5. BLANK (Página em Branco) ───
  {
    id: "blank",
    name: "Em Branco",
    description: "Comece do zero e crie do seu jeito",
    category: "custom",
    thumbnail_style: {
      primary_color: "#6B7280",
      bg_color: "#FFFFFF",
      accent_color: "#6B7280",
      font_heading: "Space Grotesk",
      font_body: "DM Sans",
    },
    form_defaults: {
      template: "blank",
      headline: "Seu título aqui",
      subheadline: "",
      description: "",
      cta_text: "Comprar agora",
      primary_color: "#3366FF",
      bg_color: "#FFFFFF",
      accent_color: "",
      show_guarantee: false,
      guarantee_text: "7 dias de garantia",
    },
    blocks: [
      {
        id: "header-blank",
        type: "header",
        label: "Header",
        order: 0,
        props: { sticky: false, show_logo: true, show_cta: false, minimal: true },
      },
      {
        id: "hero-blank",
        type: "hero",
        label: "Seção Principal",
        order: 1,
        props: { layout: "centered", title_size: "3xl", media_type: "none" },
      },
      {
        id: "payment-blank",
        type: "payment",
        label: "Bloco de Pagamento",
        order: 2,
        props: { position: "centered", show_methods: ["pix", "credit_card"], bg_color: "#FFFFFF" },
      },
      {
        id: "footer-blank",
        type: "footer",
        label: "Footer",
        order: 3,
        props: { show_security_badges: false, show_terms: true, minimal: true },
      },
    ],
  },
];

export function getTemplateById(id: string): CheckoutTemplate | undefined {
  return CHECKOUT_TEMPLATES.find((t) => t.id === id);
}
