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
        from: `${storeName} <order@sevengreenstore.com>`,
        to: [order.customer_email],
        subject: `تذكير: إكمال دفع طلبك - ${order.order_number}`,
        html: `
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Tajawal', Arial, sans-serif; }
          </style>
        </head>
        <body style="margin: 0; padding: 20px; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2d5016; margin: 0;">${storeName}</h1>
              <p style="color: #d4a85c; margin: 5px 0;">
                <a href="${storeUrl}" style="color: #d4a85c; text-decoration: none;">${storeUrl.replace('https://', '')}</a>
              </p>
            </div>
            
            <div style="background-color: #fff3cd; border: 2px solid #ffc107; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
              <h2 style="color: #856404; margin-top: 0;">⏰ تذكير بإكمال الدفع</h2>
              <p style="color: #856404; font-size: 16px; margin: 0;">نلاحظ أن طلبك لم يكتمل بعد</p>
            </div>
            
            <p>عزيزي/عزيزتي ${order.customer_name}،</p>
            <p>نود تذكيرك بأن طلبك رقم <strong>${order.order_number}</strong> ما زال في انتظار إتمام عملية الدفع.</p>
            <p>لضمان معالجة طلبك وشحنه في أقرب وقت ممكن، يرجى إكمال الدفع الآن.</p>
            
            ${paymentLinkHtml}

            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #2d5016; margin-top: 0;">ملخص الطلب</h3>
              <p><strong>رقم الطلب:</strong> ${order.order_number}</p>
              <p><strong>تاريخ الطلب:</strong> ${new Date(order.created_at).toLocaleString('ar-SA')}</p>
            </div>

            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <thead>
                <tr style="background-color: #2d5016; color: white;">
                  <th style="padding: 10px; text-align: right;">المنتج</th>
                  <th style="padding: 10px; text-align: center;">الكمية</th>
                  <th style="padding: 10px; text-align: right;">الإجمالي</th>
                </tr>
              </thead>
              <tbody>
                ${itemsList}
              </tbody>
            </table>

            <div style="text-align: left; margin-top: 20px; padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
              <p style="margin: 5px 0;"><strong>المجموع الفرعي:</strong> ${(order.total_amount - order.shipping_fee).toFixed(2)} ريال</p>
              <p style="margin: 5px 0;"><strong>رسوم الشحن:</strong> ${order.shipping_fee.toFixed(2)} ريال</p>
              <p style="margin: 10px 0 0 0; font-size: 20px; color: #2d5016;"><strong>المبلغ الإجمالي:</strong> ${order.total_amount.toFixed(2)} ريال</p>
            </div>

            <div style="background-color: #e8f5e9; border-right: 4px solid #2d5016; padding: 15px; margin: 20px 0;">
              <h4 style="color: #2d5016; margin-top: 0;">💡 لماذا يجب إكمال الدفع؟</h4>
              <ul style="color: #2d5016; margin: 10px 0; padding-right: 20px;">
                <li>ضمان توفر المنتجات المطلوبة</li>
                <li>معالجة وشحن طلبك بأسرع وقت</li>
                <li>تجنب إلغاء الطلب تلقائياً</li>
              </ul>
            </div>

            <p style="color: #666; margin-top: 30px; text-align: center; font-size: 14px;">
              إذا كانت لديك أي استفسارات أو تحتاج إلى مساعدة، لا تتردد في التواصل معنا.
            </p>
            
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