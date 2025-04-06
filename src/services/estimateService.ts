import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';

export interface Estimate {
  id: string;
  user_id: string | null;
  total_amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  contact_email: string;
  contact_phone: string;
  shipping_address: string;
  items: {
    product_id: string;
    quantity: number;
    name: string;
  }[];
  created_at: string;
  updated_at?: string;
}

export const fetchEstimates = async (): Promise<Estimate[]> => {
  try {
    console.log('Fetching estimates...');
    const { data, error } = await supabase
      .from('estimates')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching estimates:', error);
      throw error;
    }

    console.log('Fetched estimates data:', data);

    // Properly parse and transform the data
    return (data || []).map((estimate: any) => {
      // Parse JSON fields if needed
      let parsedItems = estimate.items;
      let parsedAddress = estimate.shipping_address;
      
      try {
        // If items is a string, try to parse it
        if (typeof parsedItems === 'string') {
          parsedItems = JSON.parse(parsedItems);
        }
        
        // If the parsed result is not an array, ensure it is
        if (!Array.isArray(parsedItems)) {
          console.warn('Items is not an array:', parsedItems);
          parsedItems = [];
        }
        
        // Handle shipping_address parsing
        if (typeof parsedAddress === 'string') {
          try {
            parsedAddress = JSON.parse(parsedAddress);
          } catch (e) {
            // If it can't be parsed as JSON, use it as is (string address)
            console.log('Using shipping_address as string');
          }
        }
      } catch (error) {
        console.error('Error parsing JSON data:', error);
        parsedItems = Array.isArray(estimate.items) ? estimate.items : [];
        parsedAddress = estimate.shipping_address;
      }
      
      return {
        ...estimate,
        status: estimate.status as 'pending' | 'approved' | 'rejected' | 'completed',
        items: parsedItems,
        shipping_address: parsedAddress
      };
    }) as Estimate[];
  } catch (error) {
    console.error('Error in fetchEstimates:', error);
    return [];
  }
};

export const fetchEstimateById = async (id: string): Promise<Estimate> => {
  try {
    const { data, error } = await supabase
      .from('estimates')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching estimate:', error);
      throw error;
    }

    // Parse JSON fields if needed
    let parsedItems = data.items;
    let parsedAddress = data.shipping_address;
    
    try {
      // If items is a string, try to parse it
      if (typeof parsedItems === 'string') {
        parsedItems = JSON.parse(parsedItems);
      }
      
      // If the parsed result is not an array, ensure it is
      if (!Array.isArray(parsedItems)) {
        console.warn('Items is not an array:', parsedItems);
        parsedItems = [];
      }
      
      // Handle shipping_address parsing
      if (typeof parsedAddress === 'string') {
        try {
          parsedAddress = JSON.parse(parsedAddress);
        } catch (e) {
          // If it can't be parsed as JSON, use it as is (string address)
          console.log('Using shipping_address as string');
        }
      }
    } catch (error) {
      console.error('Error parsing JSON data:', error);
      parsedItems = Array.isArray(data.items) ? data.items : [];
      parsedAddress = data.shipping_address;
    }
    
    return {
      ...data,
      status: data.status as 'pending' | 'approved' | 'rejected' | 'completed',
      items: parsedItems,
      shipping_address: parsedAddress
    } as Estimate;
  } catch (error) {
    console.error('Error in fetchEstimateById:', error);
    throw error;
  }
};

export const updateEstimateStatus = async (id: string, status: Estimate['status']): Promise<Estimate> => {
  console.log(`Updating estimate ${id} to status: ${status}`);
  
  const { data, error } = await supabase
    .from('estimates')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating estimate status:', error);
    throw error;
  }
  
  console.log('Status updated successfully, returned data:', data);

  // Send estimate preview by email if approved
  if (status === 'approved') {
    try {
      // Get the full estimate with items
      const estimate = await fetchEstimateById(id);
      
      // Send estimate preview via email
      await sendEstimatePreview(estimate);
    } catch (emailError) {
      console.error('Error sending estimate preview email:', emailError);
      // We don't throw here to avoid preventing the status update
    }
  }

  return data as Estimate;
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

export const fetchUserEstimates = async (userId: string): Promise<Estimate[]> => {
  try {
    const { data, error } = await supabase
      .from('estimates')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user estimates:', error);
      throw error;
    }

    // Properly parse and transform the data
    return (data || []).map((estimate: any) => {
      // Parse JSON fields if needed
      let parsedItems = estimate.items;
      let parsedAddress = estimate.shipping_address;
      
      try {
        // If items is a string, try to parse it
        if (typeof parsedItems === 'string') {
          parsedItems = JSON.parse(parsedItems);
        }
        
        // If the parsed result is not an array, ensure it is
        if (!Array.isArray(parsedItems)) {
          console.warn('Items is not an array:', parsedItems);
          parsedItems = [];
        }
        
        // Handle shipping_address parsing
        if (typeof parsedAddress === 'string') {
          try {
            parsedAddress = JSON.parse(parsedAddress);
          } catch (e) {
            // If it can't be parsed as JSON, use it as is (string address)
            console.log('Using shipping_address as string');
          }
        }
      } catch (error) {
        console.error('Error parsing JSON data:', error);
        parsedItems = Array.isArray(estimate.items) ? estimate.items : [];
        parsedAddress = estimate.shipping_address;
      }
      
      return {
        ...estimate,
        status: estimate.status as 'pending' | 'approved' | 'rejected' | 'completed',
        items: parsedItems,
        shipping_address: parsedAddress
      };
    }) as Estimate[];
  } catch (error) {
    console.error('Error in fetchUserEstimates:', error);
    return [];
  }
};

