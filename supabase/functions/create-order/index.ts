import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      customer_name,
      customer_email,
      customer_phone,
      shipping_address,
      city,
      notes,
      items,
      shipping_fee = 0
    } = await req.json();

    console.log("Creating order for:", customer_email);

    // Validate input
    if (!customer_name || !customer_email || !customer_phone || !shipping_address || !city || !items || items.length === 0) {
      throw new Error("بيانات غير صالحة");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Calculate total
    const subtotal = items.reduce((sum: number, item: any) => 
      sum + (item.price * item.quantity), 0
    );
    const total_amount = subtotal + shipping_fee;

    // Generate order number
    const order_number = `SG-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create order
    const { data: order, error: orderError } = await supabaseClient
      .from("orders")
      .insert({
        order_number,
        customer_name,
        customer_email,
        customer_phone,
        shipping_address,
        city,
        notes,
        total_amount,
        shipping_fee,
        status: "pending",
        payment_status: "pending",
      })
      .select()
      .single();

    if (orderError) throw orderError;

    console.log("Order created:", order.id);

    // Create order items
    const orderItems = items.map((item: any) => ({
      order_id: order.id,
      product_id: item.id,
      product_name: item.name_ar,
      quantity: item.quantity,
      unit_price: item.price,
      total_price: item.price * item.quantity,
    }));

    const { error: itemsError } = await supabaseClient
      .from("order_items")
      .insert(orderItems);

    if (itemsError) throw itemsError;

    // Create Stripe payment intent
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total_amount * 100), // Convert to cents
      currency: "sar", // Saudi Riyal
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        order_id: order.id,
        order_number: order.order_number,
        customer_email: customer_email,
      },
      receipt_email: customer_email,
    });

    // Update order with Stripe payment ID
    await supabaseClient
      .from("orders")
      .update({ stripe_payment_id: paymentIntent.id })
      .eq("id", order.id);

    console.log("Payment intent created:", paymentIntent.id);

    return new Response(
      JSON.stringify({
        order_id: order.id,
        order_number: order.order_number,
        client_secret: paymentIntent.client_secret,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error creating order:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
