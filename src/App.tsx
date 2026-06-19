import React, { useState, useEffect, useRef } from 'react';
import { 
  Package, 
  Clock, 
  ArrowRight, 
  Search, 
  Plus, 
  CheckCircle2, 
  MessageSquare, 
  AlertCircle, 
  Filter, 
  Upload, 
  User, 
  RefreshCw, 
  Sliders, 
  Hash, 
  Calendar, 
  Bell, 
  Truck, 
  FileText, 
  Eye, 
  Layers, 
  Camera, 
  History, 
  Workflow,
  Check,
  Send,
  Sparkles,
  ChevronRight,
  Info,
  X,
  Download,
  Lock,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FrameOrder, 
  OrderStatus, 
  StatusHistoryEntry, 
  STATUS_MILESTONES 
} from './types';

// Predefined beautiful mock glass photos (Front, Side, SKU tag) for instant testing!
const SAMPLE_TEMPLATES = [
  {
    name: "Classic Acetate Black",
    sku: "SKU-BLK-ACETATE",
    color: "Glossy Black / Silver Trim",
    photoFront: "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=500&auto=format&fit=crop&q=60",
    photoSide: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500&auto=format&fit=crop&q=60",
    photoSku: "https://images.unsplash.com/photo-1509695507497-903c140c43b0?w=500&auto=format&fit=crop&q=60"
  },
  {
    name: "Modern Titanium Gold",
    sku: "SKU-GOLD-TITA",
    color: "Champagne Gold Titanium",
    photoFront: "https://images.unsplash.com/photo-1508296695146-257a814070b4?w=500&auto=format&fit=crop&q=60",
    photoSide: "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=500&auto=format&fit=crop&q=60",
    photoSku: "https://images.unsplash.com/photo-1591076482161-42ce6da69f67?w=500&auto=format&fit=crop&q=60"
  },
  {
    name: "Sport Carbon Gray",
    sku: "SKU-CARBON-SPRT",
    color: "Matte Anthracite Gray",
    photoFront: "https://images.unsplash.com/photo-1591076482161-42ce6da69f67?w=500&auto=format&fit=crop&q=60",
    photoSide: "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=500&auto=format&fit=crop&q=60",
    photoSku: "https://images.unsplash.com/photo-1509695507497-903c140c43b0?w=500&auto=format&fit=crop&q=60"
  }
];

