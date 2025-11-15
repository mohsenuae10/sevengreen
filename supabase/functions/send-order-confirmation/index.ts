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

    const storeName = settings?.store_name || "لمسة الجمال";
    const storeUrl = settings?.store_url || "https://lamsetbeauty.com";

    // Get order details
    const { data: order, error: orderError } = await supabaseClient
      .from("orders")
      .select("*, order_items(*)")
      .eq("id", order_id)
      .single();

    if (orderError || !order) throw new Error("Order not found");

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

    const itemsList = order.order_items
      .map((item: any) => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.product_name}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${item.unit_price.toFixed(2)} ريال</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${item.total_price.toFixed(2)} ريال</td>
        </tr>
      `)
      .join("");

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `لمسة الجمال <noreply@lamsetbeauty.com>`,
        reply_to: 'support@lamsetbeauty.com',
        to: [order.customer_email],
        subject: `${order.customer_name}، تم تأكيد طلبك ${order.order_number} بنجاح ✅`,
        headers: {
          'List-Unsubscribe': `<mailto:unsubscribe@lamsetbeauty.com>`,
          'X-Priority': '3',
          'X-Entity-Ref-ID': order.order_number,
          'Precedence': 'bulk',
          'X-Auto-Response-Suppress': 'OOF, AutoReply',
        },
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
            
            <h2 style="color: #996B99;">شكراً لطلبك! 🎉</h2>
            <p>عزيزي/عزيزتي ${order.customer_name}،</p>
            <p>تم استلام طلبك بنجاح وسيتم معالجته قريباً.</p>
            
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #996B99; margin-top: 0;">تفاصيل الطلب</h3>
              <p><strong>رقم الطلب:</strong> ${order.order_number}</p>
              <p><strong>التاريخ:</strong> ${new Date(order.created_at).toLocaleString('ar-SA')}</p>
            </div>

            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <thead>
                <tr style="background-color: #2d5016; color: white;">
                  <th style="padding: 10px; text-align: right;">المنتج</th>
                  <th style="padding: 10px; text-align: center;">الكمية</th>
                  <th style="padding: 10px; text-align: right;">السعر</th>
                  <th style="padding: 10px; text-align: right;">الإجمالي</th>
                </tr>
              </thead>
              <tbody>
                ${itemsList}
              </tbody>
            </table>

            <div style="text-align: left; margin-top: 20px; padding-top: 20px; border-top: 2px solid #2d5016;">
              <p style="margin: 5px 0;"><strong>المجموع الفرعي:</strong> ${(order.total_amount - order.shipping_fee).toFixed(2)} ريال</p>
              <p style="margin: 5px 0;"><strong>رسوم الشحن:</strong> ${order.shipping_fee.toFixed(2)} ريال</p>
              <p style="margin: 10px 0 0 0; font-size: 18px; color: #996B99;"><strong>الإجمالي:</strong> ${order.total_amount.toFixed(2)} ريال</p>
            </div>

            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #996B99; margin-top: 0;">معلومات الشحن</h3>
              <p><strong>العنوان:</strong> ${order.shipping_address}</p>
              <p><strong>المدينة:</strong> ${order.city}</p>
              <p><strong>الهاتف:</strong> ${order.customer_phone}</p>
            </div>

            <p style="color: #666; margin-top: 30px;">سيتم إرسال رقم تتبع الشحنة عبر البريد الإلكتروني فور شحن طلبك.</p>
            
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

    console.log("Order confirmation email sent to:", order.customer_email);

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error sending confirmation email:", error);
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
