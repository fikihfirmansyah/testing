import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import fs from "fs";

// Define Interfaces
interface StatusHistoryEntry {
  id: string;
  status: string;
  updatedAt: string;
  updatedBy: string;
  notes?: string;
  photoArrivedGudang?: string;
  photoArrivedToko?: string;
  whatsappSent: boolean;
  whatsappGroup: string;
}

interface FrameOrder {
  id: string;
  sku: string;
  qty: number;
  color: string;
  orderDate: string;
  estimatedCompletion: string;
  photoFront: string;
  photoSide: string;
  photoSku: string;
  photoArrivedGudang?: string;
  photoArrivedToko?: string;
  currentStatus: string;
  statusHistory: StatusHistoryEntry[];
}

interface WANotification {
  id: string;
  timestamp: string;
  groupName: string;
  message: string;
  sender: string;
  orderId: string;
  type: "status_change" | "new_order";
}

// Default Pre-loaded Orders
const DEFAULT_ORDERS: FrameOrder[] = [
  {
    id: "PO-20260616-0001",
    sku: "SKU-KSL-X501",
    qty: 5,
    color: "Stealth Black",
    orderDate: "2026-06-15",
    estimatedCompletion: "2026-06-22 (7 hari)",
    photoFront: "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=400&auto=format&fit=crop&q=60",
    photoSide: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400&auto=format&fit=crop&q=60",
    photoSku: "https://images.unsplash.com/photo-1509695507497-903c140c43b0?w=400&auto=format&fit=crop&q=60",
    currentStatus: "ARRIVED_AT_GUDANG",
    statusHistory: [
      {
        id: "h1",
        status: "TOKO_ORDERED",
        updatedAt: "2026-06-15T09:00:00Z",
        updatedBy: "Halat",
        notes: "Pesanan khusus customer setia optik 150k.",
        whatsappSent: true,
        whatsappGroup: "WA Group PO Optik-150K"
      },
      {
        id: "h2",
        status: "GUDANG_ORDERED_TO_SUPPLIER",
        updatedAt: "2026-06-15T14:30:00Z",
        updatedBy: "Hendra (Gudang Utama)",
        notes: "Diteruskan ke Supplier CV Optindo, estimasi 7-10 hari kerja.",
        whatsappSent: true,
        whatsappGroup: "WA Group PO Optik-150K"
      },
      {
        id: "h3",
        status: "ARRIVED_AT_GUDANG",
        updatedAt: "2026-06-16T10:15:00Z",
        updatedBy: "Boni (Logistik)",
        notes: "Mendarat dengan selamat, sedang pengecekan SKU & QC fisik.",
        whatsappSent: true,
        whatsappGroup: "WA Group PO Optik-150K"
      }
    ]
  },
  {
    id: "PO-20260616-0002",
    sku: "SKU-SLMR-990",
    qty: 12,
    color: "Rose Gold Transparent",
    orderDate: "2026-06-16",
    estimatedCompletion: "2026-06-23 (7 hari)",
    photoFront: "https://images.unsplash.com/photo-1508296695146-257a814070b4?w=400&auto=format&fit=crop&q=60",
    photoSide: "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=400&auto=format&fit=crop&q=60",
    photoSku: "https://images.unsplash.com/photo-1591076482161-42ce6da69f67?w=400&auto=format&fit=crop&q=60",
    currentStatus: "GUDANG_ORDERED_TO_SUPPLIER",
    statusHistory: [
      {
        id: "h4",
        status: "TOKO_ORDERED",
        updatedAt: "2026-06-16T08:15:00Z",
        updatedBy: "Mansyur",
        notes: "Orderan frame kacamata bulat titanium.",
        whatsappSent: true,
        whatsappGroup: "WA Group PO Optik-150K"
      },
      {
        id: "h5",
        status: "GUDANG_ORDERED_TO_SUPPLIER",
        updatedAt: "2026-06-16T11:00:00Z",
        updatedBy: "Aris (Gudang Puspus)",
        notes: "PO No 8892 dikirim ke Supplier Jaya Abadi, diwajibkan double bubble wrap.",
        whatsappSent: true,
        whatsappGroup: "WA Group PO Optik-150K"
      }
    ]
  },
  {
    id: "PO-20260616-0003",
    sku: "SKU-TITAN-X1",
    qty: 2,
    color: "Matte Gray Silver",
    orderDate: "2026-06-16",
    estimatedCompletion: "2026-06-23 (7 hari)",
    photoFront: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400&auto=format&fit=crop&q=60",
    photoSide: "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=400&auto=format&fit=crop&q=60",
    photoSku: "https://images.unsplash.com/photo-1509695507497-903c140c43b0?w=400&auto=format&fit=crop&q=60",
    currentStatus: "TOKO_ORDERED",
    statusHistory: [
      {
        id: "h6",
        status: "TOKO_ORDERED",
        updatedAt: "2026-06-16T14:20:00Z",
        updatedBy: "Karya Dame",
        notes: "Gagang tebal, request ukuran box kacamata ukuran L.",
        whatsappSent: true,
        whatsappGroup: "WA Group PO Optik-150K"
      }
    ]
  }
];

