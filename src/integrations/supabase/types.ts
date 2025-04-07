export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      estimates: {
        Row: {
          contact_email: string
          contact_phone: string
          created_at: string | null
          id: string
          items: Json
          shipping_address: Json
          status: string
          total_amount: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          contact_email: string
          contact_phone: string
          created_at?: string | null
          id?: string
          items: Json
          shipping_address: Json
          status?: string
          total_amount?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          contact_email?: string
          contact_phone?: string
          created_at?: string | null
          id?: string
          items?: Json
          shipping_address?: Json
          status?: string
          total_amount?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      hero_content: {
        Row: {
          background_image: string | null
          created_at: string
          id: string
          page: string
          primary_button_link: string | null
          primary_button_text: string | null
          secondary_button_link: string | null
          secondary_button_text: string | null
          subtitle: string
          title: string
          updated_at: string
        }
        Insert: {
          background_image?: string | null
          created_at?: string
          id?: string
          page: string
          primary_button_link?: string | null
          primary_button_text?: string | null
          secondary_button_link?: string | null
          secondary_button_text?: string | null
          subtitle: string
          title: string
          updated_at?: string
        }
        Update: {
          background_image?: string | null
          created_at?: string
          id?: string
          page?: string
          primary_button_link?: string | null
          primary_button_text?: string | null
          secondary_button_link?: string | null
          secondary_button_text?: string | null
          subtitle?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          email: string
          first_name: string | null
          id: string
          subscribed_at: string
        }
        Insert: {
          email: string
          first_name?: string | null
          id?: string
          subscribed_at?: string
        }
        Update: {
          email?: string
          first_name?: string | null
          id?: string
          subscribed_at?: string
        }
        Relationships: []
      }
      newsletters: {
        Row: {
          content: Json
          created_at: string
          id: string
          preheader: string | null
          sent_at: string | null
          subject: string
          updated_at: string
        }
        Insert: {
          content: Json
          created_at?: string
          id?: string
          preheader?: string | null
          sent_at?: string | null
          subject: string
          updated_at?: string
        }
        Update: {
          content?: Json
          created_at?: string
          id?: string
          preheader?: string | null
          sent_at?: string | null
          subject?: string
          updated_at?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string | null
          id: string
          order_id: string
          product_id: string
          quantity: number
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          order_id: string
          product_id: string
          quantity: number
          unit_price: number
        }
        Update: {
          created_at?: string | null
          id?: string
          order_id?: string
          product_id?: string
          quantity?: number
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
          created_at: string | null
          id: string
          payment_intent_id: string | null
          shipping_address: Json
          status: string
          total_amount: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          payment_intent_id?: string | null
          shipping_address: Json
          status?: string
          total_amount: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          payment_intent_id?: string | null
          shipping_address?: Json
          status?: string
          total_amount?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      partners: {
        Row: {
          created_at: string
          description: string | null
          id: string
          logo: string
          name: string
          updated_at: string
          website: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          logo: string
          name: string
          updated_at?: string
          website?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          logo?: string
          name?: string
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          assembly: string | null
          category: string | null
          colors: string[] | null
          created_at: string
          description: string | null
          dimensions: string | null
          discount: number | null
          full_description: string | null
          id: string
          image: string | null
          images: string[] | null
          is_featured: boolean | null
          is_new: boolean | null
          material: string | null
          name: string
          price: number
          rating: number | null
          review_count: number | null
          sizes: string[] | null
          stock: number | null
          updated_at: string
          warranty: string | null
          weight: string | null
        }
        Insert: {
          assembly?: string | null
          category?: string | null
          colors?: string[] | null
          created_at?: string
          description?: string | null
          dimensions?: string | null
          discount?: number | null
          full_description?: string | null
          id?: string
          image?: string | null
          images?: string[] | null
          is_featured?: boolean | null
          is_new?: boolean | null
          material?: string | null
          name: string
          price: number
          rating?: number | null
          review_count?: number | null
          sizes?: string[] | null
          stock?: number | null
          updated_at?: string
          warranty?: string | null
          weight?: string | null
        }
        Update: {
          assembly?: string | null
          category?: string | null
          colors?: string[] | null
          created_at?: string
          description?: string | null
          dimensions?: string | null
          discount?: number | null
          full_description?: string | null
          id?: string
          image?: string | null
          images?: string[] | null
          is_featured?: boolean | null
          is_new?: boolean | null
          material?: string | null
          name?: string
          price?: number
          rating?: number | null
          review_count?: number | null
          sizes?: string[] | null
          stock?: number | null
          updated_at?: string
          warranty?: string | null
          weight?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          city: string | null
          country: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          is_admin: boolean | null
          phone_number: string | null
          role: string | null
          updated_at: string
        }
        Insert: {
          city?: string | null
          country?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          is_admin?: boolean | null
          phone_number?: string | null
          role?: string | null
          updated_at?: string
        }
        Update: {
          city?: string | null
          country?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          is_admin?: boolean | null
          phone_number?: string | null
          role?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string | null
          id: string
          product_id: string
          rating: number
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          id?: string
          product_id: string
          rating: number
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          id?: string
          product_id?: string
          rating?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
