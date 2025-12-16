import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { invoice_id, access_code } = await req.json();
    
    if (!invoice_id && !access_code) {
      return new Response(
        JSON.stringify({ error: 'invoice_id or access_code required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get visitor's IP from headers
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
               req.headers.get('cf-connecting-ip') || 
               req.headers.get('x-real-ip') || 
               'unknown';
    
    const userAgent = req.headers.get('user-agent') || 'unknown';

    // Get geolocation from IP using free API
    let geoData = {
      country_code: null,
      country_name: null,
      city: null
    };

    if (ip && ip !== 'unknown' && ip !== '127.0.0.1' && ip !== '::1') {
      try {
        // Using ip-api.com (free, no API key required, 45 requests/minute)
        const geoResponse = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,countryCode,city`);
        if (geoResponse.ok) {
          const geoJson = await geoResponse.json();
          if (geoJson.status === 'success') {
            geoData = {
              country_code: geoJson.countryCode,
              country_name: geoJson.country,
              city: geoJson.city
            };
          }
        }
      } catch (geoError) {
        console.log('Geolocation lookup failed:', geoError);
      }
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get invoice_id from access_code if needed
    let targetInvoiceId = invoice_id;
    if (!targetInvoiceId && access_code) {
      const { data: invoice } = await supabase
        .from('invoices')
        .select('id')
        .eq('access_code', access_code)
        .single();
      
      if (invoice) {
        targetInvoiceId = invoice.id;
      }
    }

    if (!targetInvoiceId) {
      return new Response(
        JSON.stringify({ error: 'Invoice not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Insert visit record
    const { error: visitError } = await supabase
      .from('invoice_visits')
      .insert({
        invoice_id: targetInvoiceId,
        ip_address: ip,
        user_agent: userAgent,
        country_code: geoData.country_code,
        country_name: geoData.country_name,
        city: geoData.city
      });

    if (visitError) {
      console.error('Error inserting visit:', visitError);
    }

    // Update view count
    const { error: updateError } = await supabase.rpc('increment_invoice_views', {
      invoice_uuid: targetInvoiceId
    });

    if (updateError) {
      // Fallback: direct update if RPC doesn't exist
      await supabase
        .from('invoices')
        .update({ view_count: supabase.rpc('coalesce', { val: 'view_count', default_val: 0 }) })
        .eq('id', targetInvoiceId);
    }

    console.log(`Visit tracked for invoice ${targetInvoiceId} from ${geoData.country_name || ip}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        location: geoData.country_name ? `${geoData.city || ''}, ${geoData.country_name}` : null 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error tracking visit:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
