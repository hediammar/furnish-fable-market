
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts";

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EstimateRequestBody {
  email: string;
  estimate: any;
  items: Array<{
    product: {
      id: string;
      name: string;
      description: string;
      images: string[];
    };
    quantity: number;
  }>;
  language: 'en' | 'fr';
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
    });
  }

  try {
    // Parse request body
    const requestData: EstimateRequestBody = await req.json();
    const { email, estimate, items, language } = requestData;

    // Send email
    await sendEstimateEmail(email, estimate, items, language);

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

// Send email function
async function sendEstimateEmail(
  email: string, 
  estimate: any, 
  items: EstimateRequestBody['items'], 
  language: 'en' | 'fr'
): Promise<void> {
  try {
    // Connect to SMTP server
    const client = new SmtpClient();
    
    await client.connect({
      hostname: "smtp.gmail.com",
      port: 465,
      username: "hediammar100@gmail.com",
      password: "Hedi31032000",
      secure: true,
    });

    // Generate email content
    const subject = language === 'fr' ? "Estimation de prix - Meubles Karim" : "Price Estimate - Meubles Karim";
    
    // Create HTML email content
    const htmlContent = language === 'fr'
      ? `<div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #333333; text-align: center;">Estimation de Prix - Meubles Karim</h2>
          <p style="color: #666666; font-size: 16px;">Cher client,</p>
          <p style="color: #666666; font-size: 16px;">Nous vous remercions pour votre demande d'estimation. Voici un résumé des articles que vous avez sélectionnés:</p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr style="background-color: #f5f5f5;">
              <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Article</th>
              <th style="padding: 10px; text-align: center; border: 1px solid #ddd;">Quantité</th>
            </tr>
            ${items.map(item => `
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd;">${item.product.name}</td>
                <td style="padding: 10px; text-align: center; border: 1px solid #ddd;">${item.quantity}</td>
              </tr>
            `).join('')}
          </table>
          
          <p style="color: #666666; font-size: 16px;">Un membre de notre équipe vous contactera bientôt pour discuter des prix spécifiques et répondre à toutes vos questions.</p>
          <p style="color: #666666; font-size: 16px;">Cordialement,<br>L'équipe Meubles Karim</p>
        </div>`
      : `<div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #333333; text-align: center;">Price Estimate - Meubles Karim</h2>
          <p style="color: #666666; font-size: 16px;">Dear Customer,</p>
          <p style="color: #666666; font-size: 16px;">Thank you for your estimate request. Here is a summary of the items you have selected:</p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr style="background-color: #f5f5f5;">
              <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Item</th>
              <th style="padding: 10px; text-align: center; border: 1px solid #ddd;">Quantity</th>
            </tr>
            ${items.map(item => `
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd;">${item.product.name}</td>
                <td style="padding: 10px; text-align: center; border: 1px solid #ddd;">${item.quantity}</td>
              </tr>
            `).join('')}
          </table>
          
          <p style="color: #666666; font-size: 16px;">A member of our team will contact you soon to discuss specific pricing and answer any questions you may have.</p>
          <p style="color: #666666; font-size: 16px;">Best regards,<br>The Meubles Karim Team</p>
        </div>`;

    // Send email
    await client.send({
      from: "hediammar100@gmail.com",
      to: email,
      subject: subject,
      content: language === 'fr' 
        ? "Veuillez trouver ci-joint votre estimation de prix demandée. Un représentant vous contactera prochainement."
        : "Please find attached your requested price estimate. A representative will contact you shortly.",
      html: htmlContent
    });

    // Close connection
    await client.close();
    
    console.log("Email sent successfully to:", email);
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}
