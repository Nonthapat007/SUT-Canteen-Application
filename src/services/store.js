// Reactive State Store & Real-time Event Bus for SUT Canteen Express connected to Supabase
import { SUT_BUILDINGS, SUT_CANTEENS, INITIAL_GRAB_AND_GO_ITEMS } from '../constants/campusData';
import { getSmartDefaultCanteen } from './locationService';
import dbService from './dbService.js';

class CanteenStore {
  constructor() {
    this.currentRole = 'consumer'; // 'consumer' | 'vendor'
    this.currentBuilding = SUT_BUILDINGS[0]; // B1
    
    // Default canteen starts with empty stalls as requested (loaded from Supabase)
    const defaultCanteen = getSmartDefaultCanteen(SUT_BUILDINGS[0].id);
    this.selectedCanteen = {
      ...defaultCanteen,
      stalls: [],
    };
    this.stalls = [];
    this.selectedVendorStallId = null;
    
    // Live inventory for Grab & Go
    this.grabAndGoItems = INITIAL_GRAB_AND_GO_ITEMS ? [...INITIAL_GRAB_AND_GO_ITEMS] : [];

    // Real-time Orders Database
    this.orders = [];

    this.walletBalance = 0;
    this.rewardsPoints = 0;

    this.activeToast = null;
    this.listeners = new Set();

    // Start background timer ticker for countdowns and predictive auto-release
    this.startTicker();

    // Initialize Supabase Sync
    this.initSupabaseSync();
  }

  async initSupabaseSync() {
    try {
      await this.reloadStalls();
      await this.reloadOrders();

      // Realtime subscriptions
      dbService.subscribeToStalls(() => {
        this.reloadStalls();
      });

      dbService.subscribeToMenus(() => {
        this.reloadStalls();
      });

      dbService.subscribeToOrders(() => {
        this.reloadOrders();
      });
    } catch (err) {
      console.error('Error initializing Supabase sync in CanteenStore:', err);
    }
  }

  async reloadStalls() {
    try {
      const allStalls = await dbService.getStalls();
      this.stalls = allStalls;

      if (this.selectedCanteen) {
        this.selectedCanteen = {
          ...this.selectedCanteen,
          stalls: allStalls.filter((s) => s.canteenId === this.selectedCanteen.id),
        };
      }
      this.notify();
    } catch (err) {
      console.error('Failed to reload stalls:', err);
    }
  }

  async reloadOrders() {
    try {
      const liveOrders = await dbService.getOrders();
      this.orders = liveOrders || [];
      this.notify();
    } catch (err) {
      console.error('Failed to reload orders:', err);
    }
  }

