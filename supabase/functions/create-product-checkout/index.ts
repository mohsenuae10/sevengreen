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

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    const { productId, quantity = 1, customerInfo } = await req.json();
    
    if (!productId) {
      throw new Error("Product ID is required");
    }

    if (!customerInfo || !customerInfo.customer_name || !customerInfo.customer_email) {
      throw new Error("Customer information is required");
    }

    // جلب بيانات المنتج
    const { data: product, error: productError } = await supabaseClient
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (productError || !product) {
      throw new Error("Product not found");
    }

    // التحقق من المخزون
    if (product.stock_quantity < quantity) {
      throw new Error("Not enough stock available");
    }

    // التحقق من المستخدم (اختياري للدفع كضيف)
    let userEmail: string | undefined;
    const authHeader = req.headers.get("Authorization");
    
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data } = await supabaseClient.auth.getUser(token);
      userEmail = data.user?.email;
    }

    // تهيئة Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // البحث عن عميل موجود أو إنشاء جديد
    let customerId: string | undefined;
    const customers = await stripe.customers.list({ email: customerInfo.customer_email, limit: 1 });
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    // تحويل السعر إلى سنت (Stripe يستخدم أصغر وحدة عملة)
    const unitAmount = Math.round(Number(product.price) * 100);

    // إنشاء جلسة دفع
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : customerInfo.customer_email,
      line_items: [
        {
          price_data: {
            currency: "sar",
            product_data: {
              name: product.name_ar,
              description: product.description_ar || undefined,
              images: product.image_url ? [product.image_url] : undefined,
            },
            unit_amount: unitAmount,
          },
          quantity: quantity,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/order-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/product/${productId}`,
      metadata: {
        product_id: productId,
        quantity: quantity.toString(),
        customer_name: customerInfo.customer_name,
        customer_phone: customerInfo.customer_phone,
        city: customerInfo.city,
        shipping_address: customerInfo.shipping_address,
      },
      payment_intent_data: {
        metadata: {
          product_id: productId,
          product_name: product.name_ar,
          quantity: quantity.toString(),
          customer_name: customerInfo.customer_name,
          customer_phone: customerInfo.customer_phone,
          city: customerInfo.city,
          shipping_address: customerInfo.shipping_address,
        },
      },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Checkout error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "فشل إنشاء جلسة الدفع" 
      }), 
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
