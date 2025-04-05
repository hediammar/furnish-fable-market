
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { encode as base64Encode } from "https://deno.land/std@0.190.0/encoding/base64.ts";

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
    const { email, estimate, items, language } = await req.json();

    if (!email || !estimate || !items) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // In a real environment, you would generate a PDF here
    // For now, we'll just send an email
    const emailSubject = language === 'fr' 
      ? "Votre demande d'estimation de Meubles Karim" 
      : "Your Estimate Request from Meubles Karim";

    // Create the email content
    let itemsList = "";
    items.forEach(item => {
      itemsList += `<tr>
        <td style="padding: 8px; border: 1px solid #ddd;">${item.product.name}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${item.quantity}</td>
      </tr>`;
    });

    const emailContent = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            h1 { color: #333366; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th { background-color: #f2f2f2; text-align: left; padding: 12px 8px; border: 1px solid #ddd; }
            td { padding: 8px; border: 1px solid #ddd; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>${language === 'fr' ? 'Demande d\'estimation' : 'Estimate Request'}</h1>
            <p>${language === 'fr' ? 'Cher(e)' : 'Dear'} ${email},</p>
            <p>${language === 'fr' 
              ? 'Nous avons bien reçu votre demande d\'estimation. Notre équipe la traitera dans les plus brefs délais et vous contactera avec une estimation détaillée.' 
              : 'We have received your estimate request. Our team will process it shortly and contact you with a detailed estimate.'}</p>
            
            <h2>${language === 'fr' ? 'Détails de la demande' : 'Request Details'}</h2>
            <p><strong>${language === 'fr' ? 'Numéro de référence' : 'Reference Number'}:</strong> ${estimate.id}</p>
            <p><strong>${language === 'fr' ? 'Date de la demande' : 'Request Date'}:</strong> ${new Date(estimate.created_at).toLocaleDateString()}</p>
            
            <h3>${language === 'fr' ? 'Articles' : 'Items'}</h3>
            <table>
              <thead>
                <tr>
                  <th>${language === 'fr' ? 'Produit' : 'Product'}</th>
                  <th>${language === 'fr' ? 'Quantité' : 'Quantity'}</th>
                </tr>
              </thead>
              <tbody>
                ${itemsList}
              </tbody>
            </table>
            
            <h3>${language === 'fr' ? 'Adresse de livraison' : 'Shipping Address'}</h3>
            <p>${estimate.shipping_address}</p>
            
            <p>${language === 'fr' 
              ? 'Nous vous remercions d\'avoir choisi Meubles Karim. Si vous avez des questions, n\'hésitez pas à nous contacter.' 
              : 'Thank you for choosing Meubles Karim. If you have any questions, please don\'t hesitate to contact us.'}</p>
            
            <p>${language === 'fr' ? 'Cordialement,' : 'Sincerely,'}<br>L'équipe Meubles Karim</p>
          </div>
        </body>
      </html>
    `;

    // For this demo, we'll just log the email we would have sent
    console.log(`Would send email to: ${email}`);
    console.log(`Subject: ${emailSubject}`);
    console.log(`Content: ${emailContent}`);

    // In a real application, you would send the email here using a service like SendGrid, Mailgun, etc.
    // For now, we'll just simulate success

    return new Response(
      JSON.stringify({ success: true, message: "Estimate email sent successfully" }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in send-estimate function:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
