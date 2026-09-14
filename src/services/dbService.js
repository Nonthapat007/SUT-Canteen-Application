import { supabase } from './supabase.js';

/**
 * Supabase Database Service for SUT Canteen Express
 * Handles CRUD operations and Realtime subscriptions for:
 * - Canteens
 * - Stalls (Restaurants)
 * - Menus
 * - Orders & Queue
 */

/**
 * Parses menu description and extracts custom options/toppings if embedded.
 */
export function parseMenuDescription(desc, name = '') {
  if (!desc || typeof desc !== 'string') {
    return { desc: '', options: getDefaultMenuOptions(name), isGrabAndGo: false };
  }
  let options = null;
  let isGrabAndGo = false;

  const match = desc.match(/<!--OPTIONS:(.*?)-->/s);
  if (match) {
    try {
      options = JSON.parse(match[1]);
    } catch (e) {}
  }

  const grabMatch = desc.match(/<!--GRAB_AND_GO:(.*?)-->/s);
  if (grabMatch) {
    isGrabAndGo = grabMatch[1] === 'true';
  }

  const cleanDesc = desc
    .replace(/<!--OPTIONS:(.*?)-->/s, '')
    .replace(/<!--GRAB_AND_GO:(.*?)-->/s, '')
    .trim();

  return {
    desc: cleanDesc,
    options: Array.isArray(options) ? options : getDefaultMenuOptions(name),
    isGrabAndGo,
  };
}

/**
 * Formats clean description, options array, and grab & go tag into a single storage string.
 */
export function formatMenuDescription(cleanDesc, options, isGrabAndGo = false) {
  let base = (cleanDesc || '').trim();
  if (Array.isArray(options)) {
    base += `\n<!--OPTIONS:${JSON.stringify(options)}-->`;
  }
  if (isGrabAndGo) {
    base += `\n<!--GRAB_AND_GO:true-->`;
  }
  return base;
}

/**
 * Smart context-aware default options based on food type/name
 */
export function getDefaultMenuOptions(name = '') {
  const n = (name || '').toLowerCase();
  if (n.includes('เตี๋ยว') || n.includes('เส้น') || n.includes('บะหมี่') || n.includes('มาม่า') || n.includes('เกาเหลา') || n.includes('ต้มยำ')) {
    return [
      { id: 'n1', name: 'เส้นเล็ก', price: 0 },
      { id: 'n2', name: 'เส้นหมี่', price: 0 },
      { id: 'n3', name: 'บะหมี่', price: 0 },
      { id: 'n4', name: 'ไม่ใส่ถั่วงอก', price: 0 },
      { id: 'n5', name: 'เผ็ดน้อย', price: 0 },
      { id: 'n6', name: 'พิเศษ (+10฿)', price: 10 },
      { id: 'n7', name: 'เพิ่มลูกชิ้น (+10฿)', price: 10 },
    ];
  }
  if (n.includes('น้ำ') || n.includes('ชา') || n.includes('กาแฟ') || n.includes('ปั่น') || n.includes('โซดา') || n.includes('นม')) {
    return [
      { id: 'd1', name: 'หวานปกติ (100%)', price: 0 },
      { id: 'd2', name: 'หวานน้อย (50%)', price: 0 },
      { id: 'd3', name: 'ไม่หวาน (0%)', price: 0 },
      { id: 'd4', name: 'เพิ่มไข่มุก / ท็อปปิ้ง (+10฿)', price: 10 },
    ];
  }
  // Default for rice / stir-fry / made-to-order (กะเพรา, ข้าว, ลาบ, etc.)
  return [
    { id: 'r1', name: 'ไข่ดาว (+10฿)', price: 10 },
    { id: 'r2', name: 'ไข่เจียว (+10฿)', price: 10 },
    { id: 'r3', name: 'พิเศษ (+10฿)', price: 10 },
    { id: 'r4', name: 'เผ็ดน้อย', price: 0 },
    { id: 'r5', name: 'เผ็ดปกติ', price: 0 },
    { id: 'r6', name: 'เผ็ดจัดจ้าน 🔥', price: 0 },
    { id: 'r7', name: 'ไม่ใส่ผัก', price: 0 },
  ];
}

