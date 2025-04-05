
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

// Define CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseKey);

interface EstimateRequestBody {
  email: string;
  estimate: any;
  items: any[];
  language: string;
}

// Function to generate PDF-like content as HTML
function generateEstimateHTML(estimate: any, items: any[], language: string): string {
  const isEnglish = language !== 'fr';
  
  const productsTable = items.map((item, index) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${index + 1}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${item.product.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right;">${isEnglish ? 'Price on request' : 'Prix sur demande'}</td>
    </tr>
  `).join('');

  const addressParts = estimate.shipping_address.split(',').map((part: string) => part.trim());
  
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <title>${isEnglish ? 'Estimate Request' : 'Demande d\'estimation'} - #${estimate.id.substring(0, 8)}</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        color: #333;
        line-height: 1.6;
      }
      .container {
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
      }
      .header {
        text-align: center;
        margin-bottom: 30px;
      }
      .header h1 {
        color: #9F8E7D;
        margin-bottom: 5px;
      }
      .header p {
        color: #666;
        font-size: 14px;
      }
      .estimate-info {
        margin-bottom: 30px;
        display: flex;
        justify-content: space-between;
      }
      .estimate-details, .customer-details {
        width: 48%;
      }
      .section-title {
        font-size: 16px;
        font-weight: bold;
        color: #9F8E7D;
        margin-bottom: 10px;
        border-bottom: 1px solid #e2e8f0;
        padding-bottom: 5px;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 20px;
      }
      th {
        background-color: #f8f9fa;
        padding: 10px;
        text-align: left;
        font-weight: bold;
        border-bottom: 2px solid #e2e8f0;
      }
      .footer {
        margin-top: 40px;
        text-align: center;
        font-size: 14px;
        color: #666;
        border-top: 1px solid #e2e8f0;
        padding-top: 20px;
      }
      .note {
        background-color: #f8f9fa;
        padding: 15px;
        border-radius: 5px;
        margin-top: 30px;
      }
      .note p {
        margin: 0;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Meubles Karim</h1>
        <p>${isEnglish ? 'Estimate Request' : 'Demande d\'estimation'} #${estimate.id.substring(0, 8)}</p>
      </div>
      
      <div class="estimate-info">
        <div class="estimate-details">
          <div class="section-title">${isEnglish ? 'Estimate Details' : 'Détails de l\'estimation'}</div>
          <p><strong>${isEnglish ? 'Date' : 'Date'}:</strong> ${new Date(estimate.created_at).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US')}</p>
          <p><strong>${isEnglish ? 'Status' : 'Statut'}:</strong> ${estimate.status === 'pending' ? (isEnglish ? 'Pending' : 'En attente') : estimate.status}</p>
        </div>
        
        <div class="customer-details">
          <div class="section-title">${isEnglish ? 'Customer Information' : 'Informations client'}</div>
          <p><strong>${isEnglish ? 'Email' : 'Email'}:</strong> ${estimate.contact_email}</p>
          <p><strong>${isEnglish ? 'Phone' : 'Téléphone'}:</strong> ${estimate.contact_phone}</p>
          <p><strong>${isEnglish ? 'Address' : 'Adresse'}:</strong><br>
            ${addressParts.join('<br>')}
          </p>
        </div>
      </div>
      
      <div class="section-title">${isEnglish ? 'Requested Items' : 'Articles demandés'}</div>
      <table>
        <thead>
          <tr>
            <th style="width: 5%;">#</th>
            <th style="width: 55%;">${isEnglish ? 'Product' : 'Produit'}</th>
            <th style="width: 15%; text-align: center;">${isEnglish ? 'Quantity' : 'Quantité'}</th>
            <th style="width: 25%; text-align: right;">${isEnglish ? 'Price' : 'Prix'}</th>
          </tr>
        </thead>
        <tbody>
          ${productsTable}
        </tbody>
      </table>
      
      <div class="note">
        <p><strong>${isEnglish ? 'Note' : 'Note'}:</strong> ${isEnglish ? 'We will contact you shortly with a detailed price estimate for the requested items.' : 'Nous vous contacterons prochainement avec une estimation détaillée des prix pour les articles demandés.'}</p>
      </div>
      
      <div class="footer">
        <p>Meubles Karim | Route Hammamet Nord vers Nabeul, Hammamet, Tunisia, 8050 | (+216) 72 260 360</p>
        <p>${isEnglish ? 'Thank you for your interest in our products!' : 'Merci pour votre intérêt pour nos produits!'}</p>
      </div>
    </div>
  </body>
  </html>
  `;
}

// Main handler function
const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const body: EstimateRequestBody = await req.json();
    const { email, estimate, items, language } = body;
    
    if (!email || !estimate || !items) {
      throw new Error("Missing required fields in request body");
    }
    
    console.log("Preparing to send estimate email to:", email);
    
    // Generate HTML content for the email
    const htmlContent = generateEstimateHTML(estimate, items, language);

    // Send email using Supabase Edge Function (call another service or smtp)
    // Example using a mocked email service
    const emailSubject = language === 'fr' 
      ? `Demande d'estimation #${estimate.id.substring(0, 8)} - Meubles Karim`
      : `Estimate Request #${estimate.id.substring(0, 8)} - Meubles Karim`;
    
    // This would be replaced with a real email sending implementation
    // For now, we'll simulate a successful response
    
    // Note: In a real implementation, you would:
    // 1. Use a service like SendGrid, Resend, SMTP client, etc.
    // 2. Send an actual email with the HTML content
    // 3. Return a proper response with the email service's response
    
    // Example: If using actual SMTP or email service
    try {
      // This is where you'd implement the actual email sending
      // For example:
      // await sendEmail({
      //   to: email,
      //   subject: emailSubject,
      //   html: htmlContent
      // });
      
      // For now, let's log the attempt
      console.log("Would send email with subject:", emailSubject);
      console.log("Email recipient:", email);
      console.log("Email HTML length:", htmlContent.length);
      
      // Insert a record into a `email_logs` table to track the email
      const { error: logError } = await supabase
        .from('email_logs')
        .insert({
          email: email,
          subject: emailSubject,
          related_id: estimate.id,
          related_type: 'estimate',
          success: true
        });
        
      if (logError) {
        console.error("Error logging email send attempt:", logError);
      }
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Estimate email would be sent (email sending simulation)" 
        }), 
        { 
          status: 200, 
          headers: { 
            "Content-Type": "application/json",
            ...corsHeaders 
          } 
        }
      );
    } catch (emailError) {
      console.error("Error in email sending:", emailError);
      
      // Log the failed attempt
      await supabase
        .from('email_logs')
        .insert({
          email: email,
          subject: emailSubject,
          related_id: estimate.id,
          related_type: 'estimate',
          success: false,
          error_message: String(emailError)
        });
        
      throw new Error(`Failed to send email: ${String(emailError)}`);
    }
    
  } catch (error) {
    console.error("Error in send-estimate function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }), 
      { 
        status: 500, 
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders 
        } 
      }
    );
  }
};

// Start the server
serve(handler);
