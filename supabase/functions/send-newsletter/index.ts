
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
    console.log("Processing newsletter ID:", newsletterId);

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

    console.log("Found newsletter:", newsletter.subject);

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

    console.log(`Found ${subscribers.length} subscribers`);
    
    // Format the newsletter content (transform from JSON if needed)
    let htmlContent = "";
    if (typeof newsletter.content === 'string') {
      htmlContent = newsletter.content;
    } else {
      // If it's structured content, render it as HTML (simplified)
      htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${newsletter.subject}</title>
  <style>
    body { 
      font-family: Arial, sans-serif; 
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header { 
      text-align: center;
      margin-bottom: 20px;
      padding-bottom: 20px;
      border-bottom: 1px solid #eee;
    }
    h1 { color: #9F8E7D; }
    .content { margin: 20px 0; }
    .footer { 
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #eee;
      font-size: 12px;
      color: #666;
      text-align: center;
    }
    img { max-width: 100%; height: auto; }
    a { color: #9F8E7D; text-decoration: none; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <div class="header">
    <h1>${newsletter.subject}</h1>
    <p>${newsletter.preheader || ''}</p>
  </div>
  <div class="content">
    ${JSON.stringify(newsletter.content)}
  </div>
  <div class="footer">
    <p>Meubles Karim | Route Hammamet Nord vers Nabeul, Hammamet, Tunisia, 8050</p>
    <p>You're receiving this email because you signed up for updates from Meubles Karim.</p>
    <p><a href="#">Unsubscribe</a></p>
  </div>
</body>
</html>
      `;
    }
    
    // Create a counter for successful emails
    let successCount = 0;
    let errorCount = 0;
    
    // Send emails to all subscribers (sequentially to avoid rate limits)
    for (const subscriber of subscribers) {
      try {
        console.log(`Sending to ${subscriber.email}...`);
        
        const emailResponse = await resend.emails.send({
          from: `Meubles Karim <${senderEmail}>`,
          to: [subscriber.email],
          subject: newsletter.subject,
          html: htmlContent,
        });
        
        console.log(`Email sent to ${subscriber.email}:`, emailResponse);
        successCount++;
        
        // Small delay to avoid hitting rate limits
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (emailError) {
        console.error(`Error sending email to ${subscriber.email}:`, emailError);
        errorCount++;
      }
    }

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
      JSON.stringify({ 
        success: true, 
        message: `Newsletter sent to ${successCount} subscribers successfully. ${errorCount} failures.` 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in send-newsletter function:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
