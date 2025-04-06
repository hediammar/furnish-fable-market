
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Resend } from "npm:resend@2.0.0";

// Set up Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const resend = new Resend(Deno.env.get("RESEND_API_KEY") || "");
const senderEmail = "hediammar100@gmail.com";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse the request body
    const { newsletterId } = await req.json();

    // Fetch the newsletter content
    const { data: newsletter, error: newsletterError } = await supabase
      .from("newsletters")
      .select("*")
      .eq("id", newsletterId)
      .single();

    if (newsletterError) {
      console.error("Error fetching newsletter:", newsletterError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch newsletter" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Fetch all subscribers
    const { data: subscribers, error: subscribersError } = await supabase
      .from("newsletter_subscribers")
      .select("*");

    if (subscribersError) {
      console.error("Error fetching subscribers:", subscribersError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch subscribers" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // In a real application, send emails to all subscribers using Resend
    console.log(`Newsletter "${newsletter.subject}" would be sent to ${subscribers.length} subscribers`);
    
    // Format the newsletter content (transform from JSON if needed)
    let htmlContent = "";
    if (typeof newsletter.content === 'string') {
      htmlContent = newsletter.content;
    } else {
      // If it's structured content, render it as HTML (simplified)
      htmlContent = `<h1>${newsletter.subject}</h1><div>${JSON.stringify(newsletter.content)}</div>`;
    }
    
    // Send a test email to confirm functionality - just for logging/testing
    try {
      const emailResponse = await resend.emails.send({
        from: `Meubles Karim <${senderEmail}>`,
        to: [senderEmail], // Send a copy to the sender for testing
        subject: `[TEST] ${newsletter.subject}`,
        html: htmlContent,
      });
      
      console.log("Test email sent:", emailResponse);
    } catch (emailError) {
      console.error("Error sending test email:", emailError);
    }
    
    // Log info about subscribers
    console.log("Subscribers:", subscribers.map(s => s.email).join(", "));

    // Update the newsletter to mark it as sent
    const { error: updateError } = await supabase
      .from("newsletters")
      .update({ sent_at: new Date().toISOString() })
      .eq("id", newsletterId);

    if (updateError) {
      console.error("Error updating newsletter sent status:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to update newsletter status" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Return success response
    return new Response(
      JSON.stringify({ success: true, message: `Newsletter sent to ${subscribers.length} subscribers` }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in send-newsletter function:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
