import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2025-08-27.basil",
});

const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") || "";

serve(async (req) => {
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    console.error("❌ No stripe-signature header");
    return new Response("No signature", { status: 400 });
  }

  try {
    const body = await req.text();
    
    console.log("📨 Webhook received");
    
    // Verify webhook signature
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret
    );

    console.log("✅ Webhook verified, event type:", event.type);

    // Handle the event
    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      
      console.log("💳 Payment succeeded:", paymentIntent.id);
      console.log("Metadata:", paymentIntent.metadata);

      // Get order ID from metadata
      const orderId = paymentIntent.metadata.order_id;

      if (!orderId) {
        console.error("❌ No order_id in payment intent metadata");
        return new Response("No order_id in metadata", { status: 400 });
      }

      // Initialize Supabase client
      const supabaseClient = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
      );

      // Update order payment status
      console.log("📝 Updating order:", orderId);
      
      const { error: updateError } = await supabaseClient
        .from("orders")
        .update({ 
          payment_status: "completed",
          updated_at: new Date().toISOString()
        })
        .eq("id", orderId);

      if (updateError) {
        console.error("❌ Error updating order:", updateError);
        throw updateError;
      }

      console.log("✅ Order payment status updated to completed");

      // Send confirmation email in background
      try {
        console.log("📧 Sending confirmation email...");
        await supabaseClient.functions.invoke("send-order-confirmation", {
          body: { order_id: orderId },
        });
        console.log("✅ Confirmation email sent");
      } catch (emailError) {
        console.error("⚠️ Error sending confirmation email (non-critical):", emailError);
      }

      // Send payment confirmed email
      try {
        console.log("💳 Sending payment confirmation email...");
        await supabaseClient.functions.invoke("send-payment-confirmed", {
          body: { order_id: orderId },
        });
        console.log("✅ Payment confirmation email sent");
      } catch (emailError) {
        console.error("⚠️ Error sending payment confirmation email (non-critical):", emailError);
        // Don't fail the webhook if email fails
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("❌ Webhook error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
});
