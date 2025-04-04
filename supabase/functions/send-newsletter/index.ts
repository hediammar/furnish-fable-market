
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

// Set up Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

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

    // In a real application, you would now send emails to all subscribers
    // For this demo, we'll just log the action and update the newsletter's sent_at field
    console.log(`Newsletter "${newsletter.subject}" would be sent to ${subscribers.length} subscribers`);
    console.log("Newsletter content:", newsletter.content);
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
