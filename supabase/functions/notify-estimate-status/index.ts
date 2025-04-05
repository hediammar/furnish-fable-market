
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

export const handler = async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: 'Missing environment variables' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { id, status } = await req.json();
    
    if (!id || !status) {
      return new Response(
        JSON.stringify({ error: 'Missing id or status in request body' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Fetch the estimate details
    const { data: estimate, error: estimateError } = await supabase
      .from('estimates')
      .select('*')
      .eq('id', id)
      .single();
      
    if (estimateError) {
      console.error('Error fetching estimate:', estimateError);
      return new Response(
        JSON.stringify({ error: 'Estimate not found' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Send email notification
    // Note: In a real implementation, you would use an email service like SendGrid, Mailgun, etc.
    console.log(`Sending email notification for estimate ${id} with status ${status} to ${estimate.contact_email}`);
    
    // Simulate email sending
    const emailContent = createEmailContent(estimate, status);

    // You would call your email service here
    // For now, we're just logging the content
    console.log(`Email content: ${emailContent}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Notification sent for estimate ${id} with status ${status}` 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in notify-estimate-status function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
};

function createEmailContent(estimate: any, status: string): string {
  let subject = '';
  let bodyContent = '';
  
  switch (status) {
    case 'approved':
      subject = 'Your Estimate Has Been Approved';
      bodyContent = `
        <p>We're pleased to inform you that your estimate request has been approved.</p>
        <p>Our team will be in touch with you shortly to discuss the next steps.</p>
      `;
      break;
    case 'rejected':
      subject = 'Update Regarding Your Estimate Request';
      bodyContent = `
        <p>Thank you for your interest in our products.</p>
        <p>After reviewing your estimate request, we regret to inform you that we are unable to proceed with it at this time.</p>
        <p>Please feel free to contact us if you have any questions or would like to discuss alternatives.</p>
      `;
      break;
    case 'completed':
      subject = 'Your Order Has Been Completed';
      bodyContent = `
        <p>We're happy to inform you that your order has been completed.</p>
        <p>Thank you for choosing our services. We hope you're satisfied with your purchase.</p>
      `;
      break;
    default:
      subject = 'Update on Your Estimate Request';
      bodyContent = `
        <p>We have an update regarding your estimate request.</p>
        <p>The current status is: ${status}</p>
      `;
  }
  
  return `
    <html>
      <head>
        <title>${subject}</title>
      </head>
      <body>
        <h1>${subject}</h1>
        <p>Dear Customer,</p>
        ${bodyContent}
        <p>Estimate Details:</p>
        <ul>
          <li>Estimate ID: ${estimate.id}</li>
          <li>Total Amount: $${estimate.total_amount}</li>
          <li>Status: ${status}</li>
        </ul>
        <p>Thank you for choosing Meubles Karim!</p>
        <p>Best regards,<br>The Meubles Karim Team</p>
      </body>
    </html>
  `;
}

Deno.serve(handler);
