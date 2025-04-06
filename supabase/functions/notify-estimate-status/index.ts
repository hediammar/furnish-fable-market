
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RequestBody {
  id: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_ANON_KEY") || "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    // Get the request body
    const { id, status }: RequestBody = await req.json();

    if (!id || !status) {
      return new Response(
        JSON.stringify({ 
          error: "Missing required parameters: id and status are required" 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Fetch the estimate to get customer email
    const { data: estimate, error: fetchError } = await supabaseClient
      .from("estimates")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !estimate) {
      console.error("Error fetching estimate:", fetchError);
      return new Response(
        JSON.stringify({ error: "Estimate not found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Construct email content based on status
    let subject = "";
    let content = "";

    switch (status) {
      case "approved":
        subject = "Your Estimate Has Been Approved";
        content = `
          <h1>Good News! Your Estimate Has Been Approved</h1>
          <p>Dear Customer,</p>
          <p>We're pleased to inform you that your estimate request has been approved.</p>
          <p>Our team will be in touch with you shortly to discuss next steps and payment details.</p>
          <p>Thank you for choosing Meubles Karim for your furniture needs!</p>
          <p>Best regards,<br>The Meubles Karim Team</p>
        `;
        break;
      case "rejected":
        subject = "Update on Your Estimate Request";
        content = `
          <h1>Update on Your Estimate Request</h1>
          <p>Dear Customer,</p>
          <p>Thank you for your interest in our products. After careful consideration, we regret to inform you that we are unable to proceed with your estimate request at this time.</p>
          <p>This could be due to various factors such as product availability, shipping constraints, or specialized requirements.</p>
          <p>Please feel free to contact us for more information or to discuss alternatives that might better suit your needs.</p>
          <p>Thank you for your understanding.</p>
          <p>Best regards,<br>The Meubles Karim Team</p>
        `;
        break;
      case "completed":
        subject = "Your Order Has Been Completed";
        content = `
          <h1>Your Order Has Been Completed</h1>
          <p>Dear Customer,</p>
          <p>We're happy to inform you that your order has been completed and is now ready for delivery or pickup.</p>
          <p>Our team will be in touch with you shortly to arrange the final details.</p>
          <p>Thank you for choosing Meubles Karim for your furniture needs!</p>
          <p>Best regards,<br>The Meubles Karim Team</p>
        `;
        break;
      default:
        subject = "Update on Your Estimate";
        content = `
          <h1>Update on Your Estimate</h1>
          <p>Dear Customer,</p>
          <p>This is to inform you that there has been an update to your estimate request.</p>
          <p>Please contact us for more details.</p>
          <p>Best regards,<br>The Meubles Karim Team</p>
        `;
    }

    // Send the notification email
    // For demo purposes, we'll just log the email that would be sent
    console.log(`Would send email to: ${estimate.contact_email}`);
    console.log(`Subject: ${subject}`);
    console.log(`Content: ${content}`);
    
    // In a real implementation, you would use an email service like Resend.com or SendGrid
    // For example:
    /*
    const { data: emailResult, error: emailError } = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Meubles Karim <notifications@meubleskarim.com>',
        to: estimate.contact_email,
        subject: subject,
        html: content,
      }),
    }).then(r => r.json());
    
    if (emailError) {
      throw new Error(`Failed to send email: ${JSON.stringify(emailError)}`);
    }
    */

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Notification for status '${status}' would be sent to ${estimate.contact_email}`
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );

  } catch (error) {
    console.error("Error processing request:", error);
    
    return new Response(
      JSON.stringify({ error: error.message || "An unexpected error occurred" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
