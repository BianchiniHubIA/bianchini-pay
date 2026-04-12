export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      checkout_events: {
        Row: {
          checkout_page_id: string
          created_at: string
          event_type: string
          id: string
          metadata: Json | null
          referrer: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
          visitor_id: string | null
        }
        Insert: {
          checkout_page_id: string
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json | null
          referrer?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          visitor_id?: string | null
        }
        Update: {
          checkout_page_id?: string
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          referrer?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          visitor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "checkout_events_checkout_page_id_fkey"
            columns: ["checkout_page_id"]
            isOneToOne: false
            referencedRelation: "checkout_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      checkout_pages: {
        Row: {
          accent_color: string | null
          bg_color: string
          created_at: string
          cta_text: string
          custom_scripts: string | null
          description: string | null
          fb_pixel_id: string | null
          ga_tracking_id: string | null
          gtm_id: string | null
          guarantee_text: string | null
          headline: string
          id: string
          image_url: string | null
          is_published: boolean
          logo_url: string | null
          offer_id: string
          organization_id: string
          primary_color: string
          show_guarantee: boolean
          slug: string
          subheadline: string | null
          template: string
          updated_at: string
        }
        Insert: {
          accent_color?: string | null
          bg_color?: string
          created_at?: string
          cta_text?: string
          custom_scripts?: string | null
          description?: string | null
          fb_pixel_id?: string | null
          ga_tracking_id?: string | null
          gtm_id?: string | null
          guarantee_text?: string | null
          headline?: string
          id?: string
          image_url?: string | null
          is_published?: boolean
          logo_url?: string | null
          offer_id: string
          organization_id: string
          primary_color?: string
          show_guarantee?: boolean
          slug: string
          subheadline?: string | null
          template?: string
          updated_at?: string
        }
        Update: {
          accent_color?: string | null
          bg_color?: string
          created_at?: string
          cta_text?: string
          custom_scripts?: string | null
          description?: string | null
          fb_pixel_id?: string | null
          ga_tracking_id?: string | null
          gtm_id?: string | null
          guarantee_text?: string | null
          headline?: string
          id?: string
          image_url?: string | null
          is_published?: boolean
          logo_url?: string | null
          offer_id?: string
          organization_id?: string
          primary_color?: string
          show_guarantee?: boolean
          slug?: string
          subheadline?: string | null
          template?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "checkout_pages_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "offers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checkout_pages_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          apply_to_bumps: boolean
          code: string
          created_at: string
          discount_percent: number
          expires_at: string | null
          id: string
          is_active: boolean
          max_uses: number | null
          organization_id: string
          product_id: string | null
          starts_at: string | null
          updated_at: string
          used_count: number
        }
        Insert: {
          apply_to_bumps?: boolean
          code: string
          created_at?: string
          discount_percent?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number | null
          organization_id: string
          product_id?: string | null
          starts_at?: string | null
          updated_at?: string
          used_count?: number
        }
        Update: {
          apply_to_bumps?: boolean
          code?: string
          created_at?: string
          discount_percent?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number | null
          organization_id?: string
          product_id?: string | null
          starts_at?: string | null
          updated_at?: string
          used_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "coupons_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coupons_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          created_at: string
          document: string | null
          email: string
          id: string
          name: string
          organization_id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          document?: string | null
          email: string
          id?: string
          name: string
          organization_id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          document?: string | null
          email?: string
          id?: string
          name?: string
          organization_id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          checkout_page_id: string | null
          converted_at: string | null
          created_at: string
          document: string | null
          email: string
          id: string
          ip_address: string | null
          metadata: Json | null
          name: string
          offer_id: string | null
          order_id: string | null
          organization_id: string
          payment_method: string | null
          product_id: string | null
          referrer: string | null
          status: string
          updated_at: string
          user_agent: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
          whatsapp: string | null
        }
        Insert: {
          checkout_page_id?: string | null
          converted_at?: string | null
          created_at?: string
          document?: string | null
          email: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          name: string
          offer_id?: string | null
          order_id?: string | null
          organization_id: string
          payment_method?: string | null
          product_id?: string | null
          referrer?: string | null
          status?: string
          updated_at?: string
          user_agent?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          whatsapp?: string | null
        }
        Update: {
          checkout_page_id?: string | null
          converted_at?: string | null
          created_at?: string
          document?: string | null
          email?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          name?: string
          offer_id?: string | null
          order_id?: string | null
          organization_id?: string
          payment_method?: string | null
          product_id?: string | null
          referrer?: string | null
          status?: string
          updated_at?: string
          user_agent?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_checkout_page_id_fkey"
            columns: ["checkout_page_id"]
            isOneToOne: false
            referencedRelation: "checkout_pages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "offers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      offers: {
        Row: {
          billing_interval:
            | Database["public"]["Enums"]["billing_interval"]
            | null
          billing_type: Database["public"]["Enums"]["billing_type"]
          created_at: string
          currency: string
          id: string
          installments: number | null
          is_active: boolean
          name: string
          organization_id: string
          price_cents: number
          product_id: string
          trial_days: number | null
          updated_at: string
        }
        Insert: {
          billing_interval?:
            | Database["public"]["Enums"]["billing_interval"]
            | null
          billing_type?: Database["public"]["Enums"]["billing_type"]
          created_at?: string
          currency?: string
          id?: string
          installments?: number | null
          is_active?: boolean
          name: string
          organization_id: string
          price_cents?: number
          product_id: string
          trial_days?: number | null
          updated_at?: string
        }
        Update: {
          billing_interval?:
            | Database["public"]["Enums"]["billing_interval"]
            | null
          billing_type?: Database["public"]["Enums"]["billing_type"]
          created_at?: string
          currency?: string
          id?: string
          installments?: number | null
          is_active?: boolean
          name?: string
          organization_id?: string
          price_cents?: number
          product_id?: string
          trial_days?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "offers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offers_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      order_bumps: {
        Row: {
          checkout_page_id: string
          created_at: string
          description: string | null
          display_price_cents: number
          id: string
          is_active: boolean
          offer_id: string
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          checkout_page_id: string
          created_at?: string
          description?: string | null
          display_price_cents?: number
          id?: string
          is_active?: boolean
          offer_id: string
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Update: {
          checkout_page_id?: string
          created_at?: string
          description?: string | null
          display_price_cents?: number
          id?: string
          is_active?: boolean
          offer_id?: string
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_bumps_checkout_page_id_fkey"
            columns: ["checkout_page_id"]
            isOneToOne: false
            referencedRelation: "checkout_pages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_bumps_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "offers"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          amount_cents: number
          created_at: string
          currency: string
          customer_id: string | null
          external_id: string | null
          id: string
          offer_id: string | null
          organization_id: string
          payment_method: string | null
          status: Database["public"]["Enums"]["order_status"]
          updated_at: string
        }
        Insert: {
          amount_cents?: number
          created_at?: string
          currency?: string
          customer_id?: string | null
          external_id?: string | null
          id?: string
          offer_id?: string | null
          organization_id: string
          payment_method?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          updated_at?: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          currency?: string
          customer_id?: string | null
          external_id?: string | null
          id?: string
          offer_id?: string | null
          organization_id?: string
          payment_method?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "offers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      org_members: {
        Row: {
          created_at: string
          id: string
          organization_id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          organization_id: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          organization_id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "org_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          id: string
          logo_url: string | null
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          logo_url?: string | null
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          logo_url?: string | null
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      payment_gateways: {
        Row: {
          created_at: string
          credentials: Json
          display_name: string
          environment: string
          id: string
          is_active: boolean
          is_primary: boolean
          organization_id: string
          priority: number
          provider: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          credentials?: Json
          display_name: string
          environment?: string
          id?: string
          is_active?: boolean
          is_primary?: boolean
          organization_id: string
          priority?: number
          provider: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          credentials?: Json
          display_name?: string
          environment?: string
          id?: string
          is_active?: boolean
          is_primary?: boolean
          organization_id?: string
          priority?: number
          provider?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_gateways_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      product_members: {
        Row: {
          created_at: string
          id: string
          member_id: string
          percentage: number
          product_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          member_id: string
          percentage?: number
          product_id: string
        }
        Update: {
          created_at?: string
          id?: string
          member_id?: string
          percentage?: number
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_members_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "org_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_members_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          access_type: string | null
          created_at: string
          description: string | null
          fb_pixel_id: string | null
          ga_tracking_id: string | null
          google_ads_id: string | null
          guarantee_days: number | null
          id: string
          image_url: string | null
          meta_ads_id: string | null
          name: string
          organization_id: string
          producer_name: string | null
          require_address: boolean | null
          require_email_confirm: boolean | null
          sales_page_url: string | null
          show_coupon_field: boolean | null
          status: Database["public"]["Enums"]["product_status"]
          support_email: string | null
          type: Database["public"]["Enums"]["product_type"]
          updated_at: string
        }
        Insert: {
          access_type?: string | null
          created_at?: string
          description?: string | null
          fb_pixel_id?: string | null
          ga_tracking_id?: string | null
          google_ads_id?: string | null
          guarantee_days?: number | null
          id?: string
          image_url?: string | null
          meta_ads_id?: string | null
          name: string
          organization_id: string
          producer_name?: string | null
          require_address?: boolean | null
          require_email_confirm?: boolean | null
          sales_page_url?: string | null
          show_coupon_field?: boolean | null
          status?: Database["public"]["Enums"]["product_status"]
          support_email?: string | null
          type?: Database["public"]["Enums"]["product_type"]
          updated_at?: string
        }
        Update: {
          access_type?: string | null
          created_at?: string
          description?: string | null
          fb_pixel_id?: string | null
          ga_tracking_id?: string | null
          google_ads_id?: string | null
          guarantee_days?: number | null
          id?: string
          image_url?: string | null
          meta_ads_id?: string | null
          name?: string
          organization_id?: string
          producer_name?: string | null
          require_address?: boolean | null
          require_email_confirm?: boolean | null
          sales_page_url?: string | null
          show_coupon_field?: boolean | null
          status?: Database["public"]["Enums"]["product_status"]
          support_email?: string | null
          type?: Database["public"]["Enums"]["product_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_org_ids: { Args: { _user_id: string }; Returns: string[] }
      has_org_role: {
        Args: {
          _org_id: string
          _roles: Database["public"]["Enums"]["app_role"][]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "owner" | "admin" | "editor" | "viewer"
      billing_interval: "monthly" | "quarterly" | "semiannual" | "annual"
      billing_type: "one_time" | "recurring"
      order_status: "pending" | "paid" | "refunded" | "cancelled" | "expired"
      product_status: "active" | "inactive" | "draft"
      product_type: "digital" | "physical" | "service"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["owner", "admin", "editor", "viewer"],
      billing_interval: ["monthly", "quarterly", "semiannual", "annual"],
      billing_type: ["one_time", "recurring"],
      order_status: ["pending", "paid", "refunded", "cancelled", "expired"],
      product_status: ["active", "inactive", "draft"],
      product_type: ["digital", "physical", "service"],
    },
  },
} as const
