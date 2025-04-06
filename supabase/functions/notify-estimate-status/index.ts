
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { Resend } from "npm:resend@2.0.0";

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
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );
    
    // Initialize Resend
    const resend = new Resend(Deno.env.get("RESEND_API_KEY") || "");
    const senderEmail = "hediammar100@gmail.com";

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
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Your Estimate Has Been Approved</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600&family=Cormorant+Garamond:wght@400;500&display=swap');
    
    body {
      font-family: 'Cormorant Garamond', serif;
      color: #333;
      line-height: 1.6;
      background-color: #f9f8f6;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 40px;
      background-color: #fff;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
      border: 1px solid #e0e0e0;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      border-bottom: 2px solid #9F8E7D;
      padding-bottom: 20px;
    }
    .header h1 {
      color: #9F8E7D;
      margin-bottom: 5px;
      font-size: 28px;
      font-weight: normal;
      font-family: 'Playfair Display', serif;
    }
    .content {
      margin-bottom: 30px;
      font-size: 18px;
    }
    .footer {
      margin-top: 40px;
      text-align: center;
      font-size: 14px;
      color: #666;
      border-top: 1px solid #e2e8f0;
      padding-top: 20px;
    }
    .btn {
      display: inline-block;
      margin-top: 20px;
      padding: 12px 25px;
      background-color: #9F8E7D;
      color: white;
      text-decoration: none;
      border-radius: 4px;
      font-family: 'Playfair Display', serif;
      font-size: 16px;
      text-align: center;
    }
    .logo {
      text-align: center;
      margin-bottom: 20px;
    }
    .logo img {
      max-width: 180px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">
        <img src="https://via.placeholder.com/180x50?text=Meubles+Karim" alt="Meubles Karim Logo">
      </div>
      <h1>Good News! Your Estimate Has Been Approved</h1>
    </div>
    
    <div class="content">
      <p>Dear Customer,</p>
      <p>We're pleased to inform you that your estimate request has been approved.</p>
      <p>Our team will be in touch with you shortly to discuss next steps and payment details. If you have any questions or would like more information, please don't hesitate to contact us.</p>
      <p>Thank you for choosing Meubles Karim for your furniture needs!</p>
      
      <div style="text-align: center;">
        <a href="mailto:contact@meubleskarim.com" class="btn">Contact Us</a>
      </div>
    </div>
    
    <div class="footer">
      <p>Best regards,<br>The Meubles Karim Team</p>
      <p>Meubles Karim | Route Hammamet Nord vers Nabeul, Hammamet, Tunisia, 8050 | (+216) 72 260 360</p>
    </div>
  </div>
</body>
</html>
        `;
        break;
      case "rejected":
        subject = "Update on Your Estimate Request";
        content = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Update on Your Estimate Request</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600&family=Cormorant+Garamond:wght@400;500&display=swap');
    
    body {
      font-family: 'Cormorant Garamond', serif;
      color: #333;
      line-height: 1.6;
      background-color: #f9f8f6;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 40px;
      background-color: #fff;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
      border: 1px solid #e0e0e0;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      border-bottom: 2px solid #9F8E7D;
      padding-bottom: 20px;
    }
    .header h1 {
      color: #9F8E7D;
      margin-bottom: 5px;
      font-size: 28px;
      font-weight: normal;
      font-family: 'Playfair Display', serif;
    }
    .content {
      margin-bottom: 30px;
      font-size: 18px;
    }
    .footer {
      margin-top: 40px;
      text-align: center;
      font-size: 14px;
      color: #666;
      border-top: 1px solid #e2e8f0;
      padding-top: 20px;
    }
    .btn {
      display: inline-block;
      margin-top: 20px;
      padding: 12px 25px;
      background-color: #9F8E7D;
      color: white;
      text-decoration: none;
      border-radius: 4px;
      font-family: 'Playfair Display', serif;
      font-size: 16px;
      text-align: center;
    }
    .logo {
      text-align: center;
      margin-bottom: 20px;
    }
    .logo img {
      max-width: 180px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">
        <img src="https://via.placeholder.com/180x50?text=Meubles+Karim" alt="Meubles Karim Logo">
      </div>
      <h1>Update on Your Estimate Request</h1>
    </div>
    
    <div class="content">
      <p>Dear Customer,</p>
      <p>Thank you for your interest in our products. After careful consideration, we regret to inform you that we are unable to proceed with your estimate request at this time.</p>
      <p>This could be due to various factors such as product availability, shipping constraints, or specialized requirements.</p>
      <p>Please feel free to contact us for more information or to discuss alternatives that might better suit your needs.</p>
      <p>Thank you for your understanding.</p>
      
      <div style="text-align: center;">
        <a href="mailto:contact@meubleskarim.com" class="btn">Contact Us</a>
      </div>
    </div>
    
    <div class="footer">
      <p>Best regards,<br>The Meubles Karim Team</p>
      <p>Meubles Karim | Route Hammamet Nord vers Nabeul, Hammamet, Tunisia, 8050 | (+216) 72 260 360</p>
    </div>
  </div>
</body>
</html>
        `;
        break;
      case "completed":
        subject = "Your Order Has Been Completed";
        content = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Your Order Has Been Completed</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600&family=Cormorant+Garamond:wght@400;500&display=swap');
    
    body {
      font-family: 'Cormorant Garamond', serif;
      color: #333;
      line-height: 1.6;
      background-color: #f9f8f6;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 40px;
      background-color: #fff;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
      border: 1px solid #e0e0e0;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      border-bottom: 2px solid #9F8E7D;
      padding-bottom: 20px;
    }
    .header h1 {
      color: #9F8E7D;
      margin-bottom: 5px;
      font-size: 28px;
      font-weight: normal;
      font-family: 'Playfair Display', serif;
    }
    .content {
      margin-bottom: 30px;
      font-size: 18px;
    }
    .footer {
      margin-top: 40px;
      text-align: center;
      font-size: 14px;
      color: #666;
      border-top: 1px solid #e2e8f0;
      padding-top: 20px;
    }
    .btn {
      display: inline-block;
      margin-top: 20px;
      padding: 12px 25px;
      background-color: #9F8E7D;
      color: white;
      text-decoration: none;
      border-radius: 4px;
      font-family: 'Playfair Display', serif;
      font-size: 16px;
      text-align: center;
    }
    .logo {
      text-align: center;
      margin-bottom: 20px;
    }
    .logo img {
      max-width: 180px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">
        <img src="https://via.placeholder.com/180x50?text=Meubles+Karim" alt="Meubles Karim Logo">
      </div>
      <h1>Your Order Has Been Completed</h1>
    </div>
    
    <div class="content">
      <p>Dear Customer,</p>
      <p>We're happy to inform you that your order has been completed and is now ready for delivery or pickup.</p>
      <p>Our team will be in touch with you shortly to arrange the final details.</p>
      <p>Thank you for choosing Meubles Karim for your furniture needs!</p>
      
      <div style="text-align: center;">
        <a href="mailto:contact@meubleskarim.com" class="btn">Contact Us</a>
      </div>
    </div>
    
    <div class="footer">
      <p>Best regards,<br>The Meubles Karim Team</p>
      <p>Meubles Karim | Route Hammamet Nord vers Nabeul, Hammamet, Tunisia, 8050 | (+216) 72 260 360</p>
    </div>
  </div>
</body>
</html>
        `;
        break;
      default:
        subject = "Update on Your Estimate";
        content = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Update on Your Estimate</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600&family=Cormorant+Garamond:wght@400;500&display=swap');
    
    body {
      font-family: 'Cormorant Garamond', serif;
      color: #333;
      line-height: 1.6;
      background-color: #f9f8f6;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 40px;
      background-color: #fff;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
      border: 1px solid #e0e0e0;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      border-bottom: 2px solid #9F8E7D;
      padding-bottom: 20px;
    }
    .header h1 {
      color: #9F8E7D;
      margin-bottom: 5px;
      font-size: 28px;
      font-weight: normal;
      font-family: 'Playfair Display', serif;
    }
    .content {
      margin-bottom: 30px;
      font-size: 18px;
    }
    .footer {
      margin-top: 40px;
      text-align: center;
      font-size: 14px;
      color: #666;
      border-top: 1px solid #e2e8f0;
      padding-top: 20px;
    }
    .btn {
      display: inline-block;
      margin-top: 20px;
      padding: 12px 25px;
      background-color: #9F8E7D;
      color: white;
      text-decoration: none;
      border-radius: 4px;
      font-family: 'Playfair Display', serif;
      font-size: 16px;
      text-align: center;
    }
    .logo {
      text-align: center;
      margin-bottom: 20px;
    }
    .logo img {
      max-width: 180px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">
        <img src="https://via.placeholder.com/180x50?text=Meubles+Karim" alt="Meubles Karim Logo">
      </div>
      <h1>Update on Your Estimate</h1>
    </div>
    
    <div class="content">
      <p>Dear Customer,</p>
      <p>This is to inform you that there has been an update to your estimate request.</p>
      <p>Please contact us for more details.</p>
      
      <div style="text-align: center;">
        <a href="mailto:contact@meubleskarim.com" class="btn">Contact Us</a>
      </div>
    </div>
    
    <div class="footer">
      <p>Best regards,<br>The Meubles Karim Team</p>
      <p>Meubles Karim | Route Hammamet Nord vers Nabeul, Hammamet, Tunisia, 8050 | (+216) 72 260 360</p>
    </div>
  </div>
</body>
</html>
        `;
    }

    // Send the notification email using Resend
    try {
      console.log(`Sending email to: ${estimate.contact_email}`);
      
      const emailResponse = await resend.emails.send({
        from: `Meubles Karim <${senderEmail}>`,
        to: [estimate.contact_email],
        subject: subject,
        html: content,
      });
      
      console.log("Email sent successfully:", emailResponse);
      
      // Log the email sent
      const { error: logError } = await supabaseClient
        .from('email_logs')
        .insert({
          email: estimate.contact_email,
          subject: subject,
          related_id: estimate.id,
          related_type: 'estimate_status',
          success: true
        });
        
      if (logError) {
        console.error("Error logging email:", logError);
      }
    } catch (emailError) {
      console.error("Error sending email:", emailError);
      
      // Log the failed email attempt
      await supabaseClient
        .from('email_logs')
        .insert({
          email: estimate.contact_email,
          subject: subject,
          related_id: estimate.id,
          related_type: 'estimate_status',
          success: false,
          error_message: String(emailError)
        });
        
      return new Response(
        JSON.stringify({ 
          error: "Failed to send notification email", 
          details: emailError.message 
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Notification for status '${status}' sent to ${estimate.contact_email}`
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
