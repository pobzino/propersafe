export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      clients: {
        Row: {
          id: string;
          created_at: string;
          name: string;
          email: string;
          whatsapp: string | null;
          location: string | null;
          notes: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          name: string;
          email: string;
          whatsapp?: string | null;
          location?: string | null;
          notes?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          name?: string;
          email?: string;
          whatsapp?: string | null;
          location?: string | null;
          notes?: string | null;
        };
      };
      professionals: {
        Row: {
          id: string;
          created_at: string;
          name: string;
          specialism: string;
          email: string | null;
          whatsapp: string | null;
          active: boolean;
          notes: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          name: string;
          specialism: string;
          email?: string | null;
          whatsapp?: string | null;
          active?: boolean;
          notes?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          name?: string;
          specialism?: string;
          email?: string | null;
          whatsapp?: string | null;
          active?: boolean;
          notes?: string | null;
        };
      };
      cases: {
        Row: {
          id: string;
          created_at: string;
          case_ref: string;
          client_id: string | null;
          coordinator_id: string | null;
          service_type: string;
          property_location: string | null;
          property_type: string | null;
          status: string;
          payment_status: string | null;
          payment_amount: number | null;
          stripe_payment_intent: string | null;
          deadline: string | null;
          intake_notes: string | null;
          client_concern: string | null;
          ai_package_recommendation: string | null;
          internal_notes: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          case_ref: string;
          client_id?: string | null;
          coordinator_id?: string | null;
          service_type: string;
          property_location?: string | null;
          property_type?: string | null;
          status?: string;
          payment_status?: string | null;
          payment_amount?: number | null;
          stripe_payment_intent?: string | null;
          deadline?: string | null;
          intake_notes?: string | null;
          client_concern?: string | null;
          ai_package_recommendation?: string | null;
          internal_notes?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          case_ref?: string;
          client_id?: string | null;
          coordinator_id?: string | null;
          service_type?: string;
          property_location?: string | null;
          property_type?: string | null;
          status?: string;
          payment_status?: string | null;
          payment_amount?: number | null;
          stripe_payment_intent?: string | null;
          deadline?: string | null;
          intake_notes?: string | null;
          client_concern?: string | null;
          ai_package_recommendation?: string | null;
          internal_notes?: string | null;
          updated_at?: string;
        };
      };
      checks: {
        Row: {
          id: string;
          created_at: string;
          case_id: string;
          check_type: string;
          status: string;
          assigned_to: string | null;
          brief_sent_at: string | null;
          findings: string | null;
          findings_doc_path: string | null;
          due_date: string | null;
          blocked_reason: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          case_id: string;
          check_type: string;
          status?: string;
          assigned_to?: string | null;
          brief_sent_at?: string | null;
          findings?: string | null;
          findings_doc_path?: string | null;
          due_date?: string | null;
          blocked_reason?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          case_id?: string;
          check_type?: string;
          status?: string;
          assigned_to?: string | null;
          brief_sent_at?: string | null;
          findings?: string | null;
          findings_doc_path?: string | null;
          due_date?: string | null;
          blocked_reason?: string | null;
          updated_at?: string;
        };
      };
      documents: {
        Row: {
          id: string;
          created_at: string;
          case_id: string;
          file_path: string;
          file_name: string;
          doc_type: string | null;
          uploaded_by: string | null;
          notes: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          case_id: string;
          file_path: string;
          file_name: string;
          doc_type?: string | null;
          uploaded_by?: string | null;
          notes?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          case_id?: string;
          file_path?: string;
          file_name?: string;
          doc_type?: string | null;
          uploaded_by?: string | null;
          notes?: string | null;
        };
      };
      status_updates: {
        Row: {
          id: string;
          created_at: string;
          case_id: string;
          old_status: string | null;
          new_status: string;
          triggered_by: string | null;
          actor_id: string | null;
          message_sent: string | null;
          notes: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          case_id: string;
          old_status?: string | null;
          new_status: string;
          triggered_by?: string | null;
          actor_id?: string | null;
          message_sent?: string | null;
          notes?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          case_id?: string;
          old_status?: string | null;
          new_status?: string;
          triggered_by?: string | null;
          actor_id?: string | null;
          message_sent?: string | null;
          notes?: string | null;
        };
      };
      reports: {
        Row: {
          id: string;
          created_at: string;
          case_id: string;
          draft_content: string | null;
          final_content: string | null;
          verdict: string | null;
          pdf_path: string | null;
          drafted_at: string | null;
          approved_at: string | null;
          delivered_at: string | null;
          approved_by: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          case_id: string;
          draft_content?: string | null;
          final_content?: string | null;
          verdict?: string | null;
          pdf_path?: string | null;
          drafted_at?: string | null;
          approved_at?: string | null;
          delivered_at?: string | null;
          approved_by?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          case_id?: string;
          draft_content?: string | null;
          final_content?: string | null;
          verdict?: string | null;
          pdf_path?: string | null;
          drafted_at?: string | null;
          approved_at?: string | null;
          delivered_at?: string | null;
          approved_by?: string | null;
        };
      };
    };
  };
}
