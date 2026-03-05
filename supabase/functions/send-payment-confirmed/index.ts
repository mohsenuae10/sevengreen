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
    const { order_id } = await req.json();

    if (!order_id) {
      throw new Error("Order ID is required");
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
      .select("*, order_items(*)")
      .eq("id", order_id)
      .single();

    if (orderError || !order) throw new Error("Order not found");

    // Check if payment is actually completed
    if (order.payment_status !== 'completed') {
      return new Response(
        JSON.stringify({ success: false, message: "Payment not completed" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

    const itemsList = order.order_items
      ?.map((item: any) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #eee; font-size: 14px;">${item.product_name}</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center; font-size: 14px;">${item.quantity}</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right; font-size: 14px;">${item.unit_price?.toFixed(2)} ريال</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right; font-size: 14px;">${item.total_price?.toFixed(2)} ريال</td>
        </tr>
      `)
      .join("") || "";

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `لمسة بيوتي <orders@lamsetbeauty.com>`,
        reply_to: 'orders@lamsetbeauty.com',
        to: [order.customer_email],
        subject: `💳 تم تأكيد الدفع بنجاح - طلب رقم ${order.order_number}`,
        headers: {
          'List-Unsubscribe': `<mailto:orders@lamsetbeauty.com>`,
          'X-Priority': '3',
          'X-Entity-Ref-ID': `${order.order_number}-payment`,
          'Precedence': 'bulk',
          'X-Auto-Response-Suppress': 'OOF, AutoReply',
        },
        html: `
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 20px; background-color: #f5f5f5; font-family: Arial, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 25px; padding-bottom: 15px; border-bottom: 2px solid #e0e0e0;">
              <h1 style="color: #996B99; margin: 0; font-size: 28px; font-weight: 600;">${storeName}</h1>
              <p style="color: #C8A8D4; margin: 5px 0;">
                <a href="${storeUrl}" style="color: #C8A8D4; text-decoration: none;">${storeUrl.replace('https://', '')}</a>
              </p>
            </div>

            <!-- Success Icon -->
            <div style="text-align: center; margin: 30px 0;">
              <div style="display: inline-block; width: 80px; height: 80px; background-color: #F0FDF4; border-radius: 50%; line-height: 80px;">
                <span style="font-size: 40px;">💳</span>
              </div>
            </div>

            <h2 style="color: #22C55E; text-align: center; margin: 0 0 20px 0;">تم تأكيد الدفع بنجاح! ✅</h2>

            <!-- Greeting -->
            <p style="color: #333; font-size: 16px; line-height: 1.6;">
              مرحباً <strong>${order.customer_name}</strong>،
            </p>
            
            <p style="color: #555; font-size: 15px; line-height: 1.7;">
              تم استلام الدفع بنجاح لطلبك رقم <strong>${order.order_number}</strong>. سنبدأ في تجهيز طلبك فوراً وسنقوم بإعلامك بكل تحديث.
            </p>

            <!-- Payment Summary -->
            <div style="background-color: #F0FDF4; padding: 20px; border-radius: 8px; margin: 25px 0; border: 1px solid #BBF7D0;">
              <h3 style="color: #15803D; margin: 0 0 15px 0; font-size: 16px;">ملخص الدفع</h3>
              <table style="width: 100%; font-size: 14px;">
                <tr>
                  <td style="padding: 5px 0; color: #555;"><strong>رقم الطلب:</strong></td>
                  <td style="padding: 5px 0; color: #333; text-align: left;">${order.order_number}</td>
                </tr>
                <tr>
                  <td style="padding: 5px 0; color: #555;"><strong>تاريخ الدفع:</strong></td>
                  <td style="padding: 5px 0; color: #333; text-align: left;">${new Date().toLocaleDateString('ar-SA')}</td>
                </tr>
                <tr>
                  <td style="padding: 5px 0; color: #555;"><strong>طريقة الدفع:</strong></td>
                  <td style="padding: 5px 0; color: #333; text-align: left;">بطاقة ائتمان</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0 0 0; color: #15803D; font-size: 18px;"><strong>المبلغ المدفوع:</strong></td>
                  <td style="padding: 8px 0 0 0; color: #15803D; text-align: left; font-size: 18px; font-weight: bold;">${order.total_amount?.toFixed(2)} ريال</td>
                </tr>
              </table>
            </div>

            <!-- Items Table -->
            <h3 style="color: #333; font-size: 16px; margin: 25px 0 15px 0;">تفاصيل الطلب</h3>
            <table style="width: 100%; border-collapse: collapse; margin: 0 0 20px 0;">
              <thead>
                <tr style="background-color: #f5f5f5;">
                  <th style="padding: 12px; text-align: right; border-bottom: 2px solid #ddd; color: #333; font-size: 13px;">المنتج</th>
                  <th style="padding: 12px; text-align: center; border-bottom: 2px solid #ddd; color: #333; font-size: 13px;">الكمية</th>
                  <th style="padding: 12px; text-align: right; border-bottom: 2px solid #ddd; color: #333; font-size: 13px;">السعر</th>
                  <th style="padding: 12px; text-align: right; border-bottom: 2px solid #ddd; color: #333; font-size: 13px;">الإجمالي</th>
                </tr>
              </thead>
              <tbody>
                ${itemsList}
              </tbody>
            </table>

            <!-- Total -->
            <div style="text-align: left; padding: 15px; background-color: #fafafa; border-radius: 5px; margin: 0 0 20px 0;">
              <p style="margin: 5px 0; color: #555; font-size: 14px;">المجموع الفرعي: ${(order.total_amount - (order.shipping_fee || 0)).toFixed(2)} ريال</p>
              <p style="margin: 5px 0; color: #555; font-size: 14px;">الشحن: ${(order.shipping_fee || 0).toFixed(2)} ريال</p>
              <p style="margin: 15px 0 0 0; font-size: 18px; color: #996B99; font-weight: bold;">الإجمالي: ${order.total_amount?.toFixed(2)} ريال</p>
            </div>

            <!-- Shipping Info -->
            <div style="background-color: #f9f9f9; padding: 18px; border-radius: 8px; margin: 20px 0; border: 1px solid #e0e0e0;">
              <h3 style="color: #333; margin: 0 0 12px 0; font-size: 16px;">عنوان الشحن</h3>
              <p style="margin: 5px 0; color: #555; font-size: 14px;">${order.shipping_address}</p>
              <p style="margin: 5px 0; color: #555; font-size: 14px;">${order.city}</p>
              <p style="margin: 5px 0; color: #555; font-size: 14px;">هاتف: ${order.customer_phone}</p>
            </div>

            <!-- Next Steps -->
            <div style="background-color: #EFF6FF; padding: 15px; border-radius: 8px; margin: 20px 0; border-right: 4px solid #3B82F6;">
              <h3 style="color: #1D4ED8; margin: 0 0 8px 0; font-size: 15px;">الخطوات التالية</h3>
              <p style="color: #1E40AF; margin: 0; font-size: 14px; line-height: 1.7;">
                سنقوم بتجهيز طلبك وشحنه في أقرب وقت. ستصلك رسالة بريدية تحتوي على رقم تتبع الشحنة فور شحن الطلب.
              </p>
            </div>

            <!-- Help Text -->
            <p style="color: #777; text-align: center; font-size: 13px; margin: 25px 0; line-height: 1.6;">
              إذا كانت لديك أي أسئلة، يمكنك الرد على هذه الرسالة وسنكون سعداء بمساعدتك.
            </p>
            
            <!-- Footer -->
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center;">
              <p style="margin: 5px 0; color: #888; font-size: 13px;">${storeName}</p>
              <p style="margin: 5px 0; color: #999; font-size: 12px;">منتجات العناية الطبيعية</p>
              <p style="margin: 10px 0 5px 0; color: #999; font-size: 12px;">© ${new Date().getFullYear()} جميع الحقوق محفوظة</p>
              <p style="margin: 5px 0; color: #666; font-size: 12px;">orders@lamsetbeauty.com</p>
            </div>
          </div>
        </body>
        </html>
        `,
      }),
    });

    const emailData = await emailResponse.json();

    if (!emailResponse.ok) {
      throw new Error(`Failed to send email: ${JSON.stringify(emailData)}`);
    }

    console.log("Payment confirmation email sent to:", order.customer_email);

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error sending payment confirmation email:", error);
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
