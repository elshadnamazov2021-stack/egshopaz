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
      ad_packages: {
        Row: {
          banner_slots: number
          color: string
          created_at: string
          duration_days: number
          features: Json
          id: string
          is_active: boolean
          name: string
          price: number
          sort_order: number
          sponsored_product_slots: number
          tier: string
        }
        Insert: {
          banner_slots?: number
          color?: string
          created_at?: string
          duration_days?: number
          features?: Json
          id?: string
          is_active?: boolean
          name: string
          price: number
          sort_order?: number
          sponsored_product_slots?: number
          tier: string
        }
        Update: {
          banner_slots?: number
          color?: string
          created_at?: string
          duration_days?: number
          features?: Json
          id?: string
          is_active?: boolean
          name?: string
          price?: number
          sort_order?: number
          sponsored_product_slots?: number
          tier?: string
        }
        Relationships: []
      }
      addresses: {
        Row: {
          apartment: string | null
          city: string
          created_at: string
          id: string
          is_default: boolean
          notes: string | null
          phone: string
          recipient_name: string
          street: string
          title: string
          user_id: string
        }
        Insert: {
          apartment?: string | null
          city: string
          created_at?: string
          id?: string
          is_default?: boolean
          notes?: string | null
          phone: string
          recipient_name: string
          street: string
          title?: string
          user_id: string
        }
        Update: {
          apartment?: string | null
          city?: string
          created_at?: string
          id?: string
          is_default?: boolean
          notes?: string | null
          phone?: string
          recipient_name?: string
          street?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      banners: {
        Row: {
          clicks: number
          created_at: string
          ends_at: string | null
          id: string
          image_url: string | null
          impressions: number
          is_active: boolean
          link_url: string | null
          position: string
          seller_id: string | null
          starts_at: string | null
          subscription_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          clicks?: number
          created_at?: string
          ends_at?: string | null
          id?: string
          image_url?: string | null
          impressions?: number
          is_active?: boolean
          link_url?: string | null
          position?: string
          seller_id?: string | null
          starts_at?: string | null
          subscription_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          clicks?: number
          created_at?: string
          ends_at?: string | null
          id?: string
          image_url?: string | null
          impressions?: number
          is_active?: boolean
          link_url?: string | null
          position?: string
          seller_id?: string | null
          starts_at?: string | null
          subscription_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      bonus_transactions: {
        Row: {
          amount: number
          created_at: string
          id: string
          order_id: string | null
          reason: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          order_id?: string | null
          reason: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          order_id?: string | null
          reason?: string
          user_id?: string
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          created_at: string
          id: string
          product_id: string
          quantity: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          quantity?: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          quantity?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          icon: string | null
          id: string
          name: string
          parent_id: string | null
          slug: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          icon?: string | null
          id?: string
          name: string
          parent_id?: string | null
          slug: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          icon?: string | null
          id?: string
          name?: string
          parent_id?: string | null
          slug?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      couriers: {
        Row: {
          city: string
          created_at: string
          current_route: string | null
          earnings: number
          full_name: string
          id: string
          is_active: boolean
          phone: string
          rating: number
          total_deliveries: number
          updated_at: string
          user_id: string | null
          vehicle_type: string
        }
        Insert: {
          city?: string
          created_at?: string
          current_route?: string | null
          earnings?: number
          full_name: string
          id?: string
          is_active?: boolean
          phone: string
          rating?: number
          total_deliveries?: number
          updated_at?: string
          user_id?: string | null
          vehicle_type?: string
        }
        Update: {
          city?: string
          created_at?: string
          current_route?: string | null
          earnings?: number
          full_name?: string
          id?: string
          is_active?: boolean
          phone?: string
          rating?: number
          total_deliveries?: number
          updated_at?: string
          user_id?: string | null
          vehicle_type?: string
        }
        Relationships: []
      }
      dispute_messages: {
        Row: {
          body: string
          created_at: string
          dispute_id: string
          id: string
          sender_id: string
          sender_role: string
        }
        Insert: {
          body: string
          created_at?: string
          dispute_id: string
          id?: string
          sender_id: string
          sender_role: string
        }
        Update: {
          body?: string
          created_at?: string
          dispute_id?: string
          id?: string
          sender_id?: string
          sender_role?: string
        }
        Relationships: []
      }
      disputes: {
        Row: {
          buyer_id: string
          compensation: number | null
          created_at: string
          decided_for: string | null
          description: string | null
          id: string
          order_id: string | null
          order_item_id: string | null
          reason: string
          resolution: string | null
          seller_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          buyer_id: string
          compensation?: number | null
          created_at?: string
          decided_for?: string | null
          description?: string | null
          id?: string
          order_id?: string | null
          order_item_id?: string | null
          reason: string
          resolution?: string | null
          seller_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          buyer_id?: string
          compensation?: number | null
          created_at?: string
          decided_for?: string | null
          description?: string | null
          id?: string
          order_id?: string | null
          order_item_id?: string | null
          reason?: string
          resolution?: string | null
          seller_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      favorites: {
        Row: {
          created_at: string
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string
          created_at: string
          id: string
          is_read: boolean
          link: string | null
          order_id: string | null
          order_item_id: string | null
          pickup_code: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          order_id?: string | null
          order_item_id?: string | null
          pickup_code?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          order_id?: string | null
          order_item_id?: string | null
          pickup_code?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          accepted_at: string | null
          delivered_at: string | null
          id: string
          image_url: string | null
          order_id: string
          pickup_code: string | null
          pickup_point_id: string | null
          price: number
          product_id: string
          quantity: number
          seller_id: string
          status: string
          title: string
        }
        Insert: {
          accepted_at?: string | null
          delivered_at?: string | null
          id?: string
          image_url?: string | null
          order_id: string
          pickup_code?: string | null
          pickup_point_id?: string | null
          price: number
          product_id: string
          quantity: number
          seller_id: string
          status?: string
          title: string
        }
        Update: {
          accepted_at?: string | null
          delivered_at?: string | null
          id?: string
          image_url?: string | null
          order_id?: string
          pickup_code?: string | null
          pickup_point_id?: string | null
          price?: number
          product_id?: string
          quantity?: number
          seller_id?: string
          status?: string
          title?: string
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
          bonus_earned: number
          bonus_used: number
          buyer_id: string
          created_at: string
          discount: number
          id: string
          payment_method: string
          pickup_point_id: string | null
          promo_code: string | null
          recipient_name: string | null
          recipient_phone: string | null
          shipping_address: string | null
          status: Database["public"]["Enums"]["order_status"]
          total: number
        }
        Insert: {
          bonus_earned?: number
          bonus_used?: number
          buyer_id: string
          created_at?: string
          discount?: number
          id?: string
          payment_method?: string
          pickup_point_id?: string | null
          promo_code?: string | null
          recipient_name?: string | null
          recipient_phone?: string | null
          shipping_address?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          total: number
        }
        Update: {
          bonus_earned?: number
          bonus_used?: number
          buyer_id?: string
          created_at?: string
          discount?: number
          id?: string
          payment_method?: string
          pickup_point_id?: string | null
          promo_code?: string | null
          recipient_name?: string | null
          recipient_phone?: string | null
          shipping_address?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          total?: number
        }
        Relationships: []
      }
      payment_transactions: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          method: string
          seller_id: string
          status: string
          subscription_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          method?: string
          seller_id: string
          status?: string
          subscription_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          method?: string
          seller_id?: string
          status?: string
          subscription_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_transactions_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "seller_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      pickup_points: {
        Row: {
          address: string
          city: string
          created_at: string
          id: string
          is_active: boolean
          lat: number | null
          lng: number | null
          name: string
          phone: string | null
          working_hours: string
        }
        Insert: {
          address: string
          city: string
          created_at?: string
          id?: string
          is_active?: boolean
          lat?: number | null
          lng?: number | null
          name: string
          phone?: string | null
          working_hours?: string
        }
        Update: {
          address?: string
          city?: string
          created_at?: string
          id?: string
          is_active?: boolean
          lat?: number | null
          lng?: number | null
          name?: string
          phone?: string | null
          working_hours?: string
        }
        Relationships: []
      }
      price_alerts: {
        Row: {
          created_at: string
          id: string
          product_id: string
          target_price: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          target_price: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          target_price?: number
          user_id?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          brand: string | null
          category_id: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          images: string[]
          is_active: boolean
          old_price: number | null
          price: number
          rating: number
          reviews_count: number
          seller_id: string
          sku: string | null
          stock: number
          title: string
          updated_at: string
          weight: number | null
        }
        Insert: {
          brand?: string | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          images?: string[]
          is_active?: boolean
          old_price?: number | null
          price: number
          rating?: number
          reviews_count?: number
          seller_id: string
          sku?: string | null
          stock?: number
          title: string
          updated_at?: string
          weight?: number | null
        }
        Update: {
          brand?: string | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          images?: string[]
          is_active?: boolean
          old_price?: number | null
          price?: number
          rating?: number
          reviews_count?: number
          seller_id?: string
          sku?: string | null
          stock?: number
          title?: string
          updated_at?: string
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bonus_balance: number
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          shop_address: string | null
          shop_banner_url: string | null
          shop_city: string | null
          shop_description: string | null
          shop_email: string | null
          shop_logo_url: string | null
          shop_name: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bonus_balance?: number
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
          shop_address?: string | null
          shop_banner_url?: string | null
          shop_city?: string | null
          shop_description?: string | null
          shop_email?: string | null
          shop_logo_url?: string | null
          shop_name?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bonus_balance?: number
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          shop_address?: string | null
          shop_banner_url?: string | null
          shop_city?: string | null
          shop_description?: string | null
          shop_email?: string | null
          shop_logo_url?: string | null
          shop_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      promo_codes: {
        Row: {
          code: string
          created_at: string
          discount_amount: number | null
          discount_percent: number | null
          expires_at: string | null
          id: string
          is_active: boolean
          min_order: number
          usage_limit: number | null
          used_count: number
        }
        Insert: {
          code: string
          created_at?: string
          discount_amount?: number | null
          discount_percent?: number | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          min_order?: number
          usage_limit?: number | null
          used_count?: number
        }
        Update: {
          code?: string
          created_at?: string
          discount_amount?: number | null
          discount_percent?: number | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          min_order?: number
          usage_limit?: number | null
          used_count?: number
        }
        Relationships: []
      }
      pvz_messages: {
        Row: {
          body: string
          buyer_id: string
          created_at: string
          id: string
          order_id: string
          order_item_id: string | null
          pickup_point_id: string
          read_at: string | null
          sender_id: string | null
          sender_role: string
        }
        Insert: {
          body: string
          buyer_id: string
          created_at?: string
          id?: string
          order_id: string
          order_item_id?: string | null
          pickup_point_id: string
          read_at?: string | null
          sender_id?: string | null
          sender_role: string
        }
        Update: {
          body?: string
          buyer_id?: string
          created_at?: string
          id?: string
          order_id?: string
          order_item_id?: string | null
          pickup_point_id?: string
          read_at?: string | null
          sender_id?: string | null
          sender_role?: string
        }
        Relationships: []
      }
      pvz_notifications: {
        Row: {
          body: string
          created_at: string
          id: string
          is_read: boolean
          order_id: string | null
          order_item_id: string | null
          pickup_code: string | null
          pickup_point_id: string
          title: string
          type: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          is_read?: boolean
          order_id?: string | null
          order_item_id?: string | null
          pickup_code?: string | null
          pickup_point_id: string
          title: string
          type?: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          is_read?: boolean
          order_id?: string | null
          order_item_id?: string | null
          pickup_code?: string | null
          pickup_point_id?: string
          title?: string
          type?: string
        }
        Relationships: []
      }
      pvz_staff: {
        Row: {
          created_at: string
          full_name: string
          id: string
          is_active: boolean
          phone: string
          pickup_point_id: string | null
          position: string
        }
        Insert: {
          created_at?: string
          full_name: string
          id?: string
          is_active?: boolean
          phone: string
          pickup_point_id?: string | null
          position?: string
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: string
          is_active?: boolean
          phone?: string
          pickup_point_id?: string | null
          position?: string
        }
        Relationships: [
          {
            foreignKeyName: "pvz_staff_pickup_point_id_fkey"
            columns: ["pickup_point_id"]
            isOneToOne: false
            referencedRelation: "pickup_points"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          images: string[]
          product_id: string
          rating: number
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          images?: string[]
          product_id: string
          rating: number
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          images?: string[]
          product_id?: string
          rating?: number
          user_id?: string
        }
        Relationships: []
      }
      seller_subscriptions: {
        Row: {
          amount: number
          created_at: string
          ends_at: string
          id: string
          is_active: boolean
          package_id: string
          payment_method: string
          payment_status: string
          seller_id: string
          starts_at: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          ends_at: string
          id?: string
          is_active?: boolean
          package_id: string
          payment_method?: string
          payment_status?: string
          seller_id: string
          starts_at?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          ends_at?: string
          id?: string
          is_active?: boolean
          package_id?: string
          payment_method?: string
          payment_status?: string
          seller_id?: string
          starts_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "seller_subscriptions_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "ad_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      shop_messages: {
        Row: {
          body: string
          buyer_id: string
          created_at: string
          id: string
          order_id: string | null
          product_id: string | null
          read_at: string | null
          seller_id: string
          sender_role: string
        }
        Insert: {
          body: string
          buyer_id: string
          created_at?: string
          id?: string
          order_id?: string | null
          product_id?: string | null
          read_at?: string | null
          seller_id: string
          sender_role: string
        }
        Update: {
          body?: string
          buyer_id?: string
          created_at?: string
          id?: string
          order_id?: string | null
          product_id?: string | null
          read_at?: string | null
          seller_id?: string
          sender_role?: string
        }
        Relationships: []
      }
      sponsored_products: {
        Row: {
          clicks: number
          created_at: string
          ends_at: string
          id: string
          impressions: number
          is_active: boolean
          position: string
          product_id: string
          seller_id: string
          subscription_id: string | null
        }
        Insert: {
          clicks?: number
          created_at?: string
          ends_at: string
          id?: string
          impressions?: number
          is_active?: boolean
          position?: string
          product_id: string
          seller_id: string
          subscription_id?: string | null
        }
        Update: {
          clicks?: number
          created_at?: string
          ends_at?: string
          id?: string
          impressions?: number
          is_active?: boolean
          position?: string
          product_id?: string
          seller_id?: string
          subscription_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sponsored_products_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "seller_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          admin_reply: string | null
          category: string
          created_at: string
          id: string
          message: string
          order_id: string | null
          status: string
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_reply?: string | null
          category?: string
          created_at?: string
          id?: string
          message: string
          order_id?: string | null
          status?: string
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_reply?: string | null
          category?: string
          created_at?: string
          id?: string
          message?: string
          order_id?: string | null
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          bonus_earn_percent: number
          bonus_to_azn: number
          commission_percent: number
          delivery_base_fee: number
          id: string
          maintenance_mode: boolean
          min_payout: number
          storage_fee_per_day: number
          updated_at: string
        }
        Insert: {
          bonus_earn_percent?: number
          bonus_to_azn?: number
          commission_percent?: number
          delivery_base_fee?: number
          id?: string
          maintenance_mode?: boolean
          min_payout?: number
          storage_fee_per_day?: number
          updated_at?: string
        }
        Update: {
          bonus_earn_percent?: number
          bonus_to_azn?: number
          commission_percent?: number
          delivery_base_fee?: number
          id?: string
          maintenance_mode?: boolean
          min_payout?: number
          storage_fee_per_day?: number
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      warehouses: {
        Row: {
          address: string
          capacity: number
          city: string
          created_at: string
          id: string
          is_active: boolean
          manager_name: string | null
          name: string
          occupied: number
          phone: string | null
          updated_at: string
        }
        Insert: {
          address: string
          capacity?: number
          city: string
          created_at?: string
          id?: string
          is_active?: boolean
          manager_name?: string | null
          name: string
          occupied?: number
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string
          capacity?: number
          city?: string
          created_at?: string
          id?: string
          is_active?: boolean
          manager_name?: string | null
          name?: string
          occupied?: number
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      become_seller: { Args: { _shop_name: string }; Returns: undefined }
      get_owner_admin_id: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "seller" | "buyer"
      order_status:
        | "pending"
        | "paid"
        | "packed"
        | "shipped"
        | "delivered"
        | "cancelled"
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
      app_role: ["admin", "seller", "buyer"],
      order_status: [
        "pending",
        "paid",
        "packed",
        "shipped",
        "delivered",
        "cancelled",
      ],
    },
  },
} as const