  // Reactive subscription
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    this.listeners.forEach((listener) => {
      try {
        listener(this.getState());
      } catch (e) {
        console.error('Listener notification error:', e);
      }
    });
  }

  getState() {
    return {
      currentRole: this.currentRole,
      currentBuilding: this.currentBuilding,
      selectedCanteen: this.selectedCanteen,
      selectedVendorStallId: this.selectedVendorStallId,
      stalls: this.stalls,
      grabAndGoItems: this.grabAndGoItems,
      orders: this.orders,
      activeToast: this.activeToast,
      walletBalance: this.walletBalance,
      rewardsPoints: this.rewardsPoints,
    };
  }

  topUpWallet(amount) {
    this.walletBalance += amount;
    this.rewardsPoints += Math.floor(amount * 0.1);
    this.triggerToast(`เติมเงินสำเร็จ ฿${amount} (ยอดคงเหลือ ฿${this.walletBalance})`);
    this.notify();
  }

  // Switch role between Consumer (Student) and Vendor KDS (Tablet)
  setRole(role) {
    this.currentRole = role;
    this.notify();
  }

  // Simulated GPS or building switch
  setBuilding(building) {
    this.currentBuilding = building;
    const canteen = getSmartDefaultCanteen(building.id);
    this.setSelectedCanteen(canteen);
    this.triggerToast(`📍 ระบุตำแหน่ง: ${building.name} (โรงอาหารใกล้สุด: ${this.selectedCanteen.shortName || this.selectedCanteen.name})`);
  }

  // Select target canteen manually
  setSelectedCanteen(canteen) {
    const canteenStalls = this.stalls
      ? this.stalls.filter((s) => s.canteenId === canteen.id)
      : [];

    this.selectedCanteen = {
      ...canteen,
      stalls: canteenStalls,
    };
    this.notify();
  }

  // Select stall for Vendor KDS view
  setSelectedVendorStall(stallId) {
    this.selectedVendorStallId = stallId;
    this.notify();
  }

  // Place a new Predictive Slotting order
  async createPredictiveOrder({
    canteen,
    stall,
    items,
    totalAmount,
    departureOffsetMinutes,
    walkingMinutes,
    prepMinutes,
    queueMinutes,
    holdSecondsRemaining,
    specialNotes = '',
    currentUser = null,
  }) {
    const orderNum = `A-${Math.floor(10 + Math.random() * 90)}`;
    const newOrder = {
      id: `SUT-${Math.floor(1000 + Math.random() * 9000)}`,
      orderNumber: orderNum,
      type: 'PREDICTIVE_SLOTTING',
      status: holdSecondsRemaining <= 0 ? 'RELEASED_TO_KDS' : 'HOLDING_IN_CLOUD',
      studentName: currentUser?.fullName || 'นักศึกษา มทส. (คุณ)',
      studentPhone: currentUser?.phoneNumber || '085-555-9999',
      studentId: currentUser?.studentId || currentUser?.id || '',
      userEmail: currentUser?.email || '',
      canteenId: canteen.id,
      canteenName: canteen.name,
      stallId: stall.id,
      stallName: stall.thaiName || stall.name,
      items: items.map((item) => ({ ...item })),
      totalAmount,
      departureBuilding: this.currentBuilding.name,
      walkingMinutes,
      departureOffsetMinutes,
      prepMinutes,
      queueMinutes,
      holdSecondsRemaining: Math.max(0, holdSecondsRemaining),
      totalSecondsHolding: Math.max(1, holdSecondsRemaining),
      specialNotes,
      pickupQrPin: `${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString(),
      statusLogs: [
        {
          time: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
          text:
            holdSecondsRemaining <= 0
              ? 'ส่งเข้าหน้าจอครัวแม่ค้าทันที'
              : `ระบบหน่วงเวลาบนคลาวด์ (อีก ${Math.ceil(holdSecondsRemaining / 60)} นาที จึงปล่อยให้ร้านปรุง)`,
        },
      ],
    };

    // Deduct order amount from user wallet
    this.walletBalance = Math.max(0, this.walletBalance - totalAmount);
    this.rewardsPoints += Math.max(1, Math.floor(totalAmount * 0.5));

    this.orders.unshift(newOrder);
    this.triggerToast(`สั่งอาหารล่วงหน้าสำเร็จ! ชำระ ฿${totalAmount} (Wallet คงเหลือ ฿${this.walletBalance})`);
    this.notify();

    // Persist to Supabase
    dbService.createOrder(newOrder);

    return newOrder;
  }

  // Place a Fast-Lane Grab & Go order (Immediate 0-wait) with quantity support
  async createGrabAndGoOrder(item, quantity = 1, currentUser = null) {
    const qty = Math.max(1, Number(quantity) || 1);
    const invItem = this.grabAndGoItems.find((i) => i.id === item.id);
    if (invItem) {
      if (invItem.stock < qty) {
        this.triggerToast(`ขออภัย สินค้าเหลือเพียง ${invItem.stock} ชิ้น!`);
        return null;
      }
      invItem.stock -= qty;
      invItem.badge = invItem.stock > 0 ? `เหลือ ${invItem.stock} กล่อง` : 'หมดชั่วคราว';
    }

    const orderNum = `G-${Math.floor(10 + Math.random() * 90)}`;
    const totalAmount = (Number(item.price) || 0) * qty;
    const newOrder = {
      id: `SUT-${Math.floor(1000 + Math.random() * 9000)}`,
      orderNumber: orderNum,
      type: 'GRAB_AND_GO',
      status: 'READY_FOR_PICKUP',
      studentName: currentUser?.fullName || 'นักศึกษา มทส. (คุณ)',
      studentPhone: currentUser?.phoneNumber || '085-555-9999',
      studentId: currentUser?.studentId || currentUser?.id || '',
      userEmail: currentUser?.email || '',
      canteenId: item.canteenId,
      canteenName: item.canteenName,
      stallId: item.stallId || null,
      stallName: item.stallName || item.pickupSpot || 'ร้านค้า มทส.',
      items: [
        {
          name: item.name,
          qty: qty,
          price: Number(item.price) || 0,
          options: ['เมนูพร้อมหยิบทันที (Grab & Go 0 นาที)'],
        },
      ],
      totalAmount,
      pickupSpot: item.pickupSpot,
      pickupQrPin: `${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString(),
      statusLogs: [
        {
          time: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
          text: `สั่งซื้อ ${qty} ชิ้น ตัดสต็อกแล้ว รับอาหารได้ทันทีที่จุด Fast-Lane`,
        },
      ],
    };

    // Deduct order amount from user wallet
    this.walletBalance = Math.max(0, this.walletBalance - totalAmount);
    this.rewardsPoints += Math.max(1, Math.floor(totalAmount * 0.5));

    this.orders.unshift(newOrder);
    this.triggerToast(`⚡ ได้รับบัตร Grab & Go Pass (${item.name} x${qty})! ชำระ ฿${totalAmount} (Wallet คงเหลือ ฿${this.walletBalance})`);
    this.notify();

    // Persist to Supabase
    dbService.createOrder(newOrder);

    return newOrder;
  }

  // Vendor KDS Actions (1-Tap updates)
  async updateOrderStatus(orderId, newStatus) {
    const order = this.orders.find((o) => o.id === orderId);
    if (!order) return;

    order.status = newStatus;
    const timeStr = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
    let logEntry = null;

    if (newStatus === 'COOKING') {
      logEntry = { time: timeStr, text: 'แม่ค้ากดเริ่มปรุงอาหารแล้ว' };
      order.statusLogs.push(logEntry);
      this.triggerToast(`🍳 ร้านค้าเริ่มปรุงออเดอร์ #${order.orderNumber}`);
    } else if (newStatus === 'READY') {
      logEntry = { time: timeStr, text: 'อาหารปรุงเสร็จร้อนๆ แล้ว พร้อมรับ!' };
      order.statusLogs.push(logEntry);
      this.triggerToast(`🔔 ออเดอร์ #${order.orderNumber} เสร็จแล้ว! แจ้งเตือนนักศึกษาแล้ว`);
    } else if (newStatus === 'COMPLETED') {
      logEntry = { time: timeStr, text: 'สแกนรับอาหารเรียบร้อยแล้ว' };
      order.statusLogs.push(logEntry);
      this.triggerToast(`✅ ส่งมอบออเดอร์ #${order.orderNumber} เรียบร้อย`);
    }

    this.notify();

    // Persist to Supabase
    dbService.updateOrderStatus(orderId, newStatus, logEntry);
  }

  // Vendor Grab & Go Inventory adjustment
  updateGrabStock(itemId, delta) {
    const item = this.grabAndGoItems.find((i) => i.id === itemId);
    if (!item) return;

    item.stock = Math.max(0, item.stock + delta);
    item.badge = item.stock > 0 ? `เหลือ ${item.stock} กล่อง` : 'หมดชั่วคราว';
    this.triggerToast(`อัปเดตสต็อก ${item.name}: ${item.stock} กล่อง`);
    this.notify();
  }

  // Update Stall Image across entire app state
  async updateStallImage(stallId, imageUrl) {
    const stall = this.stalls.find((s) => s.id === stallId);
    if (stall) {
      stall.imageUrl = imageUrl;
    }
    if (this.selectedCanteen?.stalls) {
      const sInCanteen = this.selectedCanteen.stalls.find((s) => s.id === stallId);
      if (sInCanteen) {
        sInCanteen.imageUrl = imageUrl;
      }
    }
    this.notify();
    try {
      await dbService.updateStall(stallId, { imageUrl });
    } catch (e) {
      console.warn('Failed to persist stall image to Supabase:', e);
    }
  }

  triggerToast(message) {
    this.activeToast = message;
    this.notify();
    setTimeout(() => {
      if (this.activeToast === message) {
        this.activeToast = null;
        this.notify();
      }
    }, 3500);
  }

  // Ticker that updates hold countdowns every second
  startTicker() {
    setInterval(() => {
      let changed = false;

      this.orders.forEach((order) => {
        if (order.status === 'HOLDING_IN_CLOUD' && order.holdSecondsRemaining > 0) {
          order.holdSecondsRemaining -= 1;
          changed = true;

          // When hold reaches zero, automatically release order to Vendor KDS!
          if (order.holdSecondsRemaining <= 0) {
            order.status = 'RELEASED_TO_KDS';
            const logEntry = {
              time: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
              text: '⏰ ถึงเวลาปล่อยคิว! ส่งออเดอร์เข้าจอแม่ค้า (KDS) ทันที',
            };
            order.statusLogs.push(logEntry);
            this.triggerToast(`🚀 ปล่อยออเดอร์ #${order.orderNumber} เข้าจอครัวแล้ว (Predictive Slotting)`);
            dbService.updateOrderStatus(order.id, 'RELEASED_TO_KDS', logEntry);
          }
        }
      });

      if (changed) {
        this.notify();
      }
    }, 1000);
  }

  // Fast-track release holding order immediately to KDS
  releaseOrderNow(orderId) {
    const order = this.orders.find((o) => o.id === orderId);
    if (order && order.status === 'HOLDING_IN_CLOUD') {
      order.holdSecondsRemaining = 0;
      order.status = 'RELEASED_TO_KDS';
      const logEntry = {
        time: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
        text: '⚡ ผู้ใช้กดเร่งส่งครัวทันที (Fast-Track เข้า KDS)',
      };
      order.statusLogs.push(logEntry);
      this.triggerToast(`🚀 ส่งออเดอร์ #${order.orderNumber} เข้าจอครัวแม่ค้าทันทีเรียบร้อยแล้ว!`);
      this.notify();
      dbService.updateOrderStatus(order.id, 'RELEASED_TO_KDS', logEntry);
    }
  }
}

export const store = new CanteenStore();
export default store;
