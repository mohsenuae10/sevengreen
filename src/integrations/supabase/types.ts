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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          product_name: string
          quantity: number
          total_price: number
          unit_price: number
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          product_name: string
          quantity: number
          total_price: number
          unit_price: number
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string
          product_name?: string
          quantity?: number
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          city: string
          created_at: string | null
          customer_email: string
          customer_name: string
          customer_phone: string
          id: string
          notes: string | null
          order_number: string
          payment_status: Database["public"]["Enums"]["payment_status"] | null
          shipping_address: string
          shipping_fee: number
          status: Database["public"]["Enums"]["order_status"] | null
          stripe_payment_id: string | null
          total_amount: number
          tracking_number: string | null
          updated_at: string | null
        }
        Insert: {
          city: string
          created_at?: string | null
          customer_email: string
          customer_name: string
          customer_phone: string
          id?: string
          notes?: string | null
          order_number: string
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          shipping_address: string
          shipping_fee?: number
          status?: Database["public"]["Enums"]["order_status"] | null
          stripe_payment_id?: string | null
          total_amount: number
          tracking_number?: string | null
          updated_at?: string | null
        }
        Update: {
          city?: string
          created_at?: string | null
          customer_email?: string
          customer_name?: string
          customer_phone?: string
          id?: string
          notes?: string | null
          order_number?: string
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          shipping_address?: string
          shipping_fee?: number
          status?: Database["public"]["Enums"]["order_status"] | null
          stripe_payment_id?: string | null
          total_amount?: number
          tracking_number?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      product_images: {
        Row: {
          created_at: string | null
          display_order: number | null
          id: string
          image_url: string
          is_primary: boolean | null
          product_id: string
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          image_url: string
          is_primary?: boolean | null
          product_id: string
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          image_url?: string
          is_primary?: boolean | null
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          benefits_ar: string | null
          category: string
          created_at: string | null
          description_ar: string | null
          how_to_use_ar: string | null
          id: string
          image_url: string | null
          ingredients_ar: string | null
          is_active: boolean | null
          made_in: string | null
          name_ar: string
          price: number
          seo_description: string | null
          seo_keywords: string | null
          seo_title: string | null
          size_info: string | null
          stock_quantity: number
          updated_at: string | null
          warnings_ar: string | null
        }
        Insert: {
          benefits_ar?: string | null
          category: string
          created_at?: string | null
          description_ar?: string | null
          how_to_use_ar?: string | null
          id?: string
          image_url?: string | null
          ingredients_ar?: string | null
          is_active?: boolean | null
          made_in?: string | null
          name_ar: string
          price: number
          seo_description?: string | null
          seo_keywords?: string | null
          seo_title?: string | null
          size_info?: string | null
          stock_quantity?: number
          updated_at?: string | null
          warnings_ar?: string | null
        }
        Update: {
          benefits_ar?: string | null
          category?: string
          created_at?: string | null
          description_ar?: string | null
          how_to_use_ar?: string | null
          id?: string
          image_url?: string | null
          ingredients_ar?: string | null
          is_active?: boolean | null
          made_in?: string | null
          name_ar?: string
          price?: number
          seo_description?: string | null
          seo_keywords?: string | null
          seo_title?: string | null
          size_info?: string | null
          stock_quantity?: number
          updated_at?: string | null
          warnings_ar?: string | null
        }
        Relationships: []
      }
      public_settings: {
        Row: {
          currency: string | null
          facebook_url: string | null
          id: string
          instagram_url: string | null
          seo_home_description: string | null
          seo_home_title: string | null
          store_domain: string | null
          store_logo_url: string | null
          store_name: string | null
          store_url: string | null
          updated_at: string | null
          whatsapp_number: string | null
        }
        Insert: {
          currency?: string | null
          facebook_url?: string | null
          id?: string
          instagram_url?: string | null
          seo_home_description?: string | null
          seo_home_title?: string | null
          store_domain?: string | null
          store_logo_url?: string | null
          store_name?: string | null
          store_url?: string | null
          updated_at?: string | null
          whatsapp_number?: string | null
        }
        Update: {
          currency?: string | null
          facebook_url?: string | null
          id?: string
          instagram_url?: string | null
          seo_home_description?: string | null
          seo_home_title?: string | null
          store_domain?: string | null
          store_logo_url?: string | null
          store_name?: string | null
          store_url?: string | null
          updated_at?: string | null
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          currency: string | null
          default_shipping_fee: number | null
          facebook_url: string | null
          id: string
          instagram_url: string | null
          seo_home_description: string | null
          seo_home_title: string | null
          store_domain: string | null
          store_email: string | null
          store_logo_url: string | null
          store_name: string | null
          store_phone: string | null
          store_url: string | null
          updated_at: string | null
          whatsapp_number: string | null
        }
        Insert: {
          currency?: string | null
          default_shipping_fee?: number | null
          facebook_url?: string | null
          id?: string
          instagram_url?: string | null
          seo_home_description?: string | null
          seo_home_title?: string | null
          store_domain?: string | null
          store_email?: string | null
          store_logo_url?: string | null
          store_name?: string | null
          store_phone?: string | null
          store_url?: string | null
          updated_at?: string | null
          whatsapp_number?: string | null
        }
        Update: {
          currency?: string | null
          default_shipping_fee?: number | null
          facebook_url?: string | null
          id?: string
          instagram_url?: string | null
          seo_home_description?: string | null
          seo_home_title?: string | null
          store_domain?: string | null
          store_email?: string | null
          store_logo_url?: string | null
          store_name?: string | null
          store_phone?: string | null
          store_url?: string | null
          updated_at?: string | null
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_admin_role_by_email: {
        Args: { user_email: string }
        Returns: undefined
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin"
      order_status:
        | "pending"
        | "processing"
        | "shipped"
        | "delivered"
        | "cancelled"
      payment_status: "pending" | "completed" | "failed"
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
      app_role: ["admin"],
      order_status: [
        "pending",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ],
      payment_status: ["pending", "completed", "failed"],
    },
  },
} as const
