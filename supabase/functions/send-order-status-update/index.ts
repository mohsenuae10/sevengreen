import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type OrderStatus = 'pending' | 'processing' | 'packed' | 'shipped' | 'delivered' | 'cancelled';

const statusConfig: Record<OrderStatus, { emoji: string; title: string; description: string; color: string }> = {
  pending: {
    emoji: '⏳',
    title: 'طلبك قيد الانتظار',
    description: 'تم استلام طلبك وهو قيد المراجعة. سنقوم بتحديثك فور بدء المعالجة.',
    color: '#F59E0B',
  },
  processing: {
    emoji: '⚙️',
    title: 'جاري تجهيز طلبك',
    description: 'بدأنا في تجهيز طلبك! فريقنا يعمل على تحضير منتجاتك بعناية.',
    color: '#3B82F6',
  },
  packed: {
    emoji: '📦',
    title: 'طلبك جاهز للشحن',
    description: 'تم تغليف طلبك وهو جاهز للتسليم لشركة الشحن. سنرسل لك رقم التتبع قريباً.',
    color: '#8B5CF6',
  },
  shipped: {
    emoji: '🚚',
    title: 'تم شحن طلبك',
    description: 'طلبك في الطريق إليك! يمكنك تتبع شحنتك باستخدام رقم التتبع.',
    color: '#F97316',
  },
  delivered: {
    emoji: '✅',
    title: 'تم توصيل طلبك',
    description: 'تم توصيل طلبك بنجاح! نأمل أن تكون سعيداً بمنتجاتك.',
    color: '#22C55E',
  },
  cancelled: {
    emoji: '❌',
    title: 'تم إلغاء طلبك',
    description: 'تم إلغاء طلبك. إذا كان لديك أي استفسار، لا تتردد في التواصل معنا.',
    color: '#EF4444',
  },
};

