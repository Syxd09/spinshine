export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15";
  };
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: string;
          full_name: string | null;
          phone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role?: string;
          full_name?: string | null;
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          role?: string;
          full_name?: string | null;
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      services: {
        Row: {
          id: string;
          key: string;
          name: string;
          unit: string;
          rate: number;
          description: string | null;
          onsite_only: boolean;
          active: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          key: string;
          name: string;
          unit: string;
          rate?: number;
          description?: string | null;
          onsite_only?: boolean;
          active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          key?: string;
          name?: string;
          unit?: string;
          rate?: number;
          description?: string | null;
          onsite_only?: boolean;
          active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      localities: {
        Row: {
          id: string;
          name: string;
          km: number;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          km?: number;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          km?: number;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      settings: {
        Row: {
          key: string;
          value: Json;
          updated_at: string;
        };
        Insert: {
          key: string;
          value: Json;
          updated_at?: string;
        };
        Update: {
          key?: string;
          value?: Json;
          updated_at?: string;
        };
        Relationships: [];
      };
      cms_content: {
        Row: {
          section: string;
          key: string;
          value: Json;
          updated_at: string;
        };
        Insert: {
          section: string;
          key: string;
          value: Json;
          updated_at?: string;
        };
        Update: {
          section?: string;
          key?: string;
          value?: Json;
          updated_at?: string;
        };
        Relationships: [];
      };
      blocked_dates: {
        Row: {
          blocked_on: string;
          created_at: string;
          id: string;
          reason: string | null;
        };
        Insert: {
          blocked_on: string;
          created_at?: string;
          id?: string;
          reason?: string | null;
        };
        Update: {
          blocked_on?: string;
          created_at?: string;
          id?: string;
          reason?: string | null;
        };
        Relationships: [];
      };
      bookings: {
        Row: {
          address: string;
          assigned_driver_id: string | null;
          assigned_technician_id: string | null;
          cancellation_reason: string | null;
          created_at: string;
          customer_id: string | null;
          customer_name: string;
          delivery_date: string | null;
          delivery_slot: string | null;
          email: string | null;
          estimated_price: number;
          id: string;
          landmark: string | null;
          line_items: Json;
          mode: string;
          notes: string | null;
          order_ref: string;
          payment_method: string;
          phone: string;
          pickup_date: string;
          pickup_slot: string;
          qty: number;
          service: string;
          status: string;
          status_history: Json;
          updated_at: string;
        };
        Insert: {
          address: string;
          assigned_driver_id?: string | null;
          assigned_technician_id?: string | null;
          cancellation_reason?: string | null;
          created_at?: string;
          customer_id?: string | null;
          customer_name: string;
          delivery_date?: string | null;
          delivery_slot?: string | null;
          email?: string | null;
          estimated_price?: number;
          id?: string;
          landmark?: string | null;
          line_items?: Json;
          mode?: string;
          notes?: string | null;
          order_ref: string;
          payment_method?: string;
          phone: string;
          pickup_date: string;
          pickup_slot: string;
          qty?: number;
          service: string;
          status?: string;
          status_history?: Json;
          updated_at?: string;
        };
        Update: {
          address?: string;
          assigned_driver_id?: string | null;
          assigned_technician_id?: string | null;
          cancellation_reason?: string | null;
          created_at?: string;
          customer_id?: string | null;
          customer_name?: string;
          delivery_date?: string | null;
          delivery_slot?: string | null;
          email?: string | null;
          estimated_price?: number;
          id?: string;
          landmark?: string | null;
          line_items?: Json;
          mode?: string;
          notes?: string | null;
          order_ref?: string;
          payment_method?: string;
          phone?: string;
          pickup_date?: string;
          pickup_slot?: string;
          qty?: number;
          service?: string;
          status?: string;
          status_history?: Json;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      current_role: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      slot_availability: {
        Args: { _date: string; _mode?: string };
        Returns: {
          remaining: number;
          slot: string;
        }[];
      };
      track_booking: {
        Args: { _order_ref: string; _phone: string };
        Returns: {
          created_at: string;
          delivery_date: string;
          delivery_slot: string;
          estimated_price: number;
          mode: string;
          order_ref: string;
          pickup_date: string;
          pickup_slot: string;
          service: string;
          status: string;
        }[];
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
