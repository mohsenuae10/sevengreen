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

    // Check if payment is still pending
    if (order.payment_status !== 'pending') {
      console.log("Payment already completed for order:", order.order_number);
      return new Response(
        JSON.stringify({ error: "Payment already completed" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

    const itemsList = order.order_items
      .map((item: any) => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.product_name}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${item.total_price.toFixed(2)} ريال</td>
        </tr>
      `)
      .join("");

    // Generate payment link if available
    const paymentLinkHtml = order.stripe_payment_id 
      ? `
        <div style="text-align: center; margin: 25px 0;">
          <a href="${storeUrl}/checkout?order_id=${order.id}" 
             style="background-color: #996B99; color: #ffffff; padding: 14px 40px; 
                    text-decoration: none; border-radius: 6px; font-weight: 600; 
                    display: inline-block; font-size: 16px;">
            إتمام الدفع
          </a>
        </div>
        <p style="text-align: center; font-size: 13px; color: #888; margin: 15px 0;">
          جميع المعاملات آمنة ومشفّرة
        </p>
      `
      : '';

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `لمسة بيوتي <noreply@lamsetbeauty.com>`,
        reply_to: 'support@lamsetbeauty.com',
        to: [order.customer_email],
        subject: `${order.customer_name}، طلبك ${order.order_number} بحاجة لإتمام الدفع`,
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
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 20px; background-color: #f5f5f5; font-family: Arial, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 25px; padding-bottom: 15px; border-bottom: 2px solid #e0e0e0;">
            <h1 style="color: #996B99; margin: 0; font-size: 28px; font-weight: 600;">لمسة بيوتي</h1>
            <p style="color: #666; margin: 8px 0 0 0; font-size: 14px;">منتجات العناية الطبيعية</p>
          </div>
            
            <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
              مرحباً <strong>${order.customer_name}</strong>،
            </p>
            
            <p style="color: #333; font-size: 15px; line-height: 1.7; margin: 0 0 20px 0;">
              شكراً لطلبك من لمسة بيوتي. نود إعلامك بأن طلبك رقم <strong>${order.order_number}</strong> ما زال في انتظار إتمام عملية الدفع.
            </p>
            
            <p style="color: #555; font-size: 15px; line-height: 1.7; margin: 0 0 25px 0;">
              لمعالجة طلبك وشحنه، يرجى إكمال الدفع من خلال الرابط أدناه.
            </p>
            
            ${paymentLinkHtml}

            <div style="background-color: #f9f9f9; padding: 18px; border-radius: 6px; margin: 25px 0; border: 1px solid #e0e0e0;">
              <h3 style="color: #333; margin: 0 0 12px 0; font-size: 16px; font-weight: 600;">ملخص الطلب</h3>
              <p style="margin: 6px 0; color: #555; font-size: 14px;"><strong>رقم الطلب:</strong> ${order.order_number}</p>
              <p style="margin: 6px 0; color: #555; font-size: 14px;"><strong>تاريخ الطلب:</strong> ${new Date(order.created_at).toLocaleDateString('ar-SA')}</p>
            </div>

            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <thead>
                <tr style="background-color: #f5f5f5;">
                  <th style="padding: 12px; text-align: right; border-bottom: 2px solid #ddd; color: #333;">المنتج</th>
                  <th style="padding: 12px; text-align: center; border-bottom: 2px solid #ddd; color: #333;">الكمية</th>
                  <th style="padding: 12px; text-align: right; border-bottom: 2px solid #ddd; color: #333;">السعر</th>
                </tr>
              </thead>
              <tbody>
                ${itemsList}
              </tbody>
            </table>

            <div style="text-align: left; margin: 20px 0; padding: 15px; background-color: #fafafa; border-radius: 5px;">
              <p style="margin: 5px 0; color: #555;">المجموع الفرعي: ${(order.total_amount - order.shipping_fee).toFixed(2)} ريال</p>
              <p style="margin: 5px 0; color: #555;">الشحن: ${order.shipping_fee.toFixed(2)} ريال</p>
              <p style="margin: 15px 0 0 0; font-size: 18px; color: #996B99; font-weight: bold;">الإجمالي: ${order.total_amount.toFixed(2)} ريال</p>
            </div>

            <p style="color: #777; text-align: center; font-size: 14px; margin: 25px 0; line-height: 1.6;">
              إذا كانت لديك أي أسئلة، يمكنك الرد على هذه الرسالة وسنكون سعداء بمساعدتك.
            </p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center;">
              <p style="margin: 5px 0; color: #888; font-size: 13px;">لمسة بيوتي - Lamset Beauty</p>
              <p style="margin: 5px 0; color: #999; font-size: 12px;">متجر لمسة بيوتي للعناية الطبيعية</p>
              <p style="margin: 10px 0 5px 0; color: #999; font-size: 12px;">© 2025 جميع الحقوق محفوظة</p>
              <p style="margin: 5px 0; color: #666; font-size: 12px;">support@lamsetbeauty.com</p>
            </div>
          </div>
        </body>
        </html>
        `,
        text: `
مرحباً ${order.customer_name}،

شكراً لطلبك من لمسة بيوتي - Lamset Beauty.

طلبك رقم ${order.order_number} ما زال في انتظار إتمام عملية الدفع.

تفاصيل الطلب:
- رقم الطلب: ${order.order_number}
- تاريخ الطلب: ${new Date(order.created_at).toLocaleDateString('ar-SA')}
- المبلغ الإجمالي: ${order.total_amount.toFixed(2)} ريال

${order.stripe_payment_id ? `لإتمام عملية الدفع، يرجى زيارة الرابط التالي:\n${storeUrl}/checkout?order_id=${order.id}` : ''}

لمعالجة طلبك وشحنه، يرجى إكمال الدفع في أقرب وقت ممكن.

إذا كانت لديك أي أسئلة، نحن هنا لمساعدتك.

مع تحيات فريق لمسة بيوتي - Lamset Beauty
منتجات الجمال والعناية الفاخرة

© 2025 Lamset Beauty - جميع الحقوق محفوظة
        `,
      }),
    });

    const emailData = await emailResponse.json();

    if (!emailResponse.ok) {
      throw new Error(`Failed to send email: ${JSON.stringify(emailData)}`);
    }

    console.log("Payment reminder email sent to:", order.customer_email);

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error sending payment reminder:", error);
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