const statusLabels: Record<OrderStatus, string> = {
  pending: 'قيد الانتظار',
  processing: 'قيد المعالجة',
  packed: 'جاهز للشحن',
  shipped: 'تم الشحن',
  delivered: 'تم التوصيل',
  cancelled: 'ملغي',
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { order_id, new_status, old_status } = await req.json();

    if (!order_id || !new_status) {
      throw new Error("Order ID and new_status are required");
    }

    // Don't send email if status hasn't changed
    if (old_status === new_status) {
      return new Response(
        JSON.stringify({ success: false, message: "Status unchanged" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Skip shipped status - handled by send-tracking-email
    if (new_status === 'shipped') {
      return new Response(
        JSON.stringify({ success: false, message: "Shipped status handled by send-tracking-email" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
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

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const config = statusConfig[new_status as OrderStatus];
    const statusLabel = statusLabels[new_status as OrderStatus] || new_status;

    const itemsList = order.order_items
      ?.map((item: any) => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee; font-size: 14px;">${item.product_name}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center; font-size: 14px;">${item.quantity}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right; font-size: 14px;">${item.total_price?.toFixed(2)} ريال</td>
        </tr>
      `)
      .join("") || "";

    // Tracking info section (only for shipped/delivered)
    const trackingHtml = order.tracking_number ? `
      <div style="background-color: #FAF5FB; padding: 15px; border-radius: 8px; margin: 20px 0; border-right: 4px solid ${config.color};">
        <h3 style="color: #996B99; margin-top: 0; font-size: 15px;">معلومات التتبع</h3>
        <p style="font-size: 14px;"><strong>رقم التتبع:</strong> ${order.tracking_number}</p>
        ${order.shipping_company ? `<p style="font-size: 14px;"><strong>شركة الشحن:</strong> ${order.shipping_company}</p>` : ''}
      </div>
    ` : '';

    // Delivery feedback section (only for delivered)
    const deliveredExtraHtml = new_status === 'delivered' ? `
      <div style="background-color: #F0FDF4; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; border: 1px solid #BBF7D0;">
        <p style="font-size: 16px; color: #15803D; margin: 0 0 10px 0; font-weight: 600;">🌟 نتمنى أن تكون تجربتك رائعة!</p>
        <p style="font-size: 14px; color: #166534; margin: 0;">رأيك يهمنا، شاركنا تقييمك لمساعدتنا في تحسين خدماتنا.</p>
      </div>
    ` : '';

    // Cancellation note (only for cancelled)
    const cancelledExtraHtml = new_status === 'cancelled' ? `
      <div style="background-color: #FEF2F2; padding: 15px; border-radius: 8px; margin: 20px 0; border-right: 4px solid #EF4444;">
        <p style="font-size: 14px; color: #991B1B; margin: 0;">
          إذا تم الإلغاء بالخطأ أو ترغب في إعادة الطلب، يمكنك التواصل معنا أو زيارة متجرنا لإنشاء طلب جديد.
        </p>
      </div>
    ` : '';

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
        subject: `${config.emoji} ${config.title} - طلب رقم ${order.order_number}`,
        headers: {
          'List-Unsubscribe': `<mailto:orders@lamsetbeauty.com>`,
          'X-Priority': '3',
          'X-Entity-Ref-ID': `${order.order_number}-${new_status}`,
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

            <!-- Status Badge -->
            <div style="text-align: center; margin: 25px 0;">
              <div style="display: inline-block; background-color: ${config.color}15; border: 2px solid ${config.color}; border-radius: 50px; padding: 12px 30px;">
                <span style="font-size: 28px;">${config.emoji}</span>
                <span style="font-size: 18px; font-weight: 600; color: ${config.color}; margin-right: 8px;">${statusLabel}</span>
              </div>
            </div>

            <!-- Greeting -->
            <p style="color: #333; font-size: 16px; line-height: 1.6;">
              مرحباً <strong>${order.customer_name}</strong>،
            </p>
            
            <p style="color: #555; font-size: 15px; line-height: 1.7;">
              ${config.description}
            </p>

            ${trackingHtml}
            ${deliveredExtraHtml}
            ${cancelledExtraHtml}

            <!-- Order Info -->
            <div style="background-color: #f9f9f9; padding: 18px; border-radius: 8px; margin: 20px 0; border: 1px solid #e0e0e0;">
              <h3 style="color: #333; margin: 0 0 12px 0; font-size: 16px; font-weight: 600;">معلومات الطلب</h3>
              <p style="margin: 6px 0; color: #555; font-size: 14px;"><strong>رقم الطلب:</strong> ${order.order_number}</p>
              <p style="margin: 6px 0; color: #555; font-size: 14px;"><strong>تاريخ الطلب:</strong> ${new Date(order.created_at).toLocaleDateString('ar-SA')}</p>
              <p style="margin: 6px 0; color: #555; font-size: 14px;"><strong>حالة الطلب:</strong> ${statusLabel}</p>
              <p style="margin: 6px 0; color: #555; font-size: 14px;"><strong>المبلغ الإجمالي:</strong> ${order.total_amount?.toFixed(2)} ريال</p>
            </div>

            <!-- Items Table -->
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <thead>
                <tr style="background-color: #f5f5f5;">
                  <th style="padding: 12px; text-align: right; border-bottom: 2px solid #ddd; color: #333; font-size: 14px;">المنتج</th>
                  <th style="padding: 12px; text-align: center; border-bottom: 2px solid #ddd; color: #333; font-size: 14px;">الكمية</th>
                  <th style="padding: 12px; text-align: right; border-bottom: 2px solid #ddd; color: #333; font-size: 14px;">السعر</th>
                </tr>
              </thead>
              <tbody>
                ${itemsList}
              </tbody>
            </table>

            <!-- Total -->
            <div style="text-align: left; margin: 20px 0; padding: 15px; background-color: #fafafa; border-radius: 5px;">
              <p style="margin: 5px 0; color: #555; font-size: 14px;">المجموع الفرعي: ${(order.total_amount - (order.shipping_fee || 0)).toFixed(2)} ريال</p>
              <p style="margin: 5px 0; color: #555; font-size: 14px;">الشحن: ${(order.shipping_fee || 0).toFixed(2)} ريال</p>
              <p style="margin: 15px 0 0 0; font-size: 18px; color: #996B99; font-weight: bold;">الإجمالي: ${order.total_amount?.toFixed(2)} ريال</p>
            </div>

            <!-- CTA Button -->
            <div style="text-align: center; margin: 25px 0;">
              <a href="${storeUrl}" 
                 style="background-color: #996B99; color: #ffffff; padding: 14px 40px; 
                        text-decoration: none; border-radius: 6px; font-weight: 600; 
                        display: inline-block; font-size: 14px;">
                زيارة المتجر
              </a>
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

    console.log(`Status update email (${new_status}) sent to:`, order.customer_email);

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error sending status update email:", error);
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