export const sendEstimatePreview = async (estimate: Estimate): Promise<void> => {
  try {
    // Get product details for the items in the estimate
    const productIds = estimate.items.map(item => item.product_id);
    
    // Only fetch products if there are product IDs
    let items = estimate.items;
    
    if (productIds.length > 0) {
      const { data: products } = await supabase
        .from('products')
        .select('id, name, price, image')
        .in('id', productIds);
      
      if (products && products.length > 0) {
        // Enhance items with product details
        items = estimate.items.map(item => {
          const product = products.find(p => p.id === item.product_id);
          return {
            ...item,
            product: product || { name: item.name }
          };
        });
      }
    }
    
    // Call the edge function to send the estimate preview
    const { error } = await supabase.functions.invoke('send-estimate', {
      body: { 
        email: estimate.contact_email,
        estimate,
        items,
        language: 'en' // Default to English, can be made dynamic
      }
    });
    
    if (error) {
      console.error('Error invoking send-estimate function:', error);
      throw error;
    }
    
    console.log('Estimate preview sent successfully');
  } catch (error) {
    console.error('Error in sendEstimatePreview:', error);
    throw error;
  }
};

export const getEstimatePreviewHtml = (estimate: Estimate, items: any[]): string => {
  const productsTable = items.map((item, index) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${index + 1}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${item.product?.name || item.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right;">Price on request</td>
    </tr>
  `).join('');

  const addressParts = typeof estimate.shipping_address === 'string' 
    ? estimate.shipping_address.split(',').map(part => part.trim())
    : ['Address not available'];
  
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <title>Estimate Request - #${estimate.id.substring(0, 8)}</title>
    <style>
      body {
        font-family: 'Playfair Display', serif;
        color: #333;
        line-height: 1.6;
        background-color: #f9f8f6;
      }
      .container {
        max-width: 800px;
        margin: 0 auto;
        padding: 40px;
        background-color: #fff;
        box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        border: 1px solid #e0e0e0;
      }
      .header {
        text-align: center;
        margin-bottom: 40px;
        border-bottom: 2px solid #9F8E7D;
        padding-bottom: 20px;
      }
      .header h1 {
        color: #9F8E7D;
        margin-bottom: 5px;
        font-size: 32px;
        font-weight: normal;
      }
      .header p {
        color: #666;
        font-size: 16px;
      }
      .estimate-info {
        margin-bottom: 40px;
        display: flex;
        justify-content: space-between;
      }
      .estimate-details, .customer-details {
        width: 48%;
      }
      .section-title {
        font-size: 18px;
        font-weight: normal;
        color: #9F8E7D;
        margin-bottom: 15px;
        border-bottom: 1px solid #e2e8f0;
        padding-bottom: 8px;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 30px;
        font-family: 'Cormorant Garamond', serif;
      }
      th {
        background-color: #f8f6f2;
        padding: 15px 10px;
        text-align: left;
        font-weight: normal;
        border-bottom: 2px solid #e2e8f0;
        color: #9F8E7D;
      }
      .footer {
        margin-top: 50px;
        text-align: center;
        font-size: 14px;
        color: #666;
        border-top: 1px solid #e2e8f0;
        padding-top: 30px;
      }
      .note {
        background-color: #f8f6f2;
        padding: 20px;
        border-radius: 5px;
        margin-top: 40px;
        border-left: 4px solid #9F8E7D;
      }
      .note p {
        margin: 0;
      }
      .logo {
        text-align: center;
        margin-bottom: 20px;
      }
      .logo img {
        max-width: 180px;
      }
      .stamp {
        position: absolute;
        top: 80px;
        right: 80px;
        transform: rotate(15deg);
        color: rgba(159, 142, 125, 0.2);
        border: 4px solid rgba(159, 142, 125, 0.2);
        border-radius: 50%;
        padding: 15px;
        font-size: 24px;
        font-weight: bold;
        text-transform: uppercase;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="stamp">${estimate.status}</div>
      <div class="header">
        <div class="logo">
          <img src="https://via.placeholder.com/180x50?text=Meubles+Karim" alt="Meubles Karim Logo">
        </div>
        <h1>Exclusive Estimate</h1>
        <p>Request #${estimate.id.substring(0, 8)}</p>
      </div>
      
      <div class="estimate-info">
        <div class="estimate-details">
          <div class="section-title">Estimate Details</div>
          <p><strong>Date:</strong> ${new Date(estimate.created_at).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</p>
          <p><strong>Status:</strong> ${estimate.status.charAt(0).toUpperCase() + estimate.status.slice(1)}</p>
        </div>
        
        <div class="customer-details">
          <div class="section-title">Customer Information</div>
          <p><strong>Email:</strong> ${estimate.contact_email}</p>
          <p><strong>Phone:</strong> ${estimate.contact_phone}</p>
          <p><strong>Address:</strong><br>
            ${addressParts.join('<br>')}
          </p>
        </div>
      </div>
      
      <div class="section-title">Requested Items</div>
      <table>
        <thead>
          <tr>
            <th style="width: 5%;">#</th>
            <th style="width: 55%;">Product</th>
            <th style="width: 15%; text-align: center;">Quantity</th>
            <th style="width: 25%; text-align: right;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${productsTable}
        </tbody>
      </table>
      
      <div class="note">
        <p><strong>Note:</strong> We will contact you shortly with a detailed price estimate for the requested items.</p>
      </div>
      
      <div class="footer">
        <p>Meubles Karim | Route Hammamet Nord vers Nabeul, Hammamet, Tunisia, 8050 | (+216) 72 260 360</p>
        <p>Thank you for your interest in our exclusive collection!</p>
      </div>
    </div>
  </body>
  </html>
  `;
};
