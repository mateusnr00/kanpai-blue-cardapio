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
      analytics_events: {
        Row: {
          category_id: string | null
          created_at: string
          dish_slug: string | null
          event_type: string
          id: string
          pathname: string | null
          referrer: string | null
          session_id: string
          user_agent: string | null
          visitor_id: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          dish_slug?: string | null
          event_type: string
          id?: string
          pathname?: string | null
          referrer?: string | null
          session_id: string
          user_agent?: string | null
          visitor_id: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          dish_slug?: string | null
          event_type?: string
          id?: string
          pathname?: string | null
          referrer?: string | null
          session_id?: string
          user_agent?: string | null
          visitor_id?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          active: boolean
          created_at: string
          description: string
          detail: string | null
          featured: boolean
          full_width: boolean
          gradient: string
          id: string
          image_path: string | null
          item_count: string | null
          name: string
          number: string
          position: number
          short_name: string | null
          subcategories: string[]
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          description: string
          detail?: string | null
          featured?: boolean
          full_width?: boolean
          gradient: string
          id: string
          image_path?: string | null
          item_count?: string | null
          name: string
          number: string
          position: number
          short_name?: string | null
          subcategories?: string[]
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string
          detail?: string | null
          featured?: boolean
          full_width?: boolean
          gradient?: string
          id?: string
          image_path?: string | null
          item_count?: string | null
          name?: string
          number?: string
          position?: number
          short_name?: string | null
          subcategories?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      dish_detail_sections: {
        Row: {
          description: string
          dish_id: string
          id: string
          label: string
          position: number
        }
        Insert: {
          description: string
          dish_id: string
          id?: string
          label: string
          position: number
        }
        Update: {
          description?: string
          dish_id?: string
          id?: string
          label?: string
          position?: number
        }
        Relationships: [
          {
            foreignKeyName: "dish_detail_sections_dish_id_fkey"
            columns: ["dish_id"]
            isOneToOne: false
            referencedRelation: "dishes"
            referencedColumns: ["id"]
          },
        ]
      }
      dish_likes: {
        Row: {
          count: number
          dish_id: string
          updated_at: string
        }
        Insert: {
          count?: number
          dish_id: string
          updated_at?: string
        }
        Update: {
          count?: number
          dish_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      dish_variants: {
        Row: {
          dish_id: string
          id: string
          image_path: string | null
          name: string
          position: number
          price: string
        }
        Insert: {
          dish_id: string
          id?: string
          image_path?: string | null
          name: string
          position: number
          price: string
        }
        Update: {
          dish_id?: string
          id?: string
          image_path?: string | null
          name?: string
          position?: number
          price?: string
        }
        Relationships: [
          {
            foreignKeyName: "dish_variants_dish_id_fkey"
            columns: ["dish_id"]
            isOneToOne: false
            referencedRelation: "dishes"
            referencedColumns: ["id"]
          },
        ]
      }
      dishes: {
        Row: {
          active: boolean
          badges: string[]
          category_id: string
          created_at: string
          description: string | null
          featured: boolean
          featured_gradient: string | null
          id: string
          image_path: string | null
          long_description: string | null
          name: string
          original_price: string | null
          position: number
          price: string | null
          slug: string
          subcategory: string | null
          unit: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          badges?: string[]
          category_id: string
          created_at?: string
          description?: string | null
          featured?: boolean
          featured_gradient?: string | null
          id?: string
          image_path?: string | null
          long_description?: string | null
          name: string
          original_price?: string | null
          position: number
          price?: string | null
          slug: string
          subcategory?: string | null
          unit?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          badges?: string[]
          category_id?: string
          created_at?: string
          description?: string | null
          featured?: boolean
          featured_gradient?: string | null
          id?: string
          image_path?: string | null
          long_description?: string | null
          name?: string
          original_price?: string | null
          position?: number
          price?: string | null
          slug?: string
          subcategory?: string | null
          unit?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "dishes_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      executivo_items: {
        Row: {
          description: string
          executivo_id: string
          id: string
          kind: string
          name: string
          position: number
          price: string | null
        }
        Insert: {
          description: string
          executivo_id: string
          id?: string
          kind: string
          name: string
          position: number
          price?: string | null
        }
        Update: {
          description?: string
          executivo_id?: string
          id?: string
          kind?: string
          name?: string
          position?: number
          price?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "executivo_items_executivo_id_fkey"
            columns: ["executivo_id"]
            isOneToOne: false
            referencedRelation: "executivo_menus"
            referencedColumns: ["id"]
          },
        ]
      }
      executivo_menus: {
        Row: {
          active: boolean
          category_id: string
          description: string
          format: string
          id: string
          name: string
          position: number
          price: string
          subcategory: string | null
          validity: string | null
        }
        Insert: {
          active?: boolean
          category_id: string
          description: string
          format: string
          id?: string
          name: string
          position: number
          price: string
          subcategory?: string | null
          validity?: string | null
        }
        Update: {
          active?: boolean
          category_id?: string
          description?: string
          format?: string
          id?: string
          name?: string
          position?: number
          price?: string
          subcategory?: string | null
          validity?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "executivo_menus_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      decrement_dish_like: { Args: { p_dish_id: string }; Returns: number }
      increment_dish_like: { Args: { p_dish_id: string }; Returns: number }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