export const dbService = {
  // --- CANTEENS ---
  async getCanteens() {
    try {
      const { data, error } = await supabase
        .from('canteens')
        .select('*')
        .order('id', { ascending: true });
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error fetching canteens:', err);
      return [];
    }
  },

  // --- STALLS ---
  async getStalls(canteenId = null) {
    try {
      let query = supabase
        .from('stalls')
        .select('*, menus(*)')
        .order('created_at', { ascending: false });

      if (canteenId) {
        query = query.eq('canteen_id', canteenId);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Transform menus to match camelCase expected by client components
      return (data || []).map((stall) => ({
        id: stall.id,
        canteenId: stall.canteen_id,
        name: stall.name,
        thaiName: stall.thai_name || stall.name,
        category: stall.category || 'Made-to-Order',
        imageUrl: stall.image_url || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
        waitMinutes: stall.wait_minutes || 5,
        rating: Number(stall.rating) || 5.0,
        isOpen: stall.is_open !== false,
        fastest: stall.fastest || false,
        ownerPhone: stall.owner_phone || '',
        menus: (stall.menus || []).map((m) => {
          const parsed = parseMenuDescription(m.description, m.name || m.thai_name);
          return {
            id: m.id,
            stallId: m.stall_id,
            name: m.name,
            thaiName: m.thai_name || m.name,
            price: Number(m.price),
            prepTime: m.prep_time || 5,
            desc: parsed.desc,
            description: parsed.desc,
            options: Array.isArray(m.options) ? m.options : Array.isArray(parsed.options) ? parsed.options : [],
            imageUrl: m.image_url || '',
            image: m.image_url || '',
            popular: m.is_popular || false,
            isPopular: m.is_popular || false,
            isGrabAndGo: parsed.isGrabAndGo || false,
            available: m.is_available !== false,
            category: stall.category || 'ทั้งหมด',
          };
        }),
      }));
    } catch (err) {
      console.error('Error fetching stalls:', err);
      return [];
    }
  },

  async createStall({
    canteenId,
    name,
    thaiName,
    category = 'Made-to-Order',
    imageUrl = '',
    waitMinutes = 5,
    ownerPhone = '',
  }) {
    try {
      const defaultStallImage =
        imageUrl ||
        'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80';

      const { data, error } = await supabase
        .from('stalls')
        .insert([
          {
            canteen_id: canteenId,
            name: name.trim(),
            thai_name: (thaiName || name).trim(),
            category,
            image_url: defaultStallImage,
            wait_minutes: waitMinutes,
            rating: 5.0,
            is_open: true,
            fastest: false,
            owner_phone: ownerPhone,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error creating stall:', err);
      throw err;
    }
  },

  async updateStallStatus(stallId, isOpen) {
    try {
      const { data, error } = await supabase
        .from('stalls')
        .update({ is_open: isOpen })
        .eq('id', stallId)
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error updating stall status:', err);
      throw err;
    }
  },

  async updateStall(stallId, fields) {
    try {
      const payload = {};
      if (fields.name !== undefined) payload.name = fields.name.trim();
      if (fields.thaiName !== undefined) payload.thai_name = fields.thaiName.trim();
      if (fields.imageUrl !== undefined) payload.image_url = fields.imageUrl;
      if (fields.category !== undefined) payload.category = fields.category;
      if (fields.isOpen !== undefined) payload.is_open = fields.isOpen;
      if (fields.waitMinutes !== undefined) payload.wait_minutes = Number(fields.waitMinutes);

      const { data, error } = await supabase
        .from('stalls')
        .update(payload)
        .eq('id', stallId)
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error updating stall in Supabase:', err);
      throw err;
    }
  },

  // --- MENUS ---
  async getMenusByStall(stallId) {
    try {
      const { data, error } = await supabase
        .from('menus')
        .select('*')
        .eq('stall_id', stallId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return (data || []).map((m) => {
        const parsed = parseMenuDescription(m.description, m.name || m.thai_name);
        return {
          id: m.id,
          stallId: m.stall_id,
          name: m.name,
          thaiName: m.thai_name || m.name,
          price: Number(m.price),
          prepTime: m.prep_time || 5,
          desc: parsed.desc,
          description: parsed.desc,
          options: Array.isArray(m.options) ? m.options : Array.isArray(parsed.options) ? parsed.options : [],
          imageUrl: m.image_url || '',
          image: m.image_url || '',
          popular: m.is_popular || false,
          isPopular: m.is_popular || false,
          isGrabAndGo: parsed.isGrabAndGo || false,
          available: m.is_available !== false,
        };
      });
    } catch (err) {
      console.error('Error fetching menus:', err);
      return [];
    }
  },

  async createMenu({
    stallId,
    name,
    thaiName,
    price,
    prepTime = 5,
    description = '',
    options = [],
    imageUrl = '',
    isPopular = false,
    isGrabAndGo = false,
  }) {
    try {
      const formattedDesc = formatMenuDescription(description, options, isGrabAndGo);
      const { data, error } = await supabase
        .from('menus')
        .insert([
          {
            stall_id: stallId,
            name: name.trim(),
            thai_name: (thaiName || name).trim(),
            price: Number(price),
            prep_time: Number(prepTime),
            description: formattedDesc,
            image_url: imageUrl ? imageUrl.trim() : null,
            is_popular: isPopular,
            is_available: true,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error creating menu:', err);
      throw err;
    }
  },

  async toggleMenuAvailable(menuId, isAvailable) {
    try {
      const { data, error } = await supabase
        .from('menus')
        .update({ is_available: isAvailable })
        .eq('id', menuId)
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error toggling menu availability:', err);
      throw err;
    }
  },

  async updateMenu(menuId, fields) {
    try {
      const payload = {};
      if (fields.name !== undefined) payload.name = fields.name.trim();
      if (fields.thaiName !== undefined) payload.thai_name = fields.thaiName.trim();
      if (fields.price !== undefined) payload.price = Number(fields.price);
      if (fields.prepTime !== undefined) payload.prep_time = Number(fields.prepTime);
      if (fields.description !== undefined || fields.options !== undefined || fields.isGrabAndGo !== undefined) {
        payload.description = formatMenuDescription(
          fields.description !== undefined ? fields.description : '',
          fields.options !== undefined ? fields.options : [],
          fields.isGrabAndGo !== undefined ? fields.isGrabAndGo : false
        );
      }
      if (fields.imageUrl !== undefined) payload.image_url = fields.imageUrl ? fields.imageUrl.trim() : null;
      if (fields.isPopular !== undefined) payload.is_popular = fields.isPopular;
      if (fields.isAvailable !== undefined) payload.is_available = fields.isAvailable;

      const { data, error } = await supabase
        .from('menus')
        .update(payload)
        .eq('id', menuId)
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error updating menu in Supabase:', err);
      throw err;
    }
  },

  async deleteMenu(menuId) {
    try {
      const { error } = await supabase.from('menus').delete().eq('id', menuId);
      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Error deleting menu:', err);
      throw err;
    }
  },

  // --- ORDERS ---
  async getOrders(filter = {}) {
    try {
      let query = supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (filter.stallId) {
        query = query.eq('stall_id', filter.stallId);
      }
      if (filter.canteenId) {
        query = query.eq('canteen_id', filter.canteenId);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map((o) => ({
        id: o.id,
        orderNumber: o.order_number,
        type: o.type,
        status: o.status,
        studentName: o.student_name,
        studentPhone: o.student_phone,
        canteenId: o.canteen_id,
        canteenName: o.canteen_name,
        stallId: o.stall_id,
        stallName: o.stall_name,
        items: o.items || [],
        totalAmount: Number(o.total_amount),
        pickupQrPin: o.pickup_qr_pin,
        specialNotes: o.special_notes,
        statusLogs: o.status_logs || [],
        createdAt: o.created_at,
      }));
    } catch (err) {
      console.error('Error fetching orders:', err);
      return [];
    }
  },

  async createOrder(order) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .insert([
          {
            id: order.id,
            order_number: order.orderNumber,
            type: order.type || 'PREDICTIVE_SLOTTING',
            status: order.status || 'HOLDING_IN_CLOUD',
            student_name: order.studentName || 'นักศึกษา มทส.',
            student_phone: order.studentPhone || '085-555-9999',
            canteen_id: order.canteenId,
            canteen_name: order.canteenName,
            stall_id: order.stallId,
            stall_name: order.stallName,
            items: order.items || [],
            total_amount: order.totalAmount || 0,
            pickup_qr_pin: order.pickupQrPin || '1234',
            special_notes: order.specialNotes || '',
            status_logs: order.statusLogs || [],
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error creating order in Supabase:', err);
      return null;
    }
  },

  async updateOrderStatus(orderId, newStatus, newLogEntry = null) {
    try {
      // First get current status_logs
      const { data: currentOrder } = await supabase
        .from('orders')
        .select('status_logs')
        .eq('id', orderId)
        .single();

      const updatedLogs = currentOrder?.status_logs || [];
      if (newLogEntry) {
        updatedLogs.push(newLogEntry);
      }

      const { data, error } = await supabase
        .from('orders')
        .update({
          status: newStatus,
          status_logs: updatedLogs,
        })
        .eq('id', orderId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error updating order status in Supabase:', err);
      return null;
    }
  },

  // --- REALTIME SUBSCRIPTIONS ---
  subscribeToStalls(onUpdate) {
    try {
      const channelId = `stalls_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      const channel = supabase
        .channel(channelId)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'stalls' }, onUpdate)
        .subscribe();
      return () => {
        try {
          supabase.removeChannel(channel);
        } catch (e) {}
      };
    } catch (err) {
      console.error('Error subscribing to stalls:', err);
      return () => {};
    }
  },

  subscribeToMenus(onUpdate) {
    try {
      const channelId = `menus_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      const channel = supabase
        .channel(channelId)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'menus' }, onUpdate)
        .subscribe();
      return () => {
        try {
          supabase.removeChannel(channel);
        } catch (e) {}
      };
    } catch (err) {
      console.error('Error subscribing to menus:', err);
      return () => {};
    }
  },

  subscribeToOrders(onUpdate) {
    try {
      const channelId = `orders_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      const channel = supabase
        .channel(channelId)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, onUpdate)
        .subscribe();
      return () => {
        try {
          supabase.removeChannel(channel);
        } catch (e) {}
      };
    } catch (err) {
      console.error('Error subscribing to orders:', err);
      return () => {};
    }
  },
};

export default dbService;
