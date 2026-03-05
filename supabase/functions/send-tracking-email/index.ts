import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
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
    const { order_id, tracking_number } = await req.json();

    if (!order_id || !tracking_number) {
      throw new Error("Order ID and tracking number are required");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get site settings
    const { data: settings } = await supabaseClient
      .from("site_settings")
      .select("store_name, store_url")
      .single();

    const storeName = settings?.store_name || "لمسة بيوتي";
    const storeUrl = settings?.store_url || "https://lamsetbeauty.com";

    // Get order details
    const { data: order, error: orderError } = await supabaseClient
      .from("orders")
      .select("*")
      .eq("id", order_id)
      .single();

    if (orderError || !order) throw new Error("Order not found");

    // Update tracking number
    await supabaseClient
      .from("orders")
      .update({ 
        tracking_number,
        status: "shipped"
      })
      .eq("id", order_id);

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `لمسة بيوتي - Lamset Beauty <orders@lamsetbeauty.com>`,
        to: [order.customer_email],
        subject: `🚚 شحنة في الطريق إليك! - رقم التتبع: ${tracking_number}`,
        html: `
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Cairo', Arial, sans-serif; }
          </style>
        </head>
        <body style="margin: 0; padding: 20px; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #996B99; margin: 0;">${storeName}</h1>
              <p style="color: #C8A8D4; margin: 5px 0;">
                <a href="${storeUrl}" style="color: #C8A8D4; text-decoration: none;">${storeUrl.replace('https://', '')}</a>
              </p>
            </div>
            
            <h2 style="color: #996B99;">تم شحن طلبك! 📦</h2>
            <p>عزيزي/عزيزتي ${order.customer_name}،</p>
            <p>نود إعلامك بأن طلبك قد تم شحنه وهو في طريقه إليك.</p>
            
            <div style="background-color: #FAF5FB; padding: 20px; border-radius: 8px; margin: 25px 0; border-right: 4px solid #996B99;">
              <h3 style="color: #996B99; margin-top: 0;">رقم التتبع</h3>
              <p style="font-size: 24px; font-weight: bold; color: #996B99; margin: 10px 0; letter-spacing: 1px;">
                ${tracking_number}
              </p>
            </div>

            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #996B99; margin-top: 0;">معلومات الطلب</h3>
              <p><strong>رقم الطلب:</strong> ${order.order_number}</p>
              <p><strong>المبلغ الإجمالي:</strong> ${order.total_amount.toFixed(2)} ريال</p>
            </div>

            <div style="background-color: #F9F3FA; padding: 15px; border-radius: 8px; margin: 20px 0; border-right: 4px solid #C8A8D4;">
              <p style="margin: 0;"><strong>ملاحظة:</strong> يمكنك استخدام رقم التتبع أعلاه لمتابعة حالة الشحنة مع شركة الشحن.</p>
            </div>

            <p style="color: #666; margin-top: 30px;">إذا كان لديك أي استفسار، لا تتردد في التواصل معنا.</p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #999; font-size: 12px;">
              <p>${storeName} - منتجات العناية الطبيعية</p>
              <p><a href="${storeUrl}" style="color: #999; text-decoration: none;">${storeUrl.replace('https://', '')}</a></p>
              <p>© 2025 جميع الحقوق محفوظة</p>
            </div>
          </div>
        </body>
        </html>
        `,
      }),
    });

    const emailData = await emailResponse.json();

    console.log("Tracking email sent to:", order.customer_email);

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error sending tracking email:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
