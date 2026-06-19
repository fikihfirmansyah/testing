export type OrderStatus = 'TOKO_ORDERED' | 'GUDANG_ORDERED_TO_SUPPLIER' | 'ARRIVED_AT_GUDANG' | 'SHIPPED_TO_TOKO' | 'ARRIVED_AT_TOKO';

export interface StatusMilestone {
  status: OrderStatus;
  label: string;
  description: string;
  color: string;
}

export interface StatusHistoryEntry {
  id: string;
  status: OrderStatus;
  updatedAt: string;
  updatedBy: string;
  notes?: string;
  photoArrivedGudang?: string;
  photoArrivedToko?: string;
  whatsappSent: boolean;
  whatsappGroup: string;
}

export interface FrameOrder {
  id: string; // Reference Number (e.g., PO-2026-0001)
  sku: string;
  qty: number;
  color: string;
  orderDate: string;
  estimatedCompletion: string;
  photoFront: string; // base64 or URL
  photoSide: string; // base64 or URL
  photoSku: string; // base64 or URL
  photoArrivedGudang?: string; // photo physically verified at warehouse
  photoArrivedToko?: string; // photo physically verified at store
  currentStatus: OrderStatus;
  statusHistory: StatusHistoryEntry[];
}

export interface WAConfig {
  groupName: string;
  webhookEnabled: boolean;
  webhookUrl: string;
}

export const STATUS_MILESTONES: Record<OrderStatus, StatusMilestone> = {
  TOKO_ORDERED: {
    status: 'TOKO_ORDERED',
    label: 'Toko Order ke Gudang',
    description: 'Toko melakukan order frame Pre-Order ke Gudang.',
    color: 'bg-blue-100 text-blue-800 border-blue-200 text-blue-600',
  },
  GUDANG_ORDERED_TO_SUPPLIER: {
    status: 'GUDANG_ORDERED_TO_SUPPLIER',
    label: 'Gudang Order ke Supplier',
    description: 'Gudang meneruskan pesanan and meng-order frame ke Supplier.',
    color: 'bg-amber-100 text-amber-800 border-amber-200 text-amber-600',
  },
  ARRIVED_AT_GUDANG: {
    status: 'ARRIVED_AT_GUDANG',
    label: 'Frame Tiba di Gudang',
    description: 'Frame orderan dari Supplier telah tiba di Gudang fisik.',
    color: 'bg-purple-100 text-purple-800 border-purple-200 text-purple-600',
  },
  SHIPPED_TO_TOKO: {
    status: 'SHIPPED_TO_TOKO',
    label: 'Barang Dikirim ke Toko',
    description: 'Barang telah dikemas dan sedang dikirim langsung ke Toko tujuan.',
    color: 'bg-green-100 text-green-800 border-green-200 text-green-600',
  },
  ARRIVED_AT_TOKO: {
    status: 'ARRIVED_AT_TOKO',
    label: 'Barang Diterima di Toko',
    description: 'Barang sudah diterima fisik dan diverifikasi oleh tim Toko penerima.',
    color: 'bg-indigo-100 text-indigo-800 border-indigo-200 text-indigo-600',
  },
};
