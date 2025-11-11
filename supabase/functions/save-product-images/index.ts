import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface IncomingImage {
  url: string;
  isPrimary?: boolean;
  displayOrder?: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { productId, images, limit = 10 } = await req.json();

    if (!productId || !Array.isArray(images) || images.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: "INVALID_INPUT" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
      throw new Error("Missing backend configuration");
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    // Simple user agents to avoid basic bot blocks
    const userAgents = [
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119 Safari/537.36",
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15",
      "Mozilla/5.0 (Linux; Android 11; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119 Mobile Safari/537.36",
    ];

    const pickUA = () => userAgents[Math.floor(Math.random() * userAgents.length)];

    const savedImages: Array<{ image_url: string; is_primary: boolean; display_order: number }> = [];
    let primaryImageUrl: string | null = null;

    const toExt = (contentType: string | null) => {
      if (!contentType) return "jpg";
      if (contentType.includes("png")) return "png";
      if (contentType.includes("webp")) return "webp";
      if (contentType.includes("gif")) return "gif";
      if (contentType.includes("jpeg")) return "jpg";
      return "jpg";
    };

    const target = (images as IncomingImage[]).slice(0, Math.min(limit, images.length));

    for (let i = 0; i < target.length; i++) {
      const image = target[i];
      const url = image.url;
      try {
        const res = await fetch(url, {
          redirect: "follow",
          headers: {
            "User-Agent": pickUA(),
            "Accept": "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9,ar;q=0.8",
            "Referer": "https://m.aliexpress.com/",
          },
        });
        if (!res.ok) throw new Error(`fetch_failed_${res.status}`);

        const contentType = res.headers.get("content-type") || "image/jpeg";
        const arrayBuffer = await res.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);

        const ext = toExt(contentType);
        const path = `${productId}/${Date.now()}_${i}.${ext}`;

        const { error: uploadError } = await supabase
          .storage
          .from("product-images")
          .upload(path, bytes, { contentType, upsert: false });

        if (uploadError) throw uploadError;

        const { data: pub } = supabase
          .storage
          .from("product-images")
          .getPublicUrl(path);

        const publicUrl = pub.publicUrl;

        const display_order = typeof image.displayOrder === "number" ? image.displayOrder : i;
        const is_primary = !!image.isPrimary;

        const { error: insertError } = await supabase
          .from("product_images")
          .insert({
            product_id: productId,
            image_url: publicUrl,
            is_primary,
            display_order,
          });

        if (insertError) throw insertError;

        if (is_primary && !primaryImageUrl) primaryImageUrl = publicUrl;

        savedImages.push({ image_url: publicUrl, is_primary, display_order });
      } catch (e) {
        console.error("Failed to process image:", url, e);
      }
    }

    if (primaryImageUrl) {
      const { error: upError } = await supabase
        .from("products")
        .update({ image_url: primaryImageUrl })
        .eq("id", productId);
      if (upError) console.error("Failed to set primary image on product:", upError);
    }

    return new Response(
      JSON.stringify({ success: true, savedImages, primaryImageUrl }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("save-product-images error:", error?.message || error);
    return new Response(
      JSON.stringify({ success: false, error: error?.message || "UNKNOWN_ERROR" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
