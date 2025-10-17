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

    const storeName = settings?.store_name || "Seven Green";
    const storeUrl = settings?.store_url || "https://sevengreenstore.com";

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
        <div style="text-align: center; margin: 30px 0;">
          <a href="${storeUrl}/checkout?order_id=${order.id}" 
             style="background-color: #2d5016; color: white; padding: 15px 40px; 
                    text-decoration: none; border-radius: 8px; font-weight: bold; 
                    display: inline-block; font-size: 16px;">
            إكمال الدفع الآن
          </a>
        </div>
      `
      : '';

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `Seven Green - سفن جرين <order@sevengreenstore.com>`,
        to: [order.customer_email],
        subject: `🔔 طلبك ${order.order_number} بانتظار إتمام الدفع`,
        headers: {
          'List-Unsubscribe': `<${storeUrl}/unsubscribe>`,
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
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2d5016; margin: 0; font-size: 28px;">Seven Green</h1>
              <p style="color: #666; margin: 10px 0; font-size: 14px;">منتجات العناية الطبيعية</p>
            </div>
            
            <div style="background-color: #e3f2fd; border-right: 4px solid #2196F3; padding: 20px; margin: 20px 0; border-radius: 5px;">
              <h2 style="color: #1976D2; margin: 0 0 10px 0; font-size: 20px;">مرحباً ${order.customer_name}</h2>
              <p style="color: #1565C0; margin: 0; font-size: 16px;">طلبك <strong>${order.order_number}</strong> بانتظار إتمام الدفع</p>
            </div>
            
            <p style="color: #333; line-height: 1.6; margin: 20px 0;">
              نشكرك على اختيارك Seven Green. لمعالجة طلبك وشحنه في أقرب وقت، يرجى إتمام عملية الدفع.
            </p>
            
            ${paymentLinkHtml}

            <div style="background-color: #fafafa; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #2d5016; margin: 0 0 15px 0; font-size: 18px;">تفاصيل الطلب</h3>
              <p style="margin: 5px 0; color: #555;"><strong>رقم الطلب:</strong> ${order.order_number}</p>
              <p style="margin: 5px 0; color: #555;"><strong>التاريخ:</strong> ${new Date(order.created_at).toLocaleDateString('ar-SA')}</p>
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
              <p style="margin: 15px 0 0 0; font-size: 18px; color: #2d5016; font-weight: bold;">الإجمالي: ${order.total_amount.toFixed(2)} ريال</p>
            </div>

            <p style="color: #666; text-align: center; font-size: 14px; margin: 30px 0;">
              لديك أسئلة؟ نحن هنا للمساعدة
            </p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #999; font-size: 12px;">
              <p style="margin: 5px 0;">Seven Green - سفن جرين</p>
              <p style="margin: 5px 0;">© 2025 جميع الحقوق محفوظة</p>
            </div>
          </div>
        </body>
        </html>
        `,
        text: `
مرحباً ${order.customer_name}،

طلبك ${order.order_number} بانتظار إتمام الدفع.

تفاصيل الطلب:
- رقم الطلب: ${order.order_number}
- التاريخ: ${new Date(order.created_at).toLocaleDateString('ar-SA')}
- المبلغ الإجمالي: ${order.total_amount.toFixed(2)} ريال

${order.stripe_payment_id ? `لإتمام الدفع، يرجى زيارة: ${storeUrl}/checkout?order_id=${order.id}` : ''}

شكراً لاختيارك Seven Green

Seven Green - سفن جرين
© 2025 جميع الحقوق محفوظة
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