import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Json } from '@/integrations/supabase/types';

export interface Estimate {
  id: string;
  user_id?: string;
  items: {
    product_id: string;
    name: string;
    quantity: number;
  }[];
  shipping_address: string | {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  contact_email: string;
  contact_phone: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  total_amount?: number;
  created_at: string;
  updated_at?: string;
}

type EstimateFromDB = {
  id: string;
  user_id?: string;
  items: Json;
  shipping_address: Json;
  contact_email: string;
  contact_phone: string;
  status: string;
  total_amount?: number;
  created_at: string;
  updated_at?: string;
}

const convertDbEstimateToEstimate = (dbEstimate: EstimateFromDB): Estimate => {
  const items = Array.isArray(dbEstimate.items) 
    ? dbEstimate.items 
    : (typeof dbEstimate.items === 'string' ? JSON.parse(dbEstimate.items as string) : []);
  
  let shippingAddress = dbEstimate.shipping_address;
  if (typeof shippingAddress === 'string') {
  } else if (typeof shippingAddress === 'object') {
    const addr = shippingAddress as any;
    shippingAddress = `${addr.street || ''}
${addr.city || ''}, ${addr.state || ''} ${addr.zip || ''}
${addr.country || ''}`.trim();
  }
  
  return {
    ...dbEstimate,
    items: items as Estimate['items'],
    shipping_address: shippingAddress as Estimate['shipping_address'],
    status: dbEstimate.status as Estimate['status']
  };
};

export const fetchEstimates = async (): Promise<Estimate[]> => {
  const { data, error } = await supabase
    .from('estimates')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching estimates:', error);
    throw error;
  }
  
  console.log('Fetched estimates data:', data);
  
  if (data) {
    return data.map(estimate => convertDbEstimateToEstimate(estimate as EstimateFromDB));
  }
  
  return [];
};

export const fetchUserEstimates = async (userId: string): Promise<Estimate[]> => {
  const { data, error } = await supabase
    .from('estimates')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching user estimates:', error);
    throw error;
  }
  
  if (data) {
    return data.map(estimate => convertDbEstimateToEstimate(estimate as EstimateFromDB));
  }
  
  return [];
};

export const fetchEstimateById = async (id: string): Promise<Estimate> => {
  const { data, error } = await supabase
    .from('estimates')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching estimate:', error);
    throw error;
  }
  
  return convertDbEstimateToEstimate(data as EstimateFromDB);
};

export const createEstimate = async (estimate: Omit<Estimate, 'id' | 'created_at' | 'updated_at' | 'status'>): Promise<Estimate> => {
  const { data, error } = await supabase
    .from('estimates')
    .insert([{
      ...estimate,
      status: 'pending'
    }])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating estimate:', error);
    throw error;
  }
  
  return convertDbEstimateToEstimate(data as EstimateFromDB);
};

export const updateEstimateStatus = async (id: string, status: Estimate['status']): Promise<Estimate> => {
  console.log(`Updating estimate ${id} to status: ${status}`);
  
  try {
    const { data, error } = await supabase
      .from('estimates')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select();
    
    if (error) {
      console.error('Error updating estimate status:', error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      throw new Error('No estimate found with the provided ID');
    }
    
    return convertDbEstimateToEstimate(data[0] as EstimateFromDB);
  } catch (error) {
    console.error('Error in updateEstimateStatus:', error);
    throw error;
  }
};

export const deleteEstimate = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('estimates')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting estimate:', error);
    throw error;
  }
};

export const getEstimatePreviewHtml = (estimate: Estimate, items: any[]): string => {
  const date = new Date(estimate.created_at);
  const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  
  let shippingAddressString = '';
  if (typeof estimate.shipping_address === 'string') {
    shippingAddressString = estimate.shipping_address;
  } else if (typeof estimate.shipping_address === 'object') {
    const addr = estimate.shipping_address as any;
    shippingAddressString = `${addr.street || ''}\n${addr.city || ''}, ${addr.state || ''} ${addr.zip || ''}\n${addr.country || ''}`.trim();
  }
  
  const statusColor = {
    pending: '#FFC107',
    approved: '#4CAF50',
    rejected: '#F44336',
    completed: '#2196F3'
  }[estimate.status];
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Estimate #${estimate.id}</title>
      <style>
        body {
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 1px solid #eee;
        }
        .estimate-id {
          font-size: 14px;
          color: #666;
        }
        .status {
          display: inline-block;
          padding: 5px 10px;
          border-radius: 4px;
          color: white;
          font-weight: bold;
          margin-top: 10px;
        }
        .section {
          margin-bottom: 20px;
        }
        .section-title {
          font-weight: bold;
          margin-bottom: 10px;
          color: #555;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        table th, table td {
          padding: 10px;
          text-align: left;
          border-bottom: 1px solid #eee;
        }
        table th {
          background-color: #f7f7f7;
        }
        .contact-info {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        .address {
          white-space: pre-line;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #eee;
          text-align: center;
          font-size: 12px;
          color: #777;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Estimate</h1>
        <div class="estimate-id">Estimate ID: ${estimate.id}</div>
        <div class="status" style="background-color: ${statusColor}">
          ${estimate.status.toUpperCase()}
        </div>
      </div>
      
      <div class="contact-info">
        <div class="section">
          <div class="section-title">Customer Information</div>
          <p>Email: ${estimate.contact_email}</p>
          <p>Phone: ${estimate.contact_phone}</p>
        </div>
        
        <div class="section">
          <div class="section-title">Estimate Details</div>
          <p>Date: ${formattedDate}</p>
          <p>Status: ${estimate.status}</p>
        </div>
      </div>
      
      <div class="section">
        <div class="section-title">Shipping Address</div>
        <p class="address">${shippingAddressString}</p>
      </div>
      
      <div class="section">
        <div class="section-title">Items</div>
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Quantity</th>
            </tr>
          </thead>
          <tbody>
            ${items.map(item => `
              <tr>
                <td>${item.name || (item.product ? item.product.name : 'Unknown Product')}</td>
                <td>${item.quantity}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      
      <div class="footer">
        <p>This is an automatically generated estimate document.</p>
      </div>
    </body>
    </html>
  `;
};