const DEFAULT_NOTIFICATIONS: WANotification[] = [
  {
    id: "n1",
    timestamp: "2026-06-15T09:00:10Z",
    groupName: "WA Group PO Optik-150K",
    sender: "Sistem Bot PO",
    message: "🔊 *[PO BARU MASUK - TOKO]*\n\nHalo Tim Gudang!\nAda pesanan pre-order baru yang diinput oleh Toko.\n\n" +
      "📌 *No Referensi*: `PO-20260616-0001`\n" +
      "👓 *SKU Frame*: SKU-KSL-X501\n" +
      "📦 *Quantity*: 5 Pcs\n" +
      "🎨 *Warna*: Stealth Black\n" +
      "📅 *Tanggal Order*: 15-06-2026\n" +
      "⚠️ *Status*: Toko Order ke Gudang (Mulai)\n" +
      "💬 *Catatan*: Pesanan khusus customer setia optik 150k.\n\n" +
      "Mohon petugas gudang memproses ke Supplier!",
    orderId: "PO-20260616-0001",
    type: "new_order"
  },
  {
    id: "n2",
    timestamp: "2026-06-15T14:30:15Z",
    groupName: "WA Group PO Optik-150K",
    sender: "Sistem Bot PO",
    message: "🔔 *[UPDATE STATUS PO]*\n\n" +
      "📌 *No Referensi*: `PO-20260616-0001`\n" +
      "👓 *SKU Frame*: SKU-KSL-X501\n" +
      "🔄 *Status Baru*: *Gudang Order ke Supplier*\n" +
      "👤 *Diperbarui Oleh*: Hendra (Gudang Utama)\n" +
      "📅 *Waktu*: 15-06-2026 21:30 WIB\n" +
      "📝 *Catatan*: Diteruskan ke Supplier CV Optindo, estimasi 7-10 hari kerja.\n\n" +
      "🚀 Progress: [▮▮▮▯] 50% (Gudang -> Supplier)",
    orderId: "PO-20260616-0001",
    type: "status_change"
  },
  {
    id: "n3",
    timestamp: "2026-06-16T10:15:30Z",
    groupName: "WA Group PO Optik-150K",
    sender: "Sistem Bot PO",
    message: "🔔 *[UPDATE STATUS PO]*\n\n" +
      "📌 *No Referensi*: `PO-20260616-0001`\n" +
      "👓 *SKU Frame*: SKU-KSL-X501\n" +
      "🔄 *Status Baru*: *Frame Tiba di Gudang*\n" +
      "👤 *Diperbarui Oleh*: Boni (Logistik)\n" +
      "📅 *Waktu*: 16-06-2026 17:15 WIB\n" +
      "📝 *Catatan*: Mendarat dengan selamat, sedang pengecekan SKU & QC fisik.\n\n" +
      "🚀 Progress: [▮▮▮▮] 75% (Barang di Gudang)",
    orderId: "PO-20260616-0001",
    type: "status_change"
  }
];

const DATA_FILE_PATH = path.join(process.cwd(), "po_data.json");

// Load Initial Data from file if exists, otherwise write defaults
let currentOrders: FrameOrder[] = [...DEFAULT_ORDERS];
let currentNotifications: WANotification[] = [...DEFAULT_NOTIFICATIONS];

try {
  if (fs.existsSync(DATA_FILE_PATH)) {
    const raw = fs.readFileSync(DATA_FILE_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    if (parsed.orders) currentOrders = parsed.orders;
    if (parsed.notifications) currentNotifications = parsed.notifications;
    console.log("Loaded existing store data from JSON file.");
  } else {
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify({ orders: currentOrders, notifications: currentNotifications }, null, 2));
    console.log("Created initial default store data file.");
  }
} catch (err) {
  console.error("Failed to read/write persistent JSON file, using RAM only:", err);
}

function saveData() {
  try {
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify({ orders: currentOrders, notifications: currentNotifications }, null, 2));
  } catch (err) {
    console.error("Save failed:", err);
  }
}

