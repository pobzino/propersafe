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
      cases: {
        Row: {
          ai_package_recommendation: string | null
          case_ref: string
          client_concern: string | null
          client_id: string | null
          coordinator_id: string | null
          created_at: string | null
          deadline: string | null
          id: string
          intake_notes: string | null
          internal_notes: string | null
          payment_amount: number | null
          payment_status: string | null
          property_location: string | null
          property_type: string | null
          service_type: string
          status: string
          stripe_payment_intent: string | null
          updated_at: string | null
        }
        Insert: {
          ai_package_recommendation?: string | null
          case_ref: string
          client_concern?: string | null
          client_id?: string | null
          coordinator_id?: string | null
          created_at?: string | null
          deadline?: string | null
          id?: string
          intake_notes?: string | null
          internal_notes?: string | null
          payment_amount?: number | null
          payment_status?: string | null
          property_location?: string | null
          property_type?: string | null
          service_type: string
          status?: string
          stripe_payment_intent?: string | null
          updated_at?: string | null
        }
        Update: {
          ai_package_recommendation?: string | null
          case_ref?: string
          client_concern?: string | null
          client_id?: string | null
          coordinator_id?: string | null
          created_at?: string | null
          deadline?: string | null
          id?: string
          intake_notes?: string | null
          internal_notes?: string | null
          payment_amount?: number | null
          payment_status?: string | null
          property_location?: string | null
          property_type?: string | null
          service_type?: string
          status?: string
          stripe_payment_intent?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cases_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cases_coordinator_id_fkey"
            columns: ["coordinator_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
        ]
      }
      checks: {
        Row: {
          assigned_to: string | null
          blocked_reason: string | null
          brief_sent_at: string | null
          case_id: string | null
          check_type: string
          created_at: string | null
          due_date: string | null
          findings: string | null
          findings_doc_path: string | null
          id: string
          status: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          blocked_reason?: string | null
          brief_sent_at?: string | null
          case_id?: string | null
          check_type: string
          created_at?: string | null
          due_date?: string | null
          findings?: string | null
          findings_doc_path?: string | null
          id?: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          blocked_reason?: string | null
          brief_sent_at?: string | null
          case_id?: string | null
          check_type?: string
          created_at?: string | null
          due_date?: string | null
          findings?: string | null
          findings_doc_path?: string | null
          id?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "checks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checks_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          created_at: string | null
          email: string
          id: string
          location: string | null
          name: string
          notes: string | null
          whatsapp: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          location?: string | null
          name: string
          notes?: string | null
          whatsapp?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          location?: string | null
          name?: string
          notes?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      documents: {
        Row: {
          case_id: string | null
          created_at: string | null
          doc_type: string | null
          file_name: string
          file_path: string
          id: string
          notes: string | null
          uploaded_by: string | null
        }
        Insert: {
          case_id?: string | null
          created_at?: string | null
          doc_type?: string | null
          file_name: string
          file_path: string
          id?: string
          notes?: string | null
          uploaded_by?: string | null
        }
        Update: {
          case_id?: string | null
          created_at?: string | null
          doc_type?: string | null
          file_name?: string
          file_path?: string
          id?: string
          notes?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      enquiries: {
        Row: {
          based: string | null
          created_at: string | null
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          location: string | null
          service: string | null
          situation: string | null
          urgency: string | null
          whatsapp: string | null
        }
        Insert: {
          based?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          location?: string | null
          service?: string | null
          situation?: string | null
          urgency?: string | null
          whatsapp?: string | null
        }
        Update: {
          based?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          location?: string | null
          service?: string | null
          situation?: string | null
          urgency?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      professionals: {
        Row: {
          active: boolean | null
          created_at: string | null
          email: string | null
          id: string
          name: string
          notes: string | null
          specialism: string
          whatsapp: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          specialism: string
          whatsapp?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          specialism?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      reports: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          case_id: string | null
          created_at: string | null
          delivered_at: string | null
          draft_content: string | null
          drafted_at: string | null
          final_content: string | null
          id: string
          pdf_path: string | null
          verdict: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          case_id?: string | null
          created_at?: string | null
          delivered_at?: string | null
          draft_content?: string | null
          drafted_at?: string | null
          final_content?: string | null
          id?: string
          pdf_path?: string | null
          verdict?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          case_id?: string | null
          created_at?: string | null
          delivered_at?: string | null
          draft_content?: string | null
          drafted_at?: string | null
          final_content?: string | null
          id?: string
          pdf_path?: string | null
          verdict?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reports_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      status_updates: {
        Row: {
          actor_id: string | null
          case_id: string | null
          created_at: string | null
          id: string
          message_sent: string | null
          new_status: string
          notes: string | null
          old_status: string | null
          triggered_by: string | null
        }
        Insert: {
          actor_id?: string | null
          case_id?: string | null
          created_at?: string | null
          id?: string
          message_sent?: string | null
          new_status: string
          notes?: string | null
          old_status?: string | null
          triggered_by?: string | null
        }
        Update: {
          actor_id?: string | null
          case_id?: string | null
          created_at?: string | null
          id?: string
          message_sent?: string | null
          new_status?: string
          notes?: string | null
          old_status?: string | null
          triggered_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "status_updates_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
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
