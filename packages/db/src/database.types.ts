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
      admin_audit_log: {
        Row: {
          action: string
          actor_email: string | null
          actor_id: string | null
          created_at: string
          details: Json | null
          entity_id: string | null
          entity_label: string | null
          entity_type: string
          id: string
          restaurant_id: string | null
        }
        Insert: {
          action: string
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_label?: string | null
          entity_type: string
          id?: string
          restaurant_id?: string | null
        }
        Update: {
          action?: string
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_label?: string | null
          entity_type?: string
          id?: string
          restaurant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_audit_log_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_events: {
        Row: {
          category_id: string | null
          created_at: string
          dish_slug: string | null
          event_type: string
          id: string
          is_internal: boolean
          pathname: string | null
          referrer: string | null
          restaurant_id: string
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
          is_internal?: boolean
          pathname?: string | null
          referrer?: string | null
          restaurant_id: string
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
          is_internal?: boolean
          pathname?: string | null
          referrer?: string | null
          restaurant_id?: string
          session_id?: string
          user_agent?: string | null
          visitor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          active: boolean
          blur_data_url: string | null
          created_at: string
          description: string
          detail: string | null
          display_mode: string
          featured: boolean
          full_width: boolean
          gradient: string
          id: string
          image_path: string | null
          item_count: string | null
          name: string
          number: string
          position: number
          restaurant_id: string
          schedule_end: string | null
          schedule_off_days: number[]
          schedule_start: string | null
          short_name: string | null
          slideshow_image_paths: string[]
          slug: string
          subcategories: string[]
          subcategory_display_modes: Json
          updated_at: string
        }
        Insert: {
          active?: boolean
          blur_data_url?: string | null
          created_at?: string
          description: string
          detail?: string | null
          display_mode?: string
          featured?: boolean
          full_width?: boolean
          gradient: string
          id?: string
          image_path?: string | null
          item_count?: string | null
          name: string
          number: string
          position: number
          restaurant_id: string
          schedule_end?: string | null
          schedule_off_days?: number[]
          schedule_start?: string | null
          short_name?: string | null
          slideshow_image_paths?: string[]
          slug: string
          subcategories?: string[]
          subcategory_display_modes?: Json
          updated_at?: string
        }
        Update: {
          active?: boolean
          blur_data_url?: string | null
          created_at?: string
          description?: string
          detail?: string | null
          display_mode?: string
          featured?: boolean
          full_width?: boolean
          gradient?: string
          id?: string
          image_path?: string | null
          item_count?: string | null
          name?: string
          number?: string
          position?: number
          restaurant_id?: string
          schedule_end?: string | null
          schedule_off_days?: number[]
          schedule_start?: string | null
          short_name?: string | null
          slideshow_image_paths?: string[]
          slug?: string
          subcategories?: string[]
          subcategory_display_modes?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      dish_components: {
        Row: {
          child_dish_id: string
          created_at: string
          id: string
          kind: string
          parent_dish_id: string
          position: number
        }
        Insert: {
          child_dish_id: string
          created_at?: string
          id?: string
          kind: string
          parent_dish_id: string
          position?: number
        }
        Update: {
          child_dish_id?: string
          created_at?: string
          id?: string
          kind?: string
          parent_dish_id?: string
          position?: number
        }
        Relationships: [
          {
            foreignKeyName: "dish_components_child_dish_id_fkey"
            columns: ["child_dish_id"]
            isOneToOne: false
            referencedRelation: "dishes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dish_components_parent_dish_id_fkey"
            columns: ["parent_dish_id"]
            isOneToOne: false
            referencedRelation: "dishes"
            referencedColumns: ["id"]
          },
        ]
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
          blur_data_url: string | null
          category_id: string
          created_at: string
          description: string | null
          featured: boolean
          featured_gradient: string | null
          id: string
          image_path: string | null
          is_component_only: boolean
          long_description: string | null
          name: string
          original_price: string | null
          position: number
          price: string | null
          restaurant_id: string
          schedule_end: string | null
          schedule_off_days: number[]
          schedule_start: string | null
          slug: string
          subcategory: string | null
          unit: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          badges?: string[]
          blur_data_url?: string | null
          category_id: string
          created_at?: string
          description?: string | null
          featured?: boolean
          featured_gradient?: string | null
          id?: string
          image_path?: string | null
          is_component_only?: boolean
          long_description?: string | null
          name: string
          original_price?: string | null
          position: number
          price?: string | null
          restaurant_id: string
          schedule_end?: string | null
          schedule_off_days?: number[]
          schedule_start?: string | null
          slug: string
          subcategory?: string | null
          unit?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          badges?: string[]
          blur_data_url?: string | null
          category_id?: string
          created_at?: string
          description?: string | null
          featured?: boolean
          featured_gradient?: string | null
          id?: string
          image_path?: string | null
          is_component_only?: boolean
          long_description?: string | null
          name?: string
          original_price?: string | null
          position?: number
          price?: string | null
          restaurant_id?: string
          schedule_end?: string | null
          schedule_off_days?: number[]
          schedule_start?: string | null
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
          {
            foreignKeyName: "dishes_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      linktree_buttons: {
        Row: {
          active: boolean
          child_slug: string | null
          created_at: string
          href: string | null
          id: string
          label: string
          parent_id: string | null
          position: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          child_slug?: string | null
          created_at?: string
          href?: string | null
          id?: string
          label: string
          parent_id?: string | null
          position?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          child_slug?: string | null
          created_at?: string
          href?: string | null
          id?: string
          label?: string
          parent_id?: string | null
          position?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "linktree_buttons_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "linktree_buttons"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurants: {
        Row: {
          active: boolean
          announcement_active: boolean
          announcement_image_path: string | null
          created_at: string
          id: string
          likes_enabled: boolean
          name: string
          position: number
          short_name: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          announcement_active?: boolean
          announcement_image_path?: string | null
          created_at?: string
          id: string
          likes_enabled?: boolean
          name: string
          position?: number
          short_name: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          announcement_active?: boolean
          announcement_image_path?: string | null
          created_at?: string
          id?: string
          likes_enabled?: boolean
          name?: string
          position?: number
          short_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          ambience: number | null
          comment: string | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          food: number | null
          id: string
          overall: number
          read_at: string | null
          restaurant_id: string
          service: number | null
          waiter_name: string | null
        }
        Insert: {
          ambience?: number | null
          comment?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          food?: number | null
          id?: string
          overall: number
          read_at?: string | null
          restaurant_id: string
          service?: number | null
          waiter_name?: string | null
        }
        Update: {
          ambience?: number | null
          comment?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          food?: number | null
          id?: string
          overall?: number
          read_at?: string | null
          restaurant_id?: string
          service?: number | null
          waiter_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
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