// Generate human-friendly WA message
function getWAStatusLabel(status: string) {
  switch (status) {
    case "TOKO_ORDERED": return "Toko Order ke Gudang";
    case "GUDANG_ORDERED_TO_SUPPLIER": return "Gudang Order ke Supplier";
    case "ARRIVED_AT_GUDANG": return "Frame Tiba di Gudang (Supplier Arrived)";
    case "SHIPPED_TO_TOKO": return "Barang Dikirim ke Toko";
    case "ARRIVED_AT_TOKO": return "Barang Diterima di Toko";
    default: return status;
  }
}

function getProgressVisual(status: string) {
  switch (status) {
    case "TOKO_ORDERED": return "[▮▯▯▯▯] 20% (Pemesanan Toko)";
    case "GUDANG_ORDERED_TO_SUPPLIER": return "[▮▮▯▯▯] 40% (Dipesan ke Supplier)";
    case "ARRIVED_AT_GUDANG": return "[▮▮▮▯▯] 60% (Tiba di Gudang)";
    case "SHIPPED_TO_TOKO": return "[▮▮▮▮▯] 80% (Dikirim ke Toko)";
    case "ARRIVED_AT_TOKO": return "[▮▮▮▮▮] 100% (Selesai & Diterima)";
    default: return "";
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Use JSON payload middleware with size constraints for Base64 frames images
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // API 1: Fetch all orders
  app.get("/api/orders", (req, res) => {
    res.json(currentOrders);
  });

  // API 2: Add a new Pre-Order
  app.post("/api/orders", (req, res) => {
    const { sku, qty, color, photoFront, photoSide, photoSku, note, submittor } = req.body;

    if (!sku || !qty || !color) {
      return res.status(400).json({ error: "SKU, Qty, dan Warna wajib diisi!" });
    }

    const today = new Date();
    const pad = (n: number) => n.toString().padStart(2, "0");
    const dateStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
    
    // Auto incremental or ID generation
    const cleanDateStamp = `${today.getFullYear()}${pad(today.getMonth() + 1)}${pad(today.getDate())}`;
    const todaysOrdersCount = currentOrders.filter(o => o.orderDate === dateStr).length + 1;
    const orderId = `PO-${cleanDateStamp}-${todaysOrdersCount.toString().padStart(4, "0")}`;

    // Calculate Estimated Completion (diganti berkisar 3-7 hari kerja, tepatnya 7 hari estimasi dari tanggal order)
    const completionDate = new Date();
    completionDate.setDate(completionDate.getDate() + 7);
    const estDateStr = `${completionDate.getFullYear()}-${pad(completionDate.getMonth() + 1)}-${pad(completionDate.getDate())} (7 hari)`;

    const defaultImage = "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=400&auto=format&fit=crop&q=60";

    const newHistory: StatusHistoryEntry = {
      id: `h_${Date.now()}_init`,
      status: "TOKO_ORDERED",
      updatedAt: new Date().toISOString(),
      updatedBy: submittor || "Sistem Toko (Input Online)",
      notes: note || "Input orderan baru oleh staf.",
      whatsappSent: true,
      whatsappGroup: "WA Group PO Optik-150K"
    };

    const newOrder: FrameOrder = {
      id: orderId,
      sku: sku.trim().toUpperCase(),
      qty: parseInt(qty) || 1,
      color: color.trim(),
      orderDate: dateStr,
      estimatedCompletion: estDateStr,
      photoFront: photoFront || defaultImage,
      photoSide: photoSide || defaultImage,
      photoSku: photoSku || defaultImage,
      currentStatus: "TOKO_ORDERED",
      statusHistory: [newHistory]
    };

    // Prepend to show newest first
    currentOrders.unshift(newOrder);

    // Create WhatsApp Alert
    const waMsg = `🔊 *[PO BARU MASUK - ONLINE]*\n\nHalo Tim Gudang!\nAda orderan frame PO baru masuk secara online.\n\n` +
      `📌 *No Referensi*: \`${orderId}\`\n` +
      `👓 *SKU Frame*: ${newOrder.sku}\n` +
      `📦 *Quantity*: ${newOrder.qty} Pcs\n` +
      `🎨 *Warna*: ${newOrder.color}\n` +
      `📅 *Tanggal Order*: ${today.getDate()}-${pad(today.getMonth() + 1)}-${today.getFullYear()}\n` +
      `⏳ *Estimasi Selesai*: 7 hari (Target PO)\n` +
      `⚠️ *Status*: Toko Order ke Gudang\n` +
      `💬 *Catatan*: ${note || "-"}\n\n` +
      `Silakan staf Gudang untuk mengecek and memesan ke Supplier!`;

    const newAlert: WANotification = {
      id: `notif_${Date.now()}`,
      timestamp: new Date().toISOString(),
      groupName: "WA Group PO Optik-150K",
      sender: "Sistem Bot PO",
      message: waMsg,
      orderId: orderId,
      type: "new_order"
    };

    currentNotifications.unshift(newAlert);
    saveData();

    res.status(201).json(newOrder);
  });

  // API 3: Update Order Status
  app.put("/api/orders/:id/status", (req, res) => {
    const { id } = req.params;
    const { status, updatedBy, notes, photoArrivedGudang, photoArrivedToko } = req.body;

    if (!status) {
      return res.status(400).json({ error: "Status baru wajib ditentukan!" });
    }

    const orderIdx = currentOrders.findIndex(o => o.id === id);
    if (orderIdx === -1) {
      return res.status(404).json({ error: "Pemesanan tidak ditemukan!" });
    }

    const order = currentOrders[orderIdx];
    const oldStatus = order.currentStatus;

    // Apply the update
    order.currentStatus = status;

    if (photoArrivedGudang) {
      order.photoArrivedGudang = photoArrivedGudang;
    }
    if (photoArrivedToko) {
      order.photoArrivedToko = photoArrivedToko;
    }

    const newHistory: StatusHistoryEntry = {
      id: `h_${Date.now()}`,
      status: status,
      updatedAt: new Date().toISOString(),
      updatedBy: updatedBy || "Admin Gudang",
      notes: notes || `Menerapkan perubahan status dari ${getWAStatusLabel(oldStatus)}.`,
      photoArrivedGudang: photoArrivedGudang,
      photoArrivedToko: photoArrivedToko,
      whatsappSent: true,
      whatsappGroup: "WA Group PO Optik-150K"
    };

    order.statusHistory.push(newHistory);

    // Custom estimation update depending on status
    if (status === "ARRIVED_AT_GUDANG") {
      order.estimatedCompletion = "3 hari kerja (sedang di QC)";
    } else if (status === "SHIPPED_TO_TOKO") {
      order.estimatedCompletion = "Selesai (barang dikirim)";
    } else if (status === "ARRIVED_AT_TOKO") {
      order.estimatedCompletion = "Selesai (barang diterima)";
    }

    // Format WhatsApp Alert for Status Update
    const today = new Date();
    const pad = (n: number) => n.toString().padStart(2, "0");
    const timestampStr = `${pad(today.getDate())}-${pad(today.getMonth() + 1)}-${today.getFullYear()} ${pad(today.getHours())}:${pad(today.getMinutes())} WIB`;

    const statusLabel = getWAStatusLabel(status);
    const progressVisualStr = getProgressVisual(status);

    let waMsg = `🔔 *[UPDATE STATUS PO]*\n\n` +
      `📌 *No Referensi*: \`${order.id}\`\n` +
      `👓 *SKU Frame*: ${order.sku}\n` +
      `📦 *Quantity*: ${order.qty} pcs (${order.color})\n` +
      `🔄 *Status Baru*: *${statusLabel}*\n` +
      `👤 *Diperbarui Oleh*: ${updatedBy || "Staff Gudang"}\n` +
      `📅 *Waktu*: ${timestampStr}\n` +
      `📝 *Catatan*: ${notes || "-"}\n`;

    if (photoArrivedGudang) {
      waMsg += `📸 *Foto Fisik Tiba di Gudang*: TERLAMPIR AKTIF DI SISTEM!\n`;
    }
    if (photoArrivedToko) {
      waMsg += `📸 *Foto Serah Terima Toko*: TERLAMPIR AKTIF DI SISTEM!\n`;
    }

    waMsg += `\n🚀 Progress: ${progressVisualStr}\n` +
      `_Notifikasi real-time terkirim ke Grup WA Gudang & Toko._`;

    const newAlert: WANotification = {
      id: `notif_${Date.now()}`,
      timestamp: new Date().toISOString(),
      groupName: "WA Group PO Optik-150K",
      sender: "Sistem Bot PO",
      message: waMsg,
      orderId: order.id,
      type: "status_change"
    };

    currentNotifications.unshift(newAlert);
    saveData();

    res.json(order);
  });

  // API 4: Get simulated WA notifications
  app.get("/api/notifications", (req, res) => {
    res.json(currentNotifications);
  });

  // API 5: Clear Notifications
  app.post("/api/notifications/clear", (req, res) => {
    currentNotifications = [];
    saveData();
    res.json({ message: "Notifikasi berhasil di-clear!" });
  });

  // Serve static assets in production, and run Vite middleware in development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // Support SPA routing
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`PO Frame Monitoring Server running on http://localhost:${PORT}`);
  });
}

startServer();
