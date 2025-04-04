
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const buildHtmlFromBlocks = (blocks: any[]) => {
  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { 
          font-family: Arial, sans-serif; 
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          text-align: center;
          padding: 20px 0;
        }
        .footer {
          text-align: center;
          padding: 20px 0;
          font-size: 12px;
          color: #888;
          border-top: 1px solid #eee;
          margin-top: 30px;
        }
        img {
          max-width: 100%;
          height: auto;
        }
        .button {
          display: inline-block;
          padding: 10px 20px;
          background-color: #9F8E7D;
          color: white;
          text-decoration: none;
          border-radius: 4px;
        }
        .product-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }
        .product-item {
          border: 1px solid #eee;
          padding: 10px;
          border-radius: 4px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="https://meubleskarim.com/logo.svg" alt="Meubles Karim" height="50">
        </div>
  `;

  // Add blocks
  blocks.forEach((block) => {
    switch (block.type) {
      case 'text':
        html += `<div style="margin-bottom: 20px; text-align: center;">${block.content.text}</div>`;
        break;
      case 'image':
        html += `
          <div style="margin-bottom: 20px; text-align: center;">
            <img src="${block.content.src}" alt="${block.content.alt || ''}" style="max-width: 100%;">
          </div>
        `;
        break;
      case 'button':
        html += `
          <div style="margin-bottom: 20px; text-align: center;">
            <a href="${block.content.url}" class="button" target="_blank" rel="noopener noreferrer">${block.content.text}</a>
          </div>
        `;
        break;
      case 'spacer':
        html += `<div style="height: ${block.content.height}px;"></div>`;
        break;
      case 'divider':
        html += `<hr style="border: none; border-top: 1px solid ${block.content.color}; margin: 20px 0;">`;
        break;
      case 'products':
        // Products would be handled here
        html += `<div class="product-grid">`;
        // In a real implementation, you would fetch product details here
        html += `</div>`;
        break;
    }
  });

  // Close the HTML
  html += `
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Meubles Karim. All rights reserved.</p>
          <p>
            <a href="https://meubleskarim.com/unsubscribe" style="color: #9F8E7D;">Unsubscribe</a> &bull;
            <a href="https://meubleskarim.com/privacy" style="color: #9F8E7D;">Privacy Policy</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  return html;
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { newsletterId } = await req.json();

    // In a real implementation, you would:
    // 1. Fetch the newsletter from the database
    // 2. Fetch all subscribers
    // 3. Send the email to each subscriber

    const { data: newsletter, error: newsletterError } = await (Deno as any).env.SUPABASE.from("newsletters")
      .select("*")
      .eq("id", newsletterId)
      .single();

    if (newsletterError) {
      throw new Error(`Error fetching newsletter: ${newsletterError.message}`);
    }

    const { data: subscribers, error: subscribersError } = await (Deno as any).env.SUPABASE.from("newsletter_subscribers")
      .select("*");

    if (subscribersError) {
      throw new Error(`Error fetching subscribers: ${subscribersError.message}`);
    }

    // Build the email HTML from the newsletter content
    const html = buildHtmlFromBlocks(newsletter.content);

    // For each subscriber, send the email
    const emailPromises = subscribers.map(async (subscriber: any) => {
      const { error } = await resend.emails.send({
        from: "Meubles Karim <newsletter@meubleskarim.com>",
        to: [subscriber.email],
        subject: newsletter.subject,
        html: html,
      });

      if (error) {
        console.error(`Failed to send email to ${subscriber.email}:`, error);
      } else {
        console.log(`Email sent to ${subscriber.email}`);
      }
    });

    await Promise.all(emailPromises);

    // Mark the newsletter as sent
    await (Deno as any).env.SUPABASE.from("newsletters")
      .update({ sent_at: new Date().toISOString() })
      .eq("id", newsletterId);

    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in send-newsletter function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