export default function App() {
  // State variables
  const [orders, setOrders] = useState<FrameOrder[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pollingActive, setPollingActive] = useState(true);
  const [lastSynced, setLastSynced] = useState<Date>(new Date());
  
  // Filtering & Selection UI state
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [activeRole, setActiveRole] = useState<'TOKOBASIC' | 'GUDANGADMIN' | 'MONITOR'>('GUDANGADMIN');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [rightTab, setRightTab] = useState<'detail' | 'whatsapp'>('detail');

  // Branch Login & Session State variables
  const [loggedInBranch, setLoggedInBranch] = useState<string | null>(() => {
    return localStorage.getItem('logged_in_branch') || null;
  });
  const [loginPin, setLoginPin] = useState('');
  const [selectedLoginBranch, setSelectedLoginBranch] = useState('Karya Dame');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [showOnlyMyBranch, setShowOnlyMyBranch] = useState(true);

  // Gudang & Admin Login & Session State variables
  const [loggedInGudang, setLoggedInGudang] = useState<string | null>(() => {
    return localStorage.getItem('logged_in_gudang') || null;
  });
  const [gudangUsername, setGudangUsername] = useState('');
  const [gudangPassword, setGudangPassword] = useState('');
  const [gudangLoginError, setGudangLoginError] = useState<string | null>(null);

  // Sync submittor to loggedInBranch if session exists
  useEffect(() => {
    if (loggedInBranch) {
      setSubmittor(loggedInBranch);
    }
  }, [loggedInBranch]);

  // Sync updaterName to loggedInGudang if session exists
  useEffect(() => {
    if (loggedInGudang) {
      setUpdaterName(loggedInGudang);
    }
  }, [loggedInGudang]);

  const handleSelectOrder = (id: string) => {
    setSelectedOrderId(id);
    setRightTab('detail');
  };
  
  // Create New Order Form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [sku, setSku] = useState('');
  const [qty, setQty] = useState(1);
  const [color, setColor] = useState('');
  const [note, setNote] = useState('');
  const [submittor, setSubmittor] = useState(() => {
    return localStorage.getItem('logged_in_branch') || 'Karya Dame';
  });
  const [photoFront, setPhotoFront] = useState('');
  const [photoSide, setPhotoSide] = useState('');
  const [photoSku, setPhotoSku] = useState('');
  
  // Update Status Form state
  const [updaterName, setUpdaterName] = useState(() => {
    return localStorage.getItem('logged_in_gudang') || 'Hendra (Gudang Utama)';
  });
  const [updateStatus, setUpdateStatus] = useState<OrderStatus>('GUDANG_ORDERED_TO_SUPPLIER');
  const [updateNotes, setUpdateNotes] = useState('');
  const [updatePhotoGudang, setUpdatePhotoGudang] = useState('');
  const [updatePhotoToko, setUpdatePhotoToko] = useState('');
  
  // Operation states
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [submittingStatus, setSubmittingStatus] = useState(false);
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // File drop/upload handlers refs
  const fileInputFrontRef = useRef<HTMLInputElement>(null);
  const fileInputSideRef = useRef<HTMLInputElement>(null);
  const fileInputSkuRef = useRef<HTMLInputElement>(null);
  const fileInputPhotoGudangRef = useRef<HTMLInputElement>(null);
  const fileInputPhotoTokoRef = useRef<HTMLInputElement>(null);

  // Fetch orders and notifications
  const fetchData = async (showLoadingIndicator = false) => {
    if (showLoadingIndicator) setLoading(true);
    try {
      const ordersRes = await fetch('/api/orders');
      if (ordersRes.ok) {
        const data = await ordersRes.json();
        setOrders(data);
        // Sync selected order structure if any selected
        if (selectedOrderId) {
          const updatedSelected = data.find((o: FrameOrder) => o.id === selectedOrderId);
          if (updatedSelected) {
            const currentStatus = updatedSelected.currentStatus;
            if (currentStatus === 'TOKO_ORDERED') {
              setUpdateStatus('GUDANG_ORDERED_TO_SUPPLIER');
            } else if (currentStatus === 'GUDANG_ORDERED_TO_SUPPLIER') {
              setUpdateStatus('ARRIVED_AT_GUDANG');
            } else if (currentStatus === 'ARRIVED_AT_GUDANG') {
              setUpdateStatus('SHIPPED_TO_TOKO');
            }
          }
        }
      }

      const notifsRes = await fetch('/api/notifications');
      if (notifsRes.ok) {
        const notifsData = await notifsRes.json();
        setNotifications(notifsData);
      }
      setLastSynced(new Date());
    } catch (err) {
      console.error("Failed to load real-time database endpoints:", err);
    } finally {
      if (showLoadingIndicator) setLoading(false);
    }
  };

  // Run initial load
  useEffect(() => {
    fetchData(true);
  }, []);

  // Polling setup (updates every 4 seconds)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (pollingActive) {
      interval = setInterval(() => {
        fetchData(false);
      }, 4000);
    }
    return () => clearInterval(interval);
  }, [pollingActive, selectedOrderId]);

  // Set default selection when orders are loaded
  useEffect(() => {
    if (orders.length > 0 && !selectedOrderId) {
      setSelectedOrderId(orders[0].id);
    }
  }, [orders]);

  // Handle preset selector to simplify layout testing
  const applyPresetTemplate = (idx: number) => {
    const template = SAMPLE_TEMPLATES[idx];
    setSku(template.sku);
    setColor(template.color);
    setPhotoFront(template.photoFront);
    setPhotoSide(template.photoSide);
    setPhotoSku(template.photoSku);
    
    setAlertMsg({
      type: 'success',
      text: `Template "${template.name}" berhasil diterapkan! Foto tampak depan, samping, dan SKU otomatis terisi.`
    });
    setTimeout(() => setAlertMsg(null), 4000);
  };

  // Convert files to base64
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, position: 'front' | 'side' | 'sku' | 'arrivedGudang' | 'arrivedToko') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      if (position === 'front') setPhotoFront(base64String);
      if (position === 'side') setPhotoSide(base64String);
      if (position === 'sku') setPhotoSku(base64String);
      if (position === 'arrivedGudang') setUpdatePhotoGudang(base64String);
      if (position === 'arrivedToko') setUpdatePhotoToko(base64String);
    };
    reader.readAsDataURL(file);
  };

  // Submit new pre-order
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sku.trim()) {
      alert("No SKU wajib diisi!");
      return;
    }
    if (qty < 1) {
      alert("Qty minimal 1!");
      return;
    }
    if (!color.trim()) {
      alert("Warna wajib diisi!");
      return;
    }

    setSubmittingOrder(true);
    try {
      const resp = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sku,
          qty,
          color,
          note,
          submittor,
          photoFront,
          photoSide,
          photoSku
        })
      });

      if (resp.ok) {
        const createdOrder = await resp.json();
        setAlertMsg({
          type: 'success',
          text: `Success! Order PO Frame baru dengan Ref: ${createdOrder.id} berhasil ditambahkan.`
        });
        
        // Reset Form
        setSku('');
        setQty(1);
        setColor('');
        setNote('');
        setPhotoFront('');
        setPhotoSide('');
        setPhotoSku('');
        setShowAddForm(false);
        
        // Refresh local lists and set selection to the newly created order
        await fetchData(false);
        setSelectedOrderId(createdOrder.id);
      } else {
        const err = await resp.json();
        alert(`Gagal membuat order: ${err.error || 'Terjadi kesalahan'}`);
      }
    } catch (err) {
      console.error(err);
      alert("Gagal menghubungi server backend.");
    } finally {
      setSubmittingOrder(false);
      setTimeout(() => setAlertMsg(null), 5000);
    }
  };

  // Submit status update
  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderId) return;

    if (updateStatus === 'ARRIVED_AT_GUDANG' && !updatePhotoGudang) {
      alert("⚠️ Harap lampirkan Foto Bukti Fisik Tiba di Gudang terlebih dahulu! Ini diperlukan agar tim toko dapat melihat secara langsung kondisi frame.");
      return;
    }

    if (updateStatus === 'ARRIVED_AT_TOKO' && !updatePhotoToko) {
      alert("⚠️ Harap lampirkan Foto Bukti Fisik Diterima di Toko terlebih dahulu! Ini diperlukan untuk memverifikasi penerimaan kacamata di cabang.");
      return;
    }

    setSubmittingStatus(true);
    try {
      const resp = await fetch(`/api/orders/${selectedOrderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: updateStatus,
          updatedBy: updaterName,
          notes: updateNotes,
          photoArrivedGudang: updateStatus === 'ARRIVED_AT_GUDANG' ? updatePhotoGudang : undefined,
          photoArrivedToko: updateStatus === 'ARRIVED_AT_TOKO' ? updatePhotoToko : undefined
        })
      });

      if (resp.ok) {
        setAlertMsg({
          type: 'success',
          text: `Progress update status berhasil diterapkan & otomatis mengirim WA notifikasi!`
        });
        setUpdateNotes('');
        setUpdatePhotoGudang('');
        setUpdatePhotoToko('');
        await fetchData(false);
      } else {
        const err = await resp.json();
        alert(`Gagal update status: ${err.error || 'Terjadi kesalahan'}`);
      }
    } catch (err) {
      console.error(err);
      alert("Gagal menghubungi server untuk update status.");
    } finally {
      setSubmittingStatus(false);
      setTimeout(() => setAlertMsg(null), 5000);
    }
  };

  // Reset or Clear Simulated Notifications
  const handleClearNotifications = async () => {
    try {
      const resp = await fetch('/api/notifications/clear', { method: 'POST' });
      if (resp.ok) {
        setNotifications([]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filter orders based on query and status filter
  const filteredOrders = orders.filter(o => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = o.id.toLowerCase().includes(query) || 
                          o.sku.toLowerCase().includes(query) ||
                          o.color.toLowerCase().includes(query) ||
                          (o.submittor && o.submittor.toLowerCase().includes(query));
    
    const matchesStatus = selectedStatusFilter === 'ALL' || o.currentStatus === selectedStatusFilter;
    
    // Auto-filter by logged-in branch if in TOKOBASIC mode and showOnlyMyBranch is enabled
    const matchesBranch = (activeRole === 'TOKOBASIC' && loggedInBranch && showOnlyMyBranch)
      ? o.submittor === loggedInBranch
      : true;

    return matchesSearch && matchesStatus && matchesBranch;
  });

  // Export current filtered orders list to CSV file format
  const handleExportCSV = () => {
    if (filteredOrders.length === 0) {
      alert("Tidak ada data pesanan yang cocok dengan filter aktif untuk diekspor.");
      return;
    }

    const escapeCSVValue = (val: string | number) => {
      const stringValue = String(val === null || val === undefined ? '' : val);
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n') || stringValue.includes('\r')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    };

    const headers = [
      'No Referensi PO', 
      'SKU Frame', 
      'Quantity (Pcs)', 
      'Variasi Warna', 
      'Tanggal Order', 
      'Estimasi Selesai', 
      'Status Sekarang'
    ];

    const rows = filteredOrders.map(o => [
      o.id,
      o.sku,
      o.qty,
      o.color,
      o.orderDate,
      o.estimatedCompletion,
      STATUS_MILESTONES[o.currentStatus]?.label || o.currentStatus
    ]);

    const csvContent = [
      headers.map(escapeCSVValue).join(','),
      ...rows.map(row => row.map(escapeCSVValue).join(','))
    ].join('\r\n');

    // Generate CSV blob with UTF-8 BOM so Excel opens it with proper character encoding
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Laporan_PO_Frame_Optik150K_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const selectedOrder = orders.find(o => o.id === selectedOrderId) || null;

  // Calculate statistics representing the dashboard summary
  const totalPO = orders.length;
  const countTokoOrdered = orders.filter(o => o.currentStatus === 'TOKO_ORDERED').length;
  const countGudangOrdered = orders.filter(o => o.currentStatus === 'GUDANG_ORDERED_TO_SUPPLIER').length;
  const countArrivedGudang = orders.filter(o => o.currentStatus === 'ARRIVED_AT_GUDANG').length;
  const countShipped = orders.filter(o => o.currentStatus === 'SHIPPED_TO_TOKO').length;

  const metricsData = [
    {
      id: 'ALL',
      stage: 'Semua Pesanan Pre-Order',
      code: 'TOTAL',
      count: totalPO,
      responsibility: 'Sistem Integrasi',
      bgColor: 'bg-slate-50',
      iconColor: 'text-slate-800 bg-slate-100',
      borderColor: 'border-slate-200',
      icon: Layers,
      progress: 100,
      badgeColor: 'bg-slate-100 text-slate-800 border-slate-200'
    },
    {
      id: 'TOKO_ORDERED',
      stage: '1. Toko melakukan Order ke Gudang',
      code: 'STG-1',
      count: countTokoOrdered,
      responsibility: 'Mitra Cabang (Toko)',
      bgColor: 'bg-blue-50/20',
      iconColor: 'text-blue-600 bg-blue-50',
      borderColor: 'border-blue-100',
      icon: FileText,
      progress: totalPO > 0 ? Math.round((countTokoOrdered / totalPO) * 100) : 0,
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-100'
    },
    {
      id: 'GUDANG_ORDERED_TO_SUPPLIER',
      stage: '2. Gudang meneruskan PO ke Supplier',
      code: 'STG-2',
      count: countGudangOrdered,
      responsibility: 'Tim Logistik Gudang',
      bgColor: 'bg-amber-50/20',
      iconColor: 'text-amber-600 bg-amber-50',
      borderColor: 'border-amber-100',
      icon: Workflow,
      progress: totalPO > 0 ? Math.round((countGudangOrdered / totalPO) * 100) : 0,
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-100'
    },
    {
      id: 'ARRIVED_AT_GUDANG',
      stage: '3. Frame Kacamata Tiba di Gudang (QC & Tag)',
      code: 'STG-3',
      count: countArrivedGudang,
      responsibility: 'Petugas Gudang & QC Lab',
      bgColor: 'bg-purple-50/20',
      iconColor: 'text-purple-600 bg-purple-50',
      borderColor: 'border-purple-100',
      icon: Package,
      progress: totalPO > 0 ? Math.round((countArrivedGudang / totalPO) * 100) : 0,
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-100'
    },
    {
      id: 'SHIPPED_TO_TOKO',
      stage: '4. Barang Dikirim/Diserahkan ke Toko',
      code: 'STG-4',
      count: countShipped,
      responsibility: 'Kurir / Serah Terima Cabang',
      bgColor: 'bg-emerald-50/20',
      iconColor: 'text-emerald-600 bg-emerald-50',
      borderColor: 'border-emerald-100',
      icon: Truck,
      progress: totalPO > 0 ? Math.round((countShipped / totalPO) * 100) : 0,
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-100'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-700 flex flex-col font-sans selection:bg-slate-200">
      
      {/* Header Bar */}
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200/80 py-4 px-6 sticky top-0 z-40 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.04),0_10px_20px_-2px_rgba(0,0,0,0.02)]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-900 text-white rounded-xl shadow-sm hover:scale-105 transition-transform duration-200">
              <Layers className="h-5.5 w-5.5" id="logo-icon" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-slate-900 font-display flex flex-wrap items-center gap-2">
                Monitoring Order Frame PO
                <span className="inline-block px-2.5 py-0.5 bg-blue-50/80 text-blue-700 text-xs font-semibold rounded-full border border-blue-100">
                  Real-time System
                </span>
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Pencatatan Pre-Order Frame & Broadcast Otomatis WA Group Chat • Optik-150K
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Sync State Indicator */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200/70 rounded-xl text-xs font-mono text-slate-600 shadow-2xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-semibold tracking-wide">LIVE SYNCING</span>
              <button 
                onClick={() => fetchData(true)} 
                className="text-slate-400 hover:text-slate-800 transition-colors pointer-cursor ml-1"
                title="Refresh Manual"
                disabled={loading}
              >
                <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Active Branch Login Tag */}
            {activeRole === 'TOKOBASIC' && loggedInBranch && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800 shadow-2xs font-semibold animate-fade-in shrink-0">
                <User className="h-3.5 w-3.5 text-blue-600 animate-pulse" />
                <span>Toko: <b className="text-blue-900 font-extrabold">{loggedInBranch}</b></span>
                <button 
                  onClick={() => {
                    localStorage.removeItem('logged_in_branch');
                    setLoggedInBranch(null);
                    setSubmittor('');
                    setAlertMsg({ type: 'success', text: 'Berhasil logout dari akun Cabang Toko.' });
                    setTimeout(() => setAlertMsg(null), 3000);
                  }}
                  className="ml-1 text-[10px] text-blue-650 bg-white hover:bg-blue-100 hover:text-blue-700 font-bold px-2 py-0.5 rounded-lg border border-blue-200 transition-colors cursor-pointer"
                >
                  Logout
                </button>
              </div>
            )}

            {/* Active Gudang/Admin Login Tag */}
            {activeRole === 'GUDANGADMIN' && loggedInGudang && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-200 rounded-xl text-xs text-indigo-800 shadow-2xs font-semibold animate-fade-in shrink-0">
                <ShieldCheck className="h-4 w-4 text-indigo-650 animate-pulse" />
                <span>Gudang: <b className="text-indigo-900 font-extrabold">{loggedInGudang}</b></span>
                <button 
                  onClick={() => {
                    localStorage.removeItem('logged_in_gudang');
                    setLoggedInGudang(null);
                    setAlertMsg({ type: 'success', text: 'Berhasil logout dari akun Gudang & Admin.' });
                    setTimeout(() => setAlertMsg(null), 3000);
                  }}
                  className="ml-1 text-[10px] text-indigo-650 bg-white hover:bg-indigo-100 hover:text-indigo-700 font-bold px-2 py-0.5 rounded-lg border border-indigo-200 transition-colors cursor-pointer"
                >
                  Logout
                </button>
              </div>
            )}

            {/* Role Config Selection with distinctive visual identities */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/70 shadow-2xs w-full sm:w-auto">
              <button
                onClick={() => {
                  setActiveRole('TOKOBASIC');
                  if (loggedInBranch) {
                    setSubmittor(loggedInBranch);
                  }
                }}
                className={`flex-1 sm:flex-initial text-xs px-3 py-1.5 rounded-lg font-bold transition-all duration-200 cursor-pointer ${
                  activeRole === 'TOKOBASIC' 
                    ? 'bg-white text-blue-600 shadow-sm border border-slate-200/40' 
                    : 'text-slate-500 hover:text-slate-850'
                }`}
                id="role-toko"
              >
                Mode Toko
              </button>
              <button
                onClick={() => {
                  setActiveRole('GUDANGADMIN');
                  const currentGudang = localStorage.getItem('logged_in_gudang');
                  setUpdaterName(currentGudang || 'Hendra (Gudang Utama)');
                }}
                className={`flex-1 sm:flex-initial text-xs px-3 py-1.5 rounded-lg font-bold transition-all duration-200 cursor-pointer ${
                  activeRole === 'GUDANGADMIN' 
                    ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/40' 
                    : 'text-slate-500 hover:text-slate-850'
                }`}
                id="role-gudang"
              >
                Mode Gudang & Admin
              </button>
              <button
                onClick={() => setActiveRole('MONITOR')}
                className={`flex-1 sm:flex-initial text-xs px-3 py-1.5 rounded-lg font-bold transition-all duration-200 cursor-pointer ${
                  activeRole === 'MONITOR' 
                    ? 'bg-white text-amber-700 shadow-sm border border-slate-200/40' 
                    : 'text-slate-500 hover:text-slate-850'
                }`}
                id="role-monitor"
              >
                Mode TV Monitor
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Main Container Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Global Notification Banner */}
        {alertMsg && (
          <div className="col-span-12">
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`p-4 rounded-xl border flex items-start gap-3 shadow-md ${
                alertMsg.type === 'success' 
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-200' 
                  : 'bg-rose-50 text-rose-900 border-rose-200'
              }`}
            >
              <Sparkles className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="flex-1 text-sm font-medium">{alertMsg.text}</div>
            </motion.div>
          </div>
        )}

        {/* ----------------- SUB-SECTION: TOKO BRANCH AUTHENTICATION OR DASHBOARD ----------------- */}
        {activeRole === 'TOKOBASIC' && !loggedInBranch ? (
          <div className="col-span-12 flex flex-col items-center justify-center py-10 px-4 font-sans max-w-xl mx-auto w-full animate-fade-in">
            <motion.div 
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full bg-white rounded-2xl border border-slate-200/90 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.06)] overflow-hidden"
            >
              {/* Login Banner */}
              <div className="bg-gradient-to-r from-blue-700 to-indigo-900 text-white p-6 text-center">
                <div className="mx-auto w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-3">
                  <User className="h-6 w-6 text-blue-150" />
                </div>
                <h2 className="text-base font-black font-display tracking-tight text-white uppercase">Portal Login Cabang Optik-150K</h2>
                <p className="text-[11px] text-blue-200/90 font-medium mt-1">Sistem Input & Monitoring Otomatis PO Frame</p>
              </div>

              {/* Form Body */}
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (loginPin === '150') {
                    localStorage.setItem('logged_in_branch', selectedLoginBranch);
                    setLoggedInBranch(selectedLoginBranch);
                    setSubmittor(selectedLoginBranch);
                    setLoginPin('');
                    setLoginError(null);
                    setAlertMsg({
                      type: 'success',
                      text: `Login Berhasil! Selamat datang ${selectedLoginBranch}. Kunci akses berhasil dipasang.`
                    });
                    setTimeout(() => setAlertMsg(null), 4000);
                  } else {
                    setLoginError('PIN Pengaman Cabang salah! Gunakan PIN default "150".');
                  }
                }} 
                className="p-6 space-y-4"
              >
                {loginError && (
                  <div className="bg-rose-50 text-rose-800 text-xs font-semibold p-3.5 rounded-xl border border-rose-200 flex items-start gap-2.5">
                    <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
                    <span>{loginError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 font-display uppercase tracking-wider">Pilih Cabang / Toko</label>
                  <select
                    value={selectedLoginBranch}
                    onChange={(e) => {
                      setSelectedLoginBranch(e.target.value);
                      setLoginError(null);
                    }}
                    className="w-full bg-slate-50 text-xs p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:bg-white focus:outline-none font-bold text-slate-800 cursor-pointer transition-all"
                  >
                    <option value="Karya Dame">Karya Dame</option>
                    <option value="Mansyur">Mansyur</option>
                    <option value="Halat">Halat</option>
                    <option value="Johor">Johor</option>
                    <option value="Ringroad">Ringroad</option>
                    <option value="Marelan">Marelan</option>
                    <option value="Pancing">Pancing</option>
                    <option value="Kapten Muslim">Kapten Muslim</option>
                    <option value="Binjai">Binjai</option>
                    <option value="Siantar">Siantar</option>
                    <option value="Rantau Parapat">Rantau Parapat</option>
                    <option value="Online Store">Online Store</option>
                  </select>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-bold text-slate-700 font-display uppercase tracking-wider">PIN Akses Toko</label>
                    <span className="text-[10px] text-slate-400 font-medium">Masukan PIN: <b>150</b></span>
                  </div>
                  <input
                    type="password"
                    placeholder="Contoh: 150"
                    value={loginPin}
                    onChange={(e) => setLoginPin(e.target.value)}
                    className="w-full bg-slate-50 text-sm p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:bg-white focus:outline-none placeholder:text-slate-400 font-mono font-bold text-center tracking-widest transition-all"
                    maxLength={6}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5 font-display uppercase tracking-wider mt-2 hover:shadow-lg"
                >
                  Masuk Aplikasi Cabang <ArrowRight className="h-4 w-4" />
                </button>
              </form>

              {/* Footer info lock */}
              <div className="bg-slate-50 p-4 border-t border-slate-100 text-[10.5px] text-slate-500 font-semibold space-y-1.5 leading-relaxed">
                <span className="text-slate-850 font-extrabold text-xs block mb-1 font-display">🔐 Mengapa harus login?</span>
                <p>• <b>Keamanan Data</b>: Masing-masing cabang menginput data PO ter-kunci atas nama cabang sendiri.</p>
                <p>• <b>Akurasi Log</b>: Mengurangi human error salah klik data nama cabang pengorder pada saat input frame baru.</p>
              </div>
            </motion.div>
          </div>
        ) : activeRole === 'GUDANGADMIN' && !loggedInGudang ? (
          <div className="col-span-12 flex flex-col items-center justify-center py-10 px-4 font-sans max-w-xl mx-auto w-full animate-fade-in">
            <motion.div 
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full bg-white rounded-2xl border border-slate-200/90 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.06)] overflow-hidden"
            >
              {/* Login Banner */}
              <div className="bg-gradient-to-r from-indigo-700 to-slate-900 text-white p-6 text-center">
                <div className="mx-auto w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-3">
                  <ShieldCheck className="h-6 w-6 text-indigo-200 animate-pulse" />
                </div>
                <h2 className="text-base font-black font-display tracking-tight text-white uppercase">Portal Admin & Gudang Optik-150K</h2>
                <p className="text-[11px] text-indigo-200/90 font-medium mt-1">Verifikasi Hak Akses Logistik & Gudang Pusat</p>
              </div>

              {/* Form Body */}
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  const usernameLower = gudangUsername.trim().toLowerCase();
                  const pwd = gudangPassword.trim();

                  if (usernameLower === 'admin' && pwd === 'admin150k') {
                    const name = 'Administrator Utama';
                    localStorage.setItem('logged_in_gudang', name);
                    setLoggedInGudang(name);
                    setUpdaterName(name);
                    setGudangUsername('');
                    setGudangPassword('');
                    setGudangLoginError(null);
                    setAlertMsg({
                      type: 'success',
                      text: `Login Berhasil! Selamat datang ${name}.`
                    });
                    setTimeout(() => setAlertMsg(null), 3500);
                  } else if (usernameLower === 'gudang' && pwd === 'gudang150k') {
                    const name = 'Hendra (Gudang Utama)';
                    localStorage.setItem('logged_in_gudang', name);
                    setLoggedInGudang(name);
                    setUpdaterName(name);
                    setGudangUsername('');
                    setGudangPassword('');
                    setGudangLoginError(null);
                    setAlertMsg({
                      type: 'success',
                      text: `Login Berhasil! Selamat datang di panel staff logistik gudang.`
                    });
                    setTimeout(() => setAlertMsg(null), 3500);
                  } else {
                    setGudangLoginError('Username atau Password yang dimasukkan salah! Silakan periksa kembali.');
                  }
                }} 
                className="p-6 space-y-4"
              >
                {gudangLoginError && (
                  <div className="bg-rose-50 text-rose-800 text-xs font-semibold p-3.5 rounded-xl border border-rose-200 flex items-start gap-2.5">
                    <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
                    <span>{gudangLoginError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 font-display uppercase tracking-wider">Username Pengguna</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Contoh: admin atau gudang"
                      value={gudangUsername}
                      onChange={(e) => {
                        setGudangUsername(e.target.value);
                        setGudangLoginError(null);
                      }}
                      className="w-full bg-slate-50 text-xs pl-10 pr-3 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:bg-white focus:outline-none font-bold text-slate-800 transition-all placeholder:font-normal placeholder:text-slate-400"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 font-display uppercase tracking-wider font-sans">Password Sandi</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="password"
                      placeholder="Masukkan Password Sandi Anda"
                      value={gudangPassword}
                      onChange={(e) => {
                        setGudangPassword(e.target.value);
                        setGudangLoginError(null);
                      }}
                      className="w-full bg-slate-50 text-xs pl-10 pr-3 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:bg-white focus:outline-none font-mono font-bold tracking-wider transition-all placeholder:font-sans placeholder:font-normal placeholder:text-slate-400 placeholder:tracking-normal"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-3 rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5 font-display uppercase tracking-wider mt-2 hover:shadow-lg"
                >
                  Otorisasi Logistik <ArrowRight className="h-4 w-4" />
                </button>
              </form>

              {/* Predefined Accounts Info Panel for seamless convenience */}
              <div className="bg-slate-50 p-4 border-t border-slate-100 text-[10.5px] text-slate-500 font-semibold space-y-1.5 leading-relaxed">
                <span className="text-slate-800 font-extrabold text-xs block mb-1 font-display flex items-center gap-1">
                  <Info className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                  Informasi Akun Otoritas (Default System):
                </span>
                <div className="grid grid-cols-2 gap-2 mt-1.5">
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
                    <p className="text-slate-800 font-extrabold mb-1">👤 Akun Administrator:</p>
                    <p className="font-mono">User: <span className="text-indigo-700 font-bold bg-indigo-50 px-1 rounded">admin</span></p>
                    <p className="font-mono mt-0.5">Pass: <span className="text-indigo-700 font-bold bg-indigo-50 px-1 rounded">admin150k</span></p>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
                    <p className="text-slate-800 font-extrabold mb-1">👤 Akun Gudang Pusat:</p>
                    <p className="font-mono">User: <span className="text-indigo-700 font-bold bg-indigo-50 px-1 rounded">gudang</span></p>
                    <p className="font-mono mt-0.5">Pass: <span className="text-indigo-700 font-bold bg-indigo-50 px-1 rounded">gudang150k</span></p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        ) : (
          <>
            {/* ----------------- SUB-SECTION: DASHBOARD METRICS (Row 1) ----------------- */}
            <section className="col-span-12">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col">
            
            {/* Header Ringkasan */}
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-3xs">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-50 text-blue-900 rounded-lg">
                  <Layers className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-xs sm:text-sm font-display">Tabel Resume Ringkasan & Monitoring Tahapan PO</h3>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium">Klik salah satu baris tabel di bawah untuk memfilter data pada log pesanan secara dinamis</p>
                </div>
              </div>
              <div className="text-[11px] font-mono text-slate-500 bg-white border border-slate-150 px-3 py-1 rounded-lg shadow-3xs self-start sm:self-auto">
                Total Kolektif: <b className="text-slate-900 font-extrabold">{totalPO} PO</b>
              </div>
            </div>

            {/* Table Content */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/55 text-slate-400 border-b border-slate-150/60 uppercase tracking-widest text-[9px] font-black">
                    <th className="py-2.5 px-4 font-display">Tahapan / Proses Logistik</th>
                    <th className="py-2.5 px-3 font-display">Kode Tahap</th>
                    <th className="py-2.5 px-3 text-center font-display">Total Pesanan</th>
                    <th className="py-2.5 px-4 font-display">Porsi Berjalan (%)</th>
                    <th className="py-2.5 px-4 text-right font-display">Status Filter</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150/45">
                  {metricsData.map((item) => {
                    const isActive = selectedStatusFilter === item.id;
                    const IconComp = item.icon;
                    return (
                      <tr 
                        key={item.id}
                        onClick={() => setSelectedStatusFilter(item.id)}
                        className={`transition-all duration-150 cursor-pointer select-none group/row ${
                          isActive 
                            ? 'bg-blue-50/50 hover:bg-blue-50/70 font-semibold text-slate-900' 
                            : 'hover:bg-slate-50/70'
                        }`}
                      >
                        <td className="py-2.5 px-4 flex items-center gap-3">
                          <div className={`p-1.5 rounded-lg transition-transform duration-200 group-hover/row:scale-105 ${item.iconColor}`}>
                            <IconComp className="h-4 w-4" />
                          </div>
                          <div>
                            <span className={`text-xs font-bold ${isActive ? 'text-blue-900 font-extrabold' : 'text-slate-800'}`}>
                              {item.stage}
                            </span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded border ${
                            isActive 
                              ? 'bg-blue-100 text-blue-800 border-blue-200' 
                              : 'bg-slate-100 text-slate-500 border-slate-200/60'
                          }`}>
                            {item.code}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className={`text-xs font-extrabold font-mono ${isActive ? 'text-blue-950 font-black' : 'text-slate-800'}`}>
                            {item.count} <span className="text-[10px] font-medium text-slate-400 font-sans">PO</span>
                          </span>
                        </td>
                        <td className="py-2.5 px-4 min-w-[120px]">
                          <div className="flex items-center gap-2.5">
                            <div className="w-24 bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200/55">
                              <div 
                                className={`h-full rounded-full transition-all duration-500 ${
                                  item.id === 'ALL' ? 'bg-slate-500' :
                                  item.id === 'TOKO_ORDERED' ? 'bg-blue-500' :
                                  item.id === 'GUDANG_ORDERED_TO_SUPPLIER' ? 'bg-amber-500' :
                                  item.id === 'ARRIVED_AT_GUDANG' ? 'bg-purple-500' : 'bg-emerald-500'
                                }`}
                                style={{ width: `${item.progress}%` }}
                              ></div>
                            </div>
                            <span className="text-[10px] font-extrabold text-slate-500 block w-8 font-mono">{item.progress}%</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            {isActive ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-black tracking-wider text-blue-700 bg-blue-100/60 px-2 py-0.5 rounded-full border border-blue-200 shadow-3xs">
                                <span className="w-1.5 h-1.5 bg-blue-605 bg-blue-600 rounded-full animate-ping"></span>
                                AKTIF
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400 font-bold group-hover/row:text-slate-700 transition-colors bg-slate-50/50 px-2 py-0.5 rounded border border-slate-100">
                                Saring Data
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

          </div>
        </section>

        {/* ----------------- SUB-SECTION: LEFT PANEL - PO ORDER LISTING (12 Cols) ----------------- */}
        <section className="col-span-12 flex flex-col gap-6">

          {/* List and Filter Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col flex-1">
            
            {/* Control Header */}
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
              <div>
                <h2 className="font-extrabold text-slate-900 font-display flex items-center gap-2">
                  <Sliders className="h-4.5 w-4.5 text-blue-900" />
                  Daftar Pesanan Frame PO
                </h2>
                <p className="text-xs text-slate-500 font-medium">Memantau status kacamata yang sedang diproses</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleExportCSV}
                  className="flex items-center justify-center gap-1.5 px-4.5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-950 border border-slate-200/80 rounded-xl text-xs font-bold transition-all shadow-2xs hover:shadow-xs cursor-pointer shrink-0"
                  id="btn-ekspor-csv"
                  title="Ekspor list pesanan aktif ke format CSV"
                >
                  <Download className="h-4 w-4 text-slate-500" />
                  Ekspor CSV
                </button>

                {activeRole === 'TOKOBASIC' && (
                  <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="flex items-center justify-center gap-1.5 px-4.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-blue-100 hover:shadow-md cursor-pointer shrink-0"
                    id="btn-tambah-po"
                  >
                    <Plus className="h-4 w-4" />
                    Input PO Online
                  </button>
                )}
              </div>
            </div>

            {/* Search and Filters Bar */}
            <div className="p-4 bg-white border-b border-slate-100 flex flex-col gap-3">
              <div className="flex flex-col md:flex-row gap-3">
                
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari No Referensi, SKU, atau warna..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 hover:bg-slate-100/50 focus:bg-white pl-10 pr-4 py-2.5 text-xs font-medium border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition-all placeholder:text-slate-400 text-slate-800"
                    id="search-input"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Status Filter buttons */}
                <div className="flex gap-1.5 overflow-x-auto pb-1 md:pb-0 font-sans scrollbar-none no-scrollbar">
                  <button
                    onClick={() => setSelectedStatusFilter('ALL')}
                    className={`px-3.5 py-2 text-xs font-bold rounded-xl shrink-0 transition-all duration-200 cursor-pointer ${
                      selectedStatusFilter === 'ALL' 
                        ? 'bg-slate-900 text-white shadow-sm' 
                        : 'bg-slate-50 text-slate-600 border border-slate-200/60 hover:bg-slate-100/85'
                    }`}
                  >
                    Semua ({orders.length})
                  </button>
                  <button
                    onClick={() => setSelectedStatusFilter('TOKO_ORDERED')}
                    className={`px-3.5 py-2 text-xs font-bold rounded-xl shrink-0 transition-all duration-200 cursor-pointer ${
                      selectedStatusFilter === 'TOKO_ORDERED' 
                        ? 'bg-blue-600 text-white shadow-sm' 
                        : 'bg-blue-50/50 text-blue-700 border border-blue-100/60 hover:bg-blue-50'
                    }`}
                  >
                    Toko Order ({countTokoOrdered})
                  </button>
                  <button
                    onClick={() => setSelectedStatusFilter('GUDANG_ORDERED_TO_SUPPLIER')}
                    className={`px-3.5 py-2 text-xs font-bold rounded-xl shrink-0 transition-all duration-200 cursor-pointer ${
                      selectedStatusFilter === 'GUDANG_ORDERED_TO_SUPPLIER' 
                        ? 'bg-amber-600 text-white shadow-sm font-bold' 
                        : 'bg-amber-50/50 text-amber-800 border border-amber-100/60 hover:bg-amber-50'
                    }`}
                  >
                    Supplier ({countGudangOrdered})
                  </button>
                  <button
                    onClick={() => setSelectedStatusFilter('ARRIVED_AT_GUDANG')}
                    className={`px-3.5 py-2 text-xs font-bold rounded-xl shrink-0 transition-all duration-200 cursor-pointer ${
                      selectedStatusFilter === 'ARRIVED_AT_GUDANG' 
                        ? 'bg-purple-600 text-white shadow-sm' 
                        : 'bg-purple-50/50 text-purple-700 border border-purple-100/60 hover:bg-purple-50'
                    }`}
                  >
                    Gudang ({countArrivedGudang})
                  </button>
                  <button
                    onClick={() => setSelectedStatusFilter('SHIPPED_TO_TOKO')}
                    className={`px-3.5 py-2 text-xs font-bold rounded-xl shrink-0 transition-all duration-200 cursor-pointer ${
                      selectedStatusFilter === 'SHIPPED_TO_TOKO' 
                        ? 'bg-emerald-600 text-white shadow-sm' 
                        : 'bg-emerald-50/50 text-emerald-700 border border-emerald-100/60 hover:bg-emerald-50'
                    }`}
                  >
                    Dikirim ({countShipped})
                  </button>
                </div>

              </div>

              {activeRole === 'TOKOBASIC' && loggedInBranch && (
                <div className="flex flex-wrap items-center gap-3 bg-blue-50/55 p-3 rounded-xl border border-blue-200/50 text-xs font-sans mt-0.5 animate-fade-in">
                  <label className="relative flex items-center gap-2.5 cursor-pointer select-none font-bold text-slate-700">
                    <input 
                      type="checkbox" 
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4 transition-all"
                      checked={showOnlyMyBranch}
                      onChange={(e) => setShowOnlyMyBranch(e.target.checked)}
                    />
                    <span>Hanya Tampilkan PO Toko Saya (<b className="text-blue-900 font-extrabold">{loggedInBranch}</b>)</span>
                  </label>
                  <span className="text-slate-300 hidden sm:inline">|</span>
                  <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
                    {showOnlyMyBranch 
                      ? "Menyaring pesanan secara otomatis sehingga hanya PO dari toko Anda yang muncul." 
                      : "Menampilkan seluruh list pesanan multi-cabang (Mode review/baca saja)."}
                  </p>
                </div>
              )}

            </div>

            {/* Form Input PO Overlay/Dropdown */}
            <AnimatePresence>
              {showAddForm && activeRole === 'TOKOBASIC' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="bg-blue-50/70 border-b border-blue-200 overflow-hidden"
                >
                  <form onSubmit={handleSubmitOrder} className="p-5 flex flex-col gap-4">
                    <div className="flex justify-between items-center bg-blue-100/50 -mx-5 -mt-5 px-5 py-3 border-b border-blue-200">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="h-4 w-4 text-blue-700" />
                        <h3 className="text-sm font-bold text-blue-900 font-display">Isi Form Order Kacamata PO Online</h3>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => setShowAddForm(false)}
                        className="text-blue-700 hover:text-blue-900"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Pre-fill Preset Buttons to facilitate frictionless testing */}
                    <div>
                      <span className="text-xs font-bold text-blue-800 block mb-2 font-display">💡 AUTO DEMO TEMPLATES (Pilih Salah Satu untuk Isi Cepat):</span>
                      <div className="flex flex-wrap gap-2">
                        {SAMPLE_TEMPLATES.map((tpl, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => applyPresetTemplate(idx)}
                            className="bg-white hover:bg-slate-100 border border-blue-300 text-blue-900 text-xs px-2.5 py-1.5 rounded-md shadow-3xs cursor-pointer font-medium flex items-center gap-1 font-sans"
                          >
                            <Sparkles className="h-3 w-3 text-amber-500" />
                            {tpl.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Toko Pengorder <span className="text-red-500">*</span></label>
                        {loggedInBranch ? (
                          <div className="w-full bg-blue-50/70 border border-blue-200/80 rounded-lg text-blue-950 text-xs px-3 py-2.5 font-bold flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full inline-block animate-pulse"></span>
                            <span>{loggedInBranch}</span>
                            <span className="text-[9px] text-blue-600 font-medium ml-auto bg-white px-1.5 py-0.5 rounded border border-blue-100">Otomatis Login</span>
                          </div>
                        ) : (
                          <select
                            value={submittor}
                            onChange={(e) => setSubmittor(e.target.value)}
                            className="w-full bg-white text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none font-medium"
                          >
                            <option value="Karya Dame">Karya Dame</option>
                            <option value="Mansyur">Mansyur</option>
                            <option value="Halat">Halat</option>
                            <option value="Johor">Johor</option>
                            <option value="Ringroad">Ringroad</option>
                            <option value="Marelan">Marelan</option>
                            <option value="Pancing">Pancing</option>
                            <option value="Kapten Muslim">Kapten Muslim</option>
                            <option value="Binjai">Binjai</option>
                            <option value="Siantar">Siantar</option>
                            <option value="Rantau Parapat">Rantau Parapat</option>
                            <option value="Online Store">Online Store</option>
                          </select>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">No SKU Frame <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          placeholder="Contoh: SKU-XYZ-880"
                          value={sku}
                          onChange={(e) => setSku(e.target.value)}
                          className="w-full bg-white text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none placeholder:text-slate-400 font-mono font-semibold"
                          required
                          id="input-sku"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Jumlah Qty <span className="text-red-500">*</span></label>
                        <input
                          type="number"
                          min="1"
                          placeholder="Jumlah"
                          value={qty}
                          onChange={(e) => setQty(parseInt(e.target.value) || 1)}
                          className="w-full bg-white text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none font-bold"
                          required
                          id="input-qty"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Warna Frame <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          placeholder="Contoh: Matte Black Gold"
                          value={color}
                          onChange={(e) => setColor(e.target.value)}
                          className="w-full bg-white text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none placeholder:text-slate-400 font-medium"
                          required
                          id="input-warna"
                        />
                      </div>

                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Catatan Tambahan</label>
                      <input
                        type="text"
                        placeholder="Contoh: Customer request lensa anti-radiasi warna ungu..."
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        className="w-full bg-white text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none placeholder:text-slate-400 font-medium"
                        id="input-note"
                      />
                    </div>

                    {/* Image Attachment Block with Upload Interaction */}
                    <div>
                      <span className="block text-xs font-semibold text-slate-700 mb-2 font-display">📸 LAMPIRAN FOTO FRAME (Penting Untuk QC Gudang):</span>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        
                        {/* Tampak Depan */}
                        <div className="bg-white border border-dashed border-slate-300 rounded-lg p-3 text-center flex flex-col items-center justify-center min-h-[140px]">
                          <span className="text-xs font-bold text-slate-800 mb-1 inline-flex items-center gap-1 font-sans">
                            <Eye className="h-3 w-3 text-blue-600" /> Tampak Depan
                          </span>
                          
                          {photoFront ? (
                            <div className="relative group mt-1">
                              <img src={photoFront} className="h-20 w-32 object-cover rounded border" alt="Front Preview" />
                              <button 
                                type="button" 
                                onClick={() => setPhotoFront('')}
                                className="absolute -top-1.5 -right-1.5 p-0.5 bg-red-650 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ) : (
                            <div className="py-2 flex flex-col items-center">
                              <p className="text-[10px] text-slate-400">Pilih file / gunakan template</p>
                              <button
                                type="button"
                                onClick={() => fileInputFrontRef.current?.click()}
                                className="mt-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] font-bold cursor-pointer"
                              >
                                Upload Foto
                              </button>
                              <input 
                                type="file" 
                                accept="image/*" 
                                ref={fileInputFrontRef} 
                                onChange={(e) => handleFileChange(e, 'front')} 
                                className="hidden" 
                              />
                            </div>
                          )}
                        </div>

                        {/* Tampak Samping */}
                        <div className="bg-white border border-dashed border-slate-300 rounded-lg p-3 text-center flex flex-col items-center justify-center min-h-[140px]">
                          <span className="text-xs font-bold text-slate-800 mb-1 inline-flex items-center gap-1 font-sans">
                            <Sliders className="h-3 w-3 text-amber-500" /> Tampak Samping
                          </span>
                          
                          {photoSide ? (
                            <div className="relative group mt-1">
                              <img src={photoSide} className="h-20 w-32 object-cover rounded border" alt="Side Preview" />
                              <button 
                                type="button" 
                                onClick={() => setPhotoSide('')}
                                className="absolute -top-1.5 -right-1.5 p-0.5 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ) : (
                            <div className="py-2 flex flex-col items-center">
                              <p className="text-[10px] text-slate-400">Pilih file / gunakan template</p>
                              <button
                                type="button"
                                onClick={() => fileInputSideRef.current?.click()}
                                className="mt-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] font-bold cursor-pointer"
                              >
                                Upload Foto
                              </button>
                              <input 
                                type="file" 
                                accept="image/*" 
                                ref={fileInputSideRef} 
                                onChange={(e) => handleFileChange(e, 'side')} 
                                className="hidden" 
                              />
                            </div>
                          )}
                        </div>

                        {/* Tampak SKU */}
                        <div className="bg-white border border-dashed border-slate-300 rounded-lg p-3 text-center flex flex-col items-center justify-center min-h-[140px]">
                          <span className="text-xs font-bold text-slate-800 mb-1 inline-flex items-center gap-1 font-sans">
                            <Hash className="h-3 w-3 text-purple-600" /> Tampak SKU Label
                          </span>
                          
                          {photoSku ? (
                            <div className="relative group mt-1">
                              <img src={photoSku} className="h-20 w-32 object-cover rounded border" alt="Sku Preview" />
                              <button 
                                type="button" 
                                onClick={() => setPhotoSku('')}
                                className="absolute -top-1.5 -right-1.5 p-0.5 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ) : (
                            <div className="py-2 flex flex-col items-center">
                              <p className="text-[10px] text-slate-400">Pilih file / gunakan template</p>
                              <button
                                type="button"
                                onClick={() => fileInputSkuRef.current?.click()}
                                className="mt-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] font-bold cursor-pointer"
                              >
                                Upload Foto
                              </button>
                              <input 
                                type="file" 
                                accept="image/*" 
                                ref={fileInputSkuRef} 
                                onChange={(e) => handleFileChange(e, 'sku')} 
                                className="hidden" 
                              />
                            </div>
                          )}
                        </div>

                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowAddForm(false)}
                        className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-bold transition-all cursor-pointer"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        disabled={submittingOrder}
                        className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow flex items-center gap-1.5 disabled:opacity-50 cursor-pointer animate-pulse"
                        id="btn-submit-po"
                      >
                        {submittingOrder ? (
                          <>
                            <RefreshCw className="h-4.5 w-4.5 animate-spin" />
                            Mengirim Order...
                          </>
                        ) : (
                          <>
                            <Send className="h-3.5 w-3.5" />
                            Kirim Order Ke Gudang
                          </>
                        )}
                      </button>
                    </div>

                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Compact Table representation instead of big vertical cards (Fulfilling clear web view spec) */}
            <div className="overflow-x-auto overflow-y-auto max-h-[580px] text-slate-600 font-sans">
              <table className="w-full text-left border-collapse table-auto whitespace-nowrap">
                <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 z-10 text-[10px] font-extrabold text-slate-400 tracking-wider uppercase select-none font-display">
                  <tr>
                    <th className="py-3 px-4">No Referensi</th>
                    <th className="py-3 px-4">Cabang</th>
                    <th className="py-3 px-4">Detail SKU / Warna</th>
                    <th className="py-3 px-3 text-center">Qty</th>
                    <th className="py-3 px-3">Tanggal & Target</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150/60 text-xs text-slate-700">
                  {loading && orders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-16 text-center text-slate-500">
                        <RefreshCw className="h-7 w-7 animate-spin mx-auto mb-3 text-slate-400" />
                        Sinkronisasi data orderan PO...
                      </td>
                    </tr>
                  ) : filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-16 text-center text-slate-400 font-semibold bg-slate-50/20">
                        <AlertCircle className="h-7 w-7 mx-auto mb-2 text-slate-300" />
                        Tidak ada kacamata PO yang cocok dengan filter aktif.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((ord) => {
                      const isActive = ord.id === selectedOrderId;
                      const milestone = STATUS_MILESTONES[ord.currentStatus as OrderStatus] || STATUS_MILESTONES.TOKO_ORDERED;
                      const storeName = ord.statusHistory && ord.statusHistory[0] ? ord.statusHistory[0].updatedBy : "Mitra Toko";
                      
                      return (
                        <tr
                          key={ord.id}
                          onClick={() => handleSelectOrder(ord.id)}
                          className={`group hover:bg-slate-50/70 transition-all cursor-pointer border-l-4 ${
                            isActive 
                              ? 'bg-blue-50/30 border-blue-600 font-bold text-slate-900' 
                              : 'border-transparent text-slate-700'
                          }`}
                        >
                          {/* No Referensi PO */}
                          <td className="py-3 px-4">
                            <span className="font-mono text-xs font-black text-slate-900 bg-slate-100 rounded-lg px-2.5 py-1 tracking-tight border border-slate-200/50 group-hover:bg-slate-200/45 transition-colors">
                              {ord.id}
                            </span>
                          </td>

                          {/* Cabang Toko */}
                          <td className="py-3 px-4">
                            <span className="font-extrabold text-slate-800 text-[11px] bg-slate-50 px-2.5 py-0.5 rounded border border-slate-150">
                              {storeName}
                            </span>
                          </td>

                          {/* SKU & Color Detail */}
                          <td className="py-3 px-4">
                            <div className="flex flex-col">
                              <span className="font-mono text-xs font-extrabold text-slate-800">
                                {ord.sku}
                              </span>
                              <span className="text-[10px] text-slate-500 font-medium">
                                {ord.color}
                              </span>
                            </div>
                          </td>

                          {/* Qty */}
                          <td className="py-3 px-3 text-center">
                            <span className="text-[10px] font-mono font-black bg-slate-100/85 px-2.5 py-1 rounded-md text-slate-800 border border-slate-200/30">
                              {ord.qty} Pcs
                            </span>
                          </td>

                          {/* Tanggal PO dan Estimasi */}
                          <td className="py-3 px-3">
                            <div className="flex flex-col text-[10px] space-y-0.5">
                              <span className="text-slate-500 font-medium flex items-center gap-1">
                                <Calendar className="h-3 w-3 text-slate-400 shrink-0" />
                                {ord.orderDate}
                              </span>
                              <span className="text-amber-800 font-bold flex items-center gap-1">
                                <Clock className="h-3 w-3 text-amber-500 shrink-0" />
                                Est: {ord.estimatedCompletion}
                              </span>
                            </div>
                          </td>

                          {/* Badge Status */}
                          <td className="py-3 px-4 text-center">
                            <span className={`inline-block text-[10px] font-extrabold px-2.5 py-1 rounded-full border shadow-3xs ${milestone.color}`}>
                              {milestone.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* List Footer Info */}
            <div className="p-3 bg-slate-50 border-t border-slate-100 text-center text-xs text-slate-400 flex flex-col sm:flex-row justify-between items-center gap-2">
              <span>Menampilkan <b>{filteredOrders.length}</b> dari {orders.length} orderan PO terdaftar.</span>
              <span className="text-[10px] font-mono text-slate-400">Terakhir disinkronisasi: {lastSynced.toLocaleTimeString()}</span>
            </div>

          </div>

        </section>

        {/* ----------------- SUB-SECTION: LOWER ROW - DETAILS & SIMULATION SIDE-BY-SIDE ----------------- */}
        
        {/* 1. Detail & Progress Card (Full Width) */}
        <section className="col-span-12 lg:col-span-12 flex flex-col gap-6">

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col h-full min-h-[580px]">
            
            {/* Elegant Header */}
            <div className="bg-slate-50 border-b border-slate-150 p-4 flex items-center gap-2 shadow-2xs">
              <div className="p-2 bg-blue-50 text-blue-950 rounded-lg">
                <FileText className="h-4.5 w-4.5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm font-display">Spesifikasi Detail & Progress PO</h3>
                <p className="text-[11px] text-slate-500 font-medium">Foto fisik kacamata, status pengerjaan, dan log performa QC</p>
              </div>
            </div>

            {/* TAB CONTENT: DETAILS & ACTIONS */}
            <div className="flex-1 flex flex-col min-h-0 bg-white">
              {!selectedOrder ? (
                <div className="m-auto text-center py-16 px-6 text-slate-400 flex flex-col items-center">
                  <div className="h-14 w-14 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-center justify-center mb-4 text-slate-500 animate-pulse">
                    <Sliders className="h-6 w-6" />
                  </div>
                  <p className="font-bold text-slate-800 text-[13px] uppercase tracking-wider mb-1 font-display">PILIH PESANAN PO</p>
                  <p className="text-xs text-slate-500 max-w-[280px] leading-relaxed">
                    Klik salah satu baris tabel di atas untuk menampilkan spesifikasi detail, foto lab, alur monitoring, dan modul input logistik.
                  </p>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto max-h-[700px] p-5 space-y-6">
                  
                  {/* Specifications header band */}
                  <div className="flex items-center justify-between border-b border-slate-200/50 pb-3">
                    <div>
                      <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest block">IDENTITAS DETIL PO:</span>
                      <h3 className="text-sm font-extrabold text-slate-900 font-mono inline-flex items-center gap-1.5 mt-1">
                        Ref: {selectedOrder.id}
                      </h3>
                    </div>
                    <span className="text-[10px] font-black text-slate-800 bg-slate-50 px-2 py-1 rounded-md border border-slate-150">
                      {selectedOrder.orderDate}
                    </span>
                  </div>

                  {/* Image Grid */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-extrabold text-slate-400 block uppercase tracking-wider font-display">📸 FOTO PRODUK KACAMATA / PREVIEW:</span>
                    <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-150/40">
                      
                      {/* Front Image */}
                      <div className="border border-slate-200 rounded-lg overflow-hidden relative bg-white group aspect-square">
                        <img src={selectedOrder.photoFront} className="w-full h-full object-cover" alt="Tampak Depan" referrerPolicy="no-referrer" />
                        <div className="absolute top-1 left-1 bg-slate-900/85 text-[8px] font-extrabold text-white px-1 rounded shadow">
                          DPN
                        </div>
                        <a 
                          href={selectedOrder.photoFront} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="absolute inset-0 bg-slate-900/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all text-white hover:scale-105 cursor-pointer"
                        >
                          <Eye className="h-4 w-4" />
                        </a>
                      </div>

                      {/* Side Image */}
                      <div className="border border-slate-200 rounded-lg overflow-hidden relative bg-white group aspect-square">
                        <img src={selectedOrder.photoSide} className="w-full h-full object-cover" alt="Tampak Samping" referrerPolicy="no-referrer" />
                        <div className="absolute top-1 left-1 bg-slate-900/85 text-[8px] font-extrabold text-white px-1 rounded shadow">
                          SMP
                        </div>
                        <a 
                          href={selectedOrder.photoSide} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="absolute inset-0 bg-slate-900/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all text-white hover:scale-105 cursor-pointer"
                        >
                          <Eye className="h-4 w-4" />
                        </a>
                      </div>

                      {/* SKU Label Image */}
                      <div className="border border-slate-200 rounded-lg overflow-hidden relative bg-white group aspect-square">
                        <img src={selectedOrder.photoSku} className="w-full h-full object-cover" alt="Tampak SKU" referrerPolicy="no-referrer" />
                        <div className="absolute top-1 left-1 bg-slate-900/85 text-[8px] font-extrabold text-white px-1 rounded shadow">
                          SKU
                        </div>
                        <a 
                          href={selectedOrder.photoSku} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="absolute inset-0 bg-slate-900/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all text-white hover:scale-105 cursor-pointer"
                        >
                          <Eye className="h-4 w-4" />
                        </a>
                      </div>

                    </div>
                  </div>

                  {/* Item Details Specs Sheet */}
                  <div className="bg-slate-50 border border-slate-200/50 rounded-xl p-3.5 space-y-2 text-xs">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 font-medium">
                      <div>
                        <p className="text-[10px] text-slate-400 font-extrabold uppercase mb-0.5">SKU FRAME</p>
                        <p className="text-slate-800 font-mono font-bold">{selectedOrder.sku}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-extrabold uppercase mb-0.5">VARIASI WARNA</p>
                        <p className="text-slate-800">{selectedOrder.color}</p>
                      </div>
                      <div className="pt-1.5 border-t border-slate-200/40">
                        <p className="text-[10px] text-slate-400 font-extrabold uppercase mb-0.5">JUMLAH (QUANTITY)</p>
                        <p className="text-slate-800 font-bold">{selectedOrder.qty} Pcs</p>
                      </div>
                      <div className="pt-1.5 border-t border-slate-200/40">
                        <p className="text-[10px] text-slate-400 font-extrabold uppercase mb-0.5">ESTIMASI SELESAI</p>
                        <p className="text-amber-800 font-bold">{selectedOrder.estimatedCompletion}</p>
                      </div>
                    </div>
                    {selectedOrder.note && (
                      <div className="mt-2.5 pt-2 border-t border-slate-200/50">
                        <p className="text-[10px] text-slate-400 font-extrabold uppercase mb-1">CATATAN KHUSUS PELANGGAN:</p>
                        <p className="text-slate-700 bg-white p-2 rounded-lg border border-slate-150 leading-relaxed text-[11px] font-sans">
                          {selectedOrder.note}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Foto Fisik Tiba di Gudang (QC Passed) */}
                  {selectedOrder.photoArrivedGudang && (
                    <div className="bg-purple-50/75 border border-purple-200 rounded-xl p-3.5 space-y-2 text-xs font-sans animate-fade-in shadow-2xs">
                      <div className="flex items-center gap-2 text-purple-950 font-black font-display text-[10px] tracking-wider uppercase">
                        <CheckCircle2 className="h-4 w-4 text-purple-700 animate-pulse" />
                        <span>📸 FOTO BUKTI FISIK DI GUDANG (QC PASSED):</span>
                      </div>
                      <div className="relative border border-purple-200/50 rounded-lg overflow-hidden bg-white max-h-[220px] shadow-sm flex items-center justify-center">
                        <img 
                          src={selectedOrder.photoArrivedGudang} 
                          className="w-full max-h-[220px] object-contain hover:scale-[1.01] transition-transform duration-300" 
                          alt="Foto Fisik Tiba di Gudang" 
                          referrerPolicy="no-referrer" 
                        />
                        <a 
                          href={selectedOrder.photoArrivedGudang} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="absolute bottom-2.5 right-2.5 bg-purple-950 hover:bg-purple-900 text-[9px] font-extrabold text-white px-2.5 py-1.5 rounded-lg shadow-sm flex items-center gap-1 cursor-pointer transition-colors border border-purple-755"
                        >
                          <Eye className="h-3 w-3 text-purple-200" />
                          <span>Perbesar Foto</span>
                        </a>
                      </div>
                      <p className="text-[10px] text-purple-900/90 leading-relaxed font-semibold">
                        • Diunggah oleh staf gudang saat status berubah menjadi <b>Frame Tiba di Gudang</b>. Toko silakan lakukan verifikasi fisik tag dan kecocokan warna frame di atas.
                      </p>
                    </div>
                  )}

                  {/* Foto Fisik Diterima di Cabang Toko */}
                  {selectedOrder.photoArrivedToko && (
                    <div className="bg-indigo-50/75 border border-indigo-200 rounded-xl p-3.5 space-y-2 text-xs font-sans animate-fade-in shadow-2xs">
                      <div className="flex items-center gap-2 text-indigo-950 font-black font-display text-[10px] tracking-wider uppercase">
                        <CheckCircle2 className="h-4 w-4 text-indigo-700 animate-pulse" />
                        <span>📸 FOTO HASIL TERIMA & QC CABANG TOKO:</span>
                      </div>
                      <div className="relative border border-indigo-200/50 rounded-lg overflow-hidden bg-white max-h-[220px] shadow-sm flex items-center justify-center">
                        <img 
                          src={selectedOrder.photoArrivedToko} 
                          className="w-full max-h-[220px] object-contain hover:scale-[1.01] transition-transform duration-300" 
                          alt="Foto Fisik Tiba di Toko" 
                          referrerPolicy="no-referrer" 
                        />
                        <a 
                          href={selectedOrder.photoArrivedToko} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="absolute bottom-2.5 right-2.5 bg-indigo-950 hover:bg-indigo-900 text-[9px] font-extrabold text-white px-2.5 py-1.5 rounded-lg shadow-sm flex items-center gap-1 cursor-pointer transition-colors border border-indigo-755"
                        >
                          <Eye className="h-3 w-3 text-indigo-200" />
                          <span>Perbesar Foto</span>
                        </a>
                      </div>
                      <p className="text-[10px] text-indigo-900/90 leading-relaxed font-semibold">
                        • Diunggah oleh toko pengorder saat status berubah menjadi <b>Barang Diterima di Toko</b>. PO ini telah resmi selesai diverifikasi oleh cabang bersangkutan.
                      </p>
                    </div>
                  )}

                  {/* Status Stepper Tracker */}
                  <div className="border-t border-slate-100 pt-4">
                    <span className="text-[10px] font-extrabold text-slate-400 block mb-4 uppercase tracking-widest font-display">📊 ALUR MONITORING PROGRESS PO:</span>
                    
                    <div className="grid grid-cols-5 relative mt-2 gap-1 md:gap-2">
                      {/* Connecting Line */}
                      <div className="absolute top-3 left-0 right-0 h-1.5 bg-slate-100 rounded-full -z-0">
                        <div 
                          className="h-full bg-slate-900 rounded-full transition-all duration-500 shadow-3xs"
                          style={{
                            width: 
                              selectedOrder.currentStatus === 'TOKO_ORDERED' ? '10%' :
                              selectedOrder.currentStatus === 'GUDANG_ORDERED_TO_SUPPLIER' ? '30%' :
                              selectedOrder.currentStatus === 'ARRIVED_AT_GUDANG' ? '50%' :
                              selectedOrder.currentStatus === 'SHIPPED_TO_TOKO' ? '70%' : '100%'
                          }}
                        ></div>
                      </div>

                      {/* Step 1 */}
                      <div className="flex flex-col items-center text-center relative z-10 font-sans">
                        <div className={`h-6.5 w-6.5 rounded-full flex items-center justify-center font-bold text-xs border-2 transition-all duration-300 ${
                          selectedOrder.currentStatus === 'TOKO_ORDERED'
                            ? 'bg-blue-600 border-blue-600 text-white shadow-md scale-110'
                            : ['GUDANG_ORDERED_TO_SUPPLIER', 'ARRIVED_AT_GUDANG', 'SHIPPED_TO_TOKO', 'ARRIVED_AT_TOKO'].includes(selectedOrder.currentStatus)
                            ? 'bg-slate-900 border-slate-900 text-white'
                            : 'bg-white border-slate-200 text-slate-450'
                        }`}>
                          {['GUDANG_ORDERED_TO_SUPPLIER', 'ARRIVED_AT_GUDANG', 'SHIPPED_TO_TOKO', 'ARRIVED_AT_TOKO'].includes(selectedOrder.currentStatus) ? (
                            <Check className="h-3 w-3" />
                          ) : '1'}
                        </div>
                        <span className="text-[9px] font-extrabold text-slate-800 mt-1.5 leading-tight">Order Toko</span>
                      </div>

                      {/* Step 2 */}
                      <div className="flex flex-col items-center text-center relative z-10 font-sans">
                        <div className={`h-6.5 w-6.5 rounded-full flex items-center justify-center font-bold text-xs border-2 transition-all duration-300 ${
                          selectedOrder.currentStatus === 'GUDANG_ORDERED_TO_SUPPLIER'
                            ? 'bg-amber-500 border-amber-500 text-white shadow-md scale-110'
                            : ['ARRIVED_AT_GUDANG', 'SHIPPED_TO_TOKO', 'ARRIVED_AT_TOKO'].includes(selectedOrder.currentStatus)
                            ? 'bg-slate-900 border-slate-900 text-white'
                            : 'bg-white border-slate-200 text-slate-450'
                        }`}>
                          {['ARRIVED_AT_GUDANG', 'SHIPPED_TO_TOKO', 'ARRIVED_AT_TOKO'].includes(selectedOrder.currentStatus) ? (
                            <Check className="h-3 w-3" />
                          ) : '2'}
                        </div>
                        <span className="text-[9px] font-extrabold text-slate-800 mt-1.5 leading-tight">PO Supplier</span>
                      </div>

                      {/* Step 3 */}
                      <div className="flex flex-col items-center text-center relative z-10 font-sans">
                        <div className={`h-6.5 w-6.5 rounded-full flex items-center justify-center font-bold text-xs border-2 transition-all duration-300 ${
                          selectedOrder.currentStatus === 'ARRIVED_AT_GUDANG'
                            ? 'bg-purple-600 border-purple-600 text-white shadow-md scale-110'
                            : ['SHIPPED_TO_TOKO', 'ARRIVED_AT_TOKO'].includes(selectedOrder.currentStatus)
                            ? 'bg-slate-900 border-slate-900 text-white'
                            : 'bg-white border-slate-200 text-slate-450'
                        }`}>
                          {['SHIPPED_TO_TOKO', 'ARRIVED_AT_TOKO'].includes(selectedOrder.currentStatus) ? (
                            <Check className="h-3 w-3" />
                          ) : '3'}
                        </div>
                        <span className="text-[9px] font-extrabold text-slate-800 mt-1.5 leading-tight">Tiba Gudang</span>
                      </div>

                      {/* Step 4 */}
                      <div className="flex flex-col items-center text-center relative z-10 font-sans">
                        <div className={`h-6.5 w-6.5 rounded-full flex items-center justify-center font-bold text-xs border-2 transition-all duration-300 ${
                          selectedOrder.currentStatus === 'SHIPPED_TO_TOKO'
                            ? 'bg-green-600 border-green-600 text-white shadow-md scale-110'
                            : ['ARRIVED_AT_TOKO'].includes(selectedOrder.currentStatus)
                            ? 'bg-slate-900 border-slate-900 text-white'
                            : 'bg-white border-slate-200 text-slate-450'
                        }`}>
                          {['ARRIVED_AT_TOKO'].includes(selectedOrder.currentStatus) ? (
                            <Check className="h-3 w-3" />
                          ) : '4'}
                        </div>
                        <span className="text-[9px] font-extrabold text-slate-800 mt-1.5 leading-tight">Kirim Toko</span>
                      </div>

                      {/* Step 5 */}
                      <div className="flex flex-col items-center text-center relative z-10 font-sans">
                        <div className={`h-6.5 w-6.5 rounded-full flex items-center justify-center font-bold text-xs border-2 transition-all duration-300 ${
                          selectedOrder.currentStatus === 'ARRIVED_AT_TOKO'
                            ? 'bg-indigo-650 border-indigo-650 text-white shadow-md scale-110'
                            : 'bg-white border-slate-200 text-slate-450'
                        }`}>
                          {selectedOrder.currentStatus === 'ARRIVED_AT_TOKO' ? (
                            <Check className="h-3 w-3" />
                          ) : '5'}
                        </div>
                        <span className="text-[9px] font-extrabold text-slate-800 mt-1.5 leading-tight">Tiba Toko</span>
                      </div>

                    </div>
                  </div>

                  {/* Status update control panel (if admin) */}
                  <div className="border-t border-slate-100 pt-4 bg-slate-50/50 p-4 rounded-xl border border-dashed border-slate-200 font-sans">
                    <span className="text-[10px] font-extrabold text-slate-500 block mb-3 uppercase tracking-wider font-display">🔧 PEMBARUAN PROSES GUDANG:</span>
                    
                    {activeRole === 'GUDANGADMIN' ? (
                      <form onSubmit={handleUpdateStatus} className="space-y-3">
                        <div>
                          <label className="block text-[9px] font-extrabold text-slate-500 mb-1 font-display uppercase tracking-wide">Petugas Logistik</label>
                          <input 
                            type="text" 
                            value={updaterName}
                            onChange={(e) => setUpdaterName(e.target.value)}
                            className="w-full bg-white text-xs p-2 border border-slate-200 rounded-lg focus:outline-none font-semibold text-slate-800"
                            id="input-staff-gudang"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[9px] font-extrabold text-slate-500 mb-1 font-display uppercase tracking-wide">Tahapan Baru</label>
                            <select 
                              value={updateStatus}
                              onChange={(e) => setUpdateStatus(e.target.value as OrderStatus)}
                              className="w-full bg-white text-xs p-2 border border-slate-200 rounded-lg focus:outline-none font-bold text-slate-800"
                            >
                              <option value="TOKO_ORDERED">1. Toko Order ke Gudang</option>
                              <option value="GUDANG_ORDERED_TO_SUPPLIER">2. Gudang Order ke Supplier</option>
                              <option value="ARRIVED_AT_GUDANG">3. Frame Tiba di Gudang (QC & Tag)</option>
                              <option value="SHIPPED_TO_TOKO">4. Barang Dikirim/Diserahkan ke Toko</option>
                              <option value="ARRIVED_AT_TOKO">5. Barang Diterima di Toko (Selesai/Verified)</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[9px] font-extrabold text-slate-500 mb-1 font-display uppercase tracking-wide">Catatan Logistik / Toko</label>
                            <input 
                              type="text"
                              placeholder="Misal: Sudah di QC toko, barang mulus..."
                              value={updateNotes}
                              onChange={(e) => setUpdateNotes(e.target.value)}
                              className="w-full bg-white text-xs p-2 border border-slate-200 rounded-lg focus:outline-none font-medium placeholder:text-slate-400"
                            />
                          </div>
                        </div>

                        {/* Warehouse Photo Upload on "ARRIVED_AT_GUDANG" */}
                        {updateStatus === 'ARRIVED_AT_GUDANG' && (
                          <div className="bg-purple-50/70 border border-purple-200/50 rounded-xl p-3 space-y-3 animate-fade-in font-sans">
                            <div className="flex items-center justify-between">
                              <label className="block text-[10px] font-black text-purple-900 font-display uppercase tracking-wider">
                                📸 FOTO FISIK TERIMA DARI SUPPLIER <span className="text-red-500">*</span>
                              </label>
                              <span className="text-[9px] text-purple-700 font-bold bg-white px-1.5 py-0.5 rounded border border-purple-100">
                                Wajib Diisi (Gudang QC)
                              </span>
                            </div>

                            {/* Preset quick buttons or manual upload */}
                            <div className="grid grid-cols-2 gap-2">
                              {/* Option A: Quick Simulator Placeholder Photos */}
                              <button
                                type="button"
                                onClick={() => {
                                  // Assign a beautiful mock photo of frame physical verification
                                  const randomPhotos = [
                                    "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500&auto=format&fit=crop&q=60",
                                    "https://images.unsplash.com/photo-1591076482161-42ce6da69f67?w=500&auto=format&fit=crop&q=60",
                                    "https://images.unsplash.com/photo-1508296695146-257a814070b4?w=500&auto=format&fit=crop&q=60"
                                  ];
                                  const pic = randomPhotos[Math.floor(Math.random() * randomPhotos.length)];
                                  setUpdatePhotoGudang(pic);
                                }}
                                className="bg-white hover:bg-purple-100/60 text-purple-950 font-bold text-[10px] p-2.5 rounded-lg border border-purple-200 shadow-3xs flex items-center justify-center gap-1.5 transition-all text-center leading-tight cursor-pointer"
                              >
                                <Sparkles className="h-3.5 w-3.5 shrink-0 text-purple-600" />
                                <span>Gunakan Foto Simulasi Cepat (Instant)</span>
                              </button>

                              {/* Option B: Manual upload */}
                              <button
                                type="button"
                                onClick={() => fileInputPhotoGudangRef.current?.click()}
                                className="bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-[10px] p-2.5 rounded-lg border border-transparent shadow-2xs flex items-center justify-center gap-1.5 transition-all text-center leading-tight cursor-pointer"
                              >
                                <Upload className="h-3.5 w-3.5 shrink-0" />
                                <span>Pilih Gambar Dokumen/Kamera</span>
                              </button>
                            </div>

                            {/* Hidden file input */}
                            <input
                              type="file"
                              ref={fileInputPhotoGudangRef}
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleFileChange(e, 'arrivedGudang')}
                            />

                            {/* Photo preview */}
                            {updatePhotoGudang ? (
                              <div className="relative bg-white border border-purple-200 rounded-lg overflow-hidden h-36 flex items-center justify-center shadow-3xs group">
                                <img src={updatePhotoGudang} className="h-full w-full object-cover" alt="Preview Tiba Gudang" />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    type="button"
                                    onClick={() => setUpdatePhotoGudang('')}
                                    className="bg-red-650 text-white hover:bg-red-700 p-2 rounded-lg font-bold text-[10px] flex items-center gap-1 transition-colors cursor-pointer"
                                  >
                                    Hapus Preview
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="border border-dashed border-purple-200/80 rounded-lg p-4 text-center bg-white text-slate-450 leading-normal text-[11px] font-semibold">
                                ⚠️ Silakan pilih salah satu metode di atas untuk memasang foto barang nyata yang diterima fisik di gudang.
                              </div>
                            )}
                          </div>
                        )}

                        {/* Store Arrival Photo Upload on "ARRIVED_AT_TOKO" */}
                        {updateStatus === 'ARRIVED_AT_TOKO' && (
                          <div className="bg-indigo-50/70 border border-indigo-200/50 rounded-xl p-3 space-y-3 animate-fade-in font-sans">
                            <div className="flex items-center justify-between">
                              <label className="block text-[10px] font-black text-indigo-900 font-display uppercase tracking-wider">
                                📸 FOTO FISIK TERIMA DI CABANG TOKO <span className="text-red-500">*</span>
                              </label>
                              <span className="text-[9px] text-indigo-700 font-bold bg-white px-1.5 py-0.5 rounded border border-indigo-100">
                                Wajib Diisi (Toko QC)
                              </span>
                            </div>

                            {/* Preset quick buttons or manual upload */}
                            <div className="grid grid-cols-2 gap-2">
                              {/* Option A: Quick Simulator Placeholder Photos */}
                              <button
                                type="button"
                                onClick={() => {
                                  // Assign a beautiful mock photo of physical verification at branch
                                  const randomPhotos = [
                                    "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=500&auto=format&fit=crop&q=60",
                                    "https://images.unsplash.com/photo-1543512214-318c7553f230?w=500&auto=format&fit=crop&q=60",
                                    "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=500&auto=format&fit=crop&q=60"
                                  ];
                                  const pic = randomPhotos[Math.floor(Math.random() * randomPhotos.length)];
                                  setUpdatePhotoToko(pic);
                                }}
                                className="bg-white hover:bg-indigo-100/60 text-indigo-950 font-bold text-[10px] p-2.5 rounded-lg border border-indigo-200 shadow-3xs flex items-center justify-center gap-1.5 transition-all text-center leading-tight cursor-pointer"
                              >
                                <Sparkles className="h-3.5 w-3.5 shrink-0 text-indigo-600" />
                                <span>Gunakan Foto Simulasi Cepat (Instant)</span>
                              </button>

                              {/* Option B: Manual upload */}
                              <button
                                type="button"
                                onClick={() => fileInputPhotoTokoRef.current?.click()}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[10px] p-2.5 rounded-lg border border-transparent shadow-2xs flex items-center justify-center gap-1.5 transition-all text-center leading-tight cursor-pointer"
                              >
                                <Upload className="h-3.5 w-3.5 shrink-0" />
                                <span>Pilih Gambar Dokumen/Kamera</span>
                              </button>
                            </div>

                            {/* Hidden file input */}
                            <input
                              type="file"
                              ref={fileInputPhotoTokoRef}
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleFileChange(e, 'arrivedToko')}
                            />

                            {/* Photo preview */}
                            {updatePhotoToko ? (
                              <div className="relative bg-white border border-indigo-200 rounded-lg overflow-hidden h-36 flex items-center justify-center shadow-3xs group">
                                <img src={updatePhotoToko} className="h-full w-full object-cover" alt="Preview Tiba Toko" />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    type="button"
                                    onClick={() => setUpdatePhotoToko('')}
                                    className="bg-red-650 text-white hover:bg-red-700 p-2 rounded-lg font-bold text-[10px] flex items-center gap-1 transition-colors cursor-pointer"
                                  >
                                    Hapus Preview
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="border border-dashed border-indigo-200/80 rounded-lg p-4 text-center bg-white text-slate-450 leading-normal text-[11px] font-semibold">
                                ⚠️ Silakan pilih salah satu metode di atas untuk memasang foto serah terima fisik barang nyata di cabang toko.
                              </div>
                            )}
                          </div>
                        )}

                        <button
                          type="submit"
                          disabled={submittingStatus}
                          className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white font-extrabold rounded-lg text-xs transition-colors shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
                          id="btn-update-status"
                        >
                          {submittingStatus ? 'Menyimpan...' : 'Perbarui Status & Kirim WA'}
                        </button>
                      </form>
                    ) : (
                      <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl text-[11px] text-slate-600 flex items-start gap-2 leading-relaxed">
                        <Info className="h-3.5 w-3.5 text-blue-600 shrink-0 mt-0.5" />
                        <span>Untuk mengubah tahapan PO ini, pastikan Anda beralih ke <b>"Mode Gudang & Admin"</b> di tombol navigasi header atas.</span>
                      </div>
                    )}
                  </div>

                  {/* Timeline logs */}
                  <div className="border-t border-slate-100 pt-4 font-sans">
                    <span className="text-[10px] font-extrabold text-slate-400 block mb-3 uppercase tracking-widest font-display">👣 HISTORI PERFORMA & QC LOG:</span>
                    
                    <div className="relative border-l-2 border-slate-150 pl-4 ml-1 space-y-4">
                      {selectedOrder.statusHistory && [...selectedOrder.statusHistory].reverse().map((hist, i) => {
                        const milestone = STATUS_MILESTONES[hist.status as OrderStatus];
                        return (
                          <div key={hist.id} className="relative">
                            <span className={`absolute -left-[23px] top-1.5 h-2.5 w-2.5 rounded-full border border-white ${
                              i === 0 ? 'bg-amber-500 scale-125 shadow-sm' : 'bg-slate-300'
                            }`}></span>
                            
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/45 text-xs text-slate-700">
                              <div className="flex flex-wrap items-center justify-between gap-1 mb-1.5">
                                <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${milestone?.color}`}>
                                  {milestone?.label || hist.status}
                                </span>
                                <span className="text-[9px] text-slate-400 font-mono">
                                  {new Date(hist.updatedAt).toLocaleDateString()} {new Date(hist.updatedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </span>
                              </div>
                              <p className="text-[11px] font-semibold text-slate-800 leading-relaxed">
                                {hist.notes || "-"}
                              </p>
                              {hist.photoArrivedGudang && (
                                <div className="mt-2 border border-purple-150 rounded-lg overflow-hidden relative max-h-36 bg-white shadow-3xs flex items-center justify-center">
                                  <img 
                                    src={hist.photoArrivedGudang} 
                                    className="max-h-36 w-full object-contain" 
                                    alt="Physical proof" 
                                    referrerPolicy="no-referrer"
                                  />
                                  <div className="absolute top-1 right-1 bg-purple-900/85 text-[8px] font-extrabold text-white px-1.5 py-0.5 rounded shadow">
                                    QC BUKTI FISIK GUDANG
                                  </div>
                                </div>
                              )}
                              {hist.photoArrivedToko && (
                                <div className="mt-2 border border-indigo-150 rounded-lg overflow-hidden relative max-h-36 bg-white shadow-3xs flex items-center justify-center">
                                  <img 
                                    src={hist.photoArrivedToko} 
                                    className="max-h-36 w-full object-contain" 
                                    alt="Physical proof store" 
                                    referrerPolicy="no-referrer"
                                  />
                                  <div className="absolute top-1 right-1 bg-indigo-900/85 text-[8px] font-extrabold text-white px-1.5 py-0.5 rounded shadow">
                                    QC BUKTI FISIK TOKO
                                  </div>
                                </div>
                              )}
                              <div className="mt-2 flex items-center justify-between text-[9px] text-slate-400 border-t border-slate-150/40 pt-1.5 font-medium">
                                <span>Petugas: <b className="text-slate-600">{hist.updatedBy}</b></span>
                                {hist.whatsappSent && (
                                  <span className="text-emerald-700 font-extrabold bg-emerald-50 px-1.5 py-0.5 rounded flex items-center gap-0.5 border border-emerald-100/30">
                                    ✓ WA Sent ({hist.whatsappGroup})
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>
              )}
            </div>

          </div>

        </section>

          </>
        )}

      </main>

    </div>
  );
}
