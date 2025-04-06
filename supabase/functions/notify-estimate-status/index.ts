
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

type Status = "pending" | "approved" | "rejected" | "completed";

interface RequestBody {
  id: string;
  status: Status;
}

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
    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the request body
    const body: RequestBody = await req.json();
    const { id, status } = body;

    if (!id || !status) {
      return new Response(
        JSON.stringify({ error: "Missing required field id or status" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch the estimate details to get customer info
    const { data: estimate, error: fetchError } = await supabase
      .from("estimates")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError) {
      console.error("Error fetching estimate:", fetchError);
      return new Response(
        JSON.stringify({ error: "Estimate not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // For demonstration purposes, just log the notification
    // In a real app, you would send an email or SMS to the customer
    console.log(`Notifying customer ${estimate.contact_email} that their estimate ${id} is now ${status}`);
    
    // Here you would typically use a service like Resend, SendGrid, or Twilio
    // to send emails or SMS notifications to the customer
    
    // Example email content based on status
    let subject = "";
    let message = "";
    
    switch (status) {
      case "approved":
        subject = "Your Estimate Has Been Approved!";
        message = `Great news! Your estimate has been approved. You can now proceed with your order.`;
        break;
      case "rejected":
        subject = "Update on Your Estimate Request";
        message = `We're sorry, but your estimate has been declined. Please contact us for more information.`;
        break;
      case "completed":
        subject = "Your Order is Complete!";
        message = `We're happy to inform you that your order has been completed. Thank you for choosing us!`;
        break;
      case "pending":
        subject = "Your Estimate is Pending Review";
        message = `Your estimate is currently being reviewed by our team. We'll update you soon!`;
        break;
    }

    // Here we would send the actual notification
    // For now, just log it
    console.log({
      to: estimate.contact_email,
      subject,
      message,
      status
    });

    return new Response(
      JSON.stringify({ success: true, message: "Notification sent successfully" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error processing notification:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
