
import React, { useState, useMemo, useEffect } from 'react';
import { dbService } from '../services/mockDb';
import { useApp } from '../App';
import { Product, Category, StockAdjustment, PurchaseOrder, Supplier, AdjustmentReason, Variant } from '../types';
import { 
  Plus, Edit2, Trash2, Search, Filter, X, 
  CheckCircle2, Package, History, Truck, 
  AlertCircle, ChevronRight, BarChart3, ArrowRightLeft,
  ArrowUp, ArrowDown, ClipboardList, Settings2, Eye, EyeOff,
  ChevronDown, ChevronUp, Layers, Image as ImageIcon,
  Tag
} from 'lucide-react';

type SubModule = 'products' | 'adjustments' | 'purchase-orders' | 'stocktake';

const InventoryView: React.FC = () => {
  const { currencySymbol } = useApp();
  const [activeTab, setActiveTab] = useState<SubModule>('products');
  const [products, setProducts] = useState<Product[]>(dbService.getProducts());
  const [categories] = useState<Category[]>(dbService.getCategories());
  const [adjustments, setAdjustments] = useState<StockAdjustment[]>(dbService.getAdjustments());
  const [search, setSearch] = useState('');
  
  // Modals
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isAdjModalOpen, setIsAdjModalOpen] = useState(false);
  const [isStocktakeModalOpen, setIsStocktakeModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);

  // New Product Form State
  const [newProduct, setNewProduct] = useState({
    name: '',
    sku: '',
    categoryId: categories[0]?.id || '',
    costPrice: '',
    sellingPrice: '',
    stockQuantity: '0',
    minStockLevel: '5',
    trackStock: true,
    imageUrl: ''
  });

  // Adjustment State
  const [adjType, setAdjType] = useState<'add' | 'remove'>('add');
  const [adjQty, setAdjQty] = useState('');
  const [adjReason, setAdjReason] = useState<AdjustmentReason>('restock');
  const [adjNote, setAdjNote] = useState('');

  // Stocktake State
  const [actualQty, setActualQty] = useState('');

  // Expanded Items
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set());

  const loadData = () => {
    setProducts(dbService.getProducts());
    setAdjustments(dbService.getAdjustments());
  };

  useEffect(() => {
    loadData();
  }, []);

  const lowStockCount = useMemo(() => {
    return products.filter(p => {
      if (!p.trackStock) return false;
      if (p.variants && p.variants.length > 0) {
        return p.variants.some(v => v.stockQuantity <= p.minStockLevel);
      }
      return p.stockQuantity <= p.minStockLevel;
    }).length;
  }, [products]);

  const inventoryValue = useMemo(() => {
    return products.reduce((sum, p) => {
      if (!p.trackStock) return sum;
      if (p.variants && p.variants.length > 0) {
        return sum + p.variants.reduce((vSum, v) => vSum + (v.costPrice * v.stockQuantity), 0);
      }
      return sum + (p.costPrice * p.stockQuantity);
    }, 0);
  }, [products]);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggleTracking = (id: string) => {
    const updated = products.map(p => p.id === id ? { ...p, trackStock: !p.trackStock } : p);
    dbService.updateProducts(updated);
    setProducts(updated);
  };

  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = `p${Math.random().toString(36).substr(2, 9)}`;
    const product: Product = {
      id,
      name: newProduct.name,
      sku: newProduct.sku || id.toUpperCase(),
      categoryId: newProduct.categoryId,
      costPrice: parseFloat(newProduct.costPrice) || 0,
      sellingPrice: parseFloat(newProduct.sellingPrice) || 0,
      stockQuantity: parseInt(newProduct.stockQuantity) || 0,
      minStockLevel: parseInt(newProduct.minStockLevel) || 5,
      imageUrl: newProduct.imageUrl || `https://picsum.photos/seed/${id}/200`,
      active: true,
      isComposite: false,
      trackStock: newProduct.trackStock
    };

    const updated = [...products, product];
    dbService.updateProducts(updated);
    setProducts(updated);
    setIsProductModalOpen(false);
    setNewProduct({
      name: '',
      sku: '',
      categoryId: categories[0]?.id || '',
      costPrice: '',
      sellingPrice: '',
      stockQuantity: '0',
      minStockLevel: '5',
      trackStock: true,
      imageUrl: ''
    });
  };

  const handleAdjustmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !adjQty) return;

    const qty = parseInt(adjQty);
    const change = adjType === 'add' ? qty : -qty;

    const adjustment: StockAdjustment = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      productId: selectedProduct.id,
      variantId: selectedVariant?.id,
      quantityChange: change,
      reason: adjReason,
      employeeId: 'admin-user',
      note: adjNote
    };

    dbService.addAdjustment(adjustment);
    loadData();
    setIsAdjModalOpen(false);
    setSelectedVariant(null);
  };

  const handleStocktakeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !actualQty) return;

    const actual = parseInt(actualQty);
    const expected = selectedVariant ? selectedVariant.stockQuantity : selectedProduct.stockQuantity;
    const diff = actual - expected;

    const adjustment: StockAdjustment = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      productId: selectedProduct.id,
      variantId: selectedVariant?.id,
      quantityChange: diff,
      reason: 'inventory_count',
      employeeId: 'admin-user',
      expectedStock: expected,
      actualStock: actual,
      note: `Stocktake: ${selectedVariant ? `${selectedVariant.name} variant ` : ''}discrepancy of ${diff}`
    };

    dbService.addAdjustment(adjustment);
    loadData();
    setIsStocktakeModalOpen(false);
    setSelectedVariant(null);
  };

  const toggleProductExpand = (id: string) => {
    setExpandedProducts(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Inventory Dashboard</h1>
          <p className="text-gray-500 font-medium">Professional stock auditing and multi-variant management.</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-white border border-gray-100 px-6 py-3 rounded-2xl shadow-sm">
            <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Total Valuation (Cost)</p>
            <p className="text-xl font-black text-blue-600">{currencySymbol}{inventoryValue.toLocaleString()}</p>
          </div>
          <div className="bg-orange-50 border border-orange-100 px-6 py-3 rounded-2xl flex items-center gap-4">
            <AlertCircle className="text-orange-500 w-6 h-6" />
            <div>
              <p className="text-[10px] font-black uppercase text-orange-400">Low Stock Issues</p>
              <p className="text-xl font-black text-orange-700">{lowStockCount}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2 p-1 bg-gray-100 rounded-2xl w-fit">
        {[
          { id: 'products', label: 'All Items', icon: Package },
          { id: 'stocktake', label: 'Stocktake', icon: ClipboardList },
          { id: 'adjustments', label: 'Audit History', icon: History },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as SubModule)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all ${
              activeTab === tab.id ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search inventory by name, SKU or barcode..."
                className="w-full pl-10 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm font-medium"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button 
              onClick={() => setIsProductModalOpen(true)}
              className="px-8 bg-blue-600 text-white rounded-2xl font-black shadow-lg hover:bg-blue-700 transition-all active:scale-95 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Product
            </button>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Item Detail</th>
                  <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Tracking</th>
                  <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Available Stock</th>
                  <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Unit Value</th>
                  <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredProducts.map(p => {
                  const isExpanded = expandedProducts.has(p.id);
                  const hasVariants = p.variants && p.variants.length > 0;
                  
                  return (
                    <React.Fragment key={p.id}>
                      <tr className={`hover:bg-gray-50/30 transition-colors group ${isExpanded ? 'bg-gray-50/20' : ''}`}>
                        <td className="p-6">
                          <div className="flex items-center gap-4">
                            <img src={p.imageUrl} className="w-14 h-14 rounded-2xl object-cover shadow-sm border border-gray-100" alt="" />
                            <div className="flex flex-col">
                              <div className="flex items-center gap-2">
                                <p className="font-bold text-gray-900">{p.name}</p>
                                {hasVariants && (
                                  <button onClick={() => toggleProductExpand(p.id)} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                                    {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                                  </button>
                                )}
                              </div>
                              <p className="text-xs text-gray-400 font-mono mt-0.5">{p.sku}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-6 text-center">
                          <button 
                            onClick={() => handleToggleTracking(p.id)}
                            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                              p.trackStock ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'
                            }`}
                          >
                            {p.trackStock ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                            {p.trackStock ? 'Tracking ON' : 'Service Item'}
                          </button>
                        </td>
                        <td className="p-6 text-center">
                          {p.trackStock ? (
                            <div className="flex flex-col items-center">
                               {hasVariants ? (
                                 <span className="text-[10px] font-black text-blue-600 uppercase bg-blue-50 px-2 py-0.5 rounded mb-1">
                                   {p.variants?.length} Variants
                                 </span>
                               ) : (
                                 <div className="flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full ${p.stockQuantity <= p.minStockLevel ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
                                    <span className={`text-lg font-black ${p.stockQuantity <= p.minStockLevel ? 'text-red-600' : 'text-gray-900'}`}>
                                      {p.stockQuantity}
                                    </span>
                                 </div>
                               )}
                            </div>
                          ) : (
                            <span className="text-gray-300 font-bold italic">N/A</span>
                          )}
                        </td>
                        <td className="p-6 text-right">
                          <p className="font-black text-gray-900">
                            {hasVariants && p.variants 
                              ? `${currencySymbol}${Math.min(...p.variants.map(v => v.sellingPrice)).toFixed(2)}+`
                              : `${currencySymbol}${p.sellingPrice.toFixed(2)}`
                            }
                          </p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                            {hasVariants ? 'Base Level' : `Cost: ${currencySymbol}${p.costPrice.toFixed(2)}`}
                          </p>
                        </td>
                        <td className="p-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {!hasVariants && (
                              <button 
                                onClick={() => { setSelectedProduct(p); setSelectedVariant(null); setIsAdjModalOpen(true); }}
                                disabled={!p.trackStock}
                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all disabled:opacity-30"
                              >
                                <ArrowRightLeft className="w-5 h-5" />
                              </button>
                            )}
                            <button className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all">
                              <Settings2 className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {isExpanded && hasVariants && p.variants?.map(v => (
                        <tr key={v.id} className="bg-gray-50/50 border-l-4 border-blue-500 animate-in slide-in-from-left-2 duration-200">
                          <td className="p-4 pl-12">
                            <div className="flex items-center gap-3">
                              <Layers className="w-4 h-4 text-gray-300" />
                              <div>
                                <p className="text-sm font-bold text-gray-700">{v.name}</p>
                                <p className="text-[10px] font-mono text-gray-400">{v.sku}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4"></td>
                          <td className="p-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <div className={`w-1.5 h-1.5 rounded-full ${v.stockQuantity <= p.minStockLevel ? 'bg-red-500' : 'bg-green-500'}`} />
                              <span className="font-black text-gray-900">{v.stockQuantity}</span>
                            </div>
                          </td>
                          <td className="p-4 text-right">
                            <p className="text-sm font-bold text-blue-600">{currencySymbol}{v.sellingPrice.toFixed(2)}</p>
                          </td>
                          <td className="p-4 text-right pr-6">
                            <button 
                              onClick={() => { setSelectedProduct(p); setSelectedVariant(v); setIsAdjModalOpen(true); }}
                              className="p-1.5 text-blue-400 hover:text-blue-600 hover:bg-white rounded-lg transition-all"
                            >
                              <ArrowRightLeft className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'stocktake' && (
        <div className="space-y-6">
          <div className="bg-blue-600 p-8 rounded-[2.5rem] text-white flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black">Stocktaking Mode</h2>
              <p className="text-blue-100 font-medium">Verify actual quantities on hand to adjust for shrinkage or data errors.</p>
            </div>
            <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/20">
              <ClipboardList className="w-10 h-10 text-white" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.filter(p => p.trackStock).map(p => (
              <div key={p.id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-4">
                <div className="flex items-center gap-4">
                  <img src={p.imageUrl} className="w-12 h-12 rounded-xl object-cover" alt="" />
                  <div>
                    <h4 className="font-bold text-gray-900">{p.name}</h4>
                    <p className="text-[10px] text-gray-400 font-black uppercase">
                      {p.variants ? `${p.variants.length} Variants` : `Expected: ${p.stockQuantity}`}
                    </p>
                  </div>
                </div>
                {p.variants && p.variants.length > 0 ? (
                  <div className="space-y-2 border-t border-gray-50 pt-4">
                    {p.variants.map(v => (
                      <button 
                        key={v.id}
                        onClick={() => { setSelectedProduct(p); setSelectedVariant(v); setActualQty(''); setIsStocktakeModalOpen(true); }}
                        className="w-full flex justify-between items-center p-2 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100"
                      >
                        <span className="text-xs font-bold text-gray-600">{v.name}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] text-gray-400 font-bold uppercase">On Hand: {v.stockQuantity}</span>
                          <ChevronRight className="w-3 h-3 text-gray-300" />
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <button 
                    onClick={() => { setSelectedProduct(p); setSelectedVariant(null); setActualQty(''); setIsStocktakeModalOpen(true); }}
                    className="w-full py-3 bg-gray-50 hover:bg-blue-50 hover:text-blue-600 rounded-xl font-black text-xs uppercase tracking-widest transition-all border border-gray-100"
                  >
                    Verify Count
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'adjustments' && (
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
           <div className="p-8 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-black text-gray-900 uppercase tracking-widest text-sm">Inventory History Audit</h3>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-400"><Filter className="w-4 h-4" /></button>
              </div>
           </div>
           <div className="overflow-x-auto">
             <table className="w-full text-left">
               <thead>
                  <tr className="bg-gray-50/50">
                    <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Timestamp</th>
                    <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Item / Variant</th>
                    <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Change</th>
                    <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Reason</th>
                    <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Note</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-50">
                 {adjustments.slice().sort((a, b) => b.timestamp - a.timestamp).map(adj => {
                   const product = products.find(p => p.id === adj.productId);
                   const variant = product?.variants?.find(v => v.id === adj.variantId);
                   const isPositive = adj.quantityChange > 0;
                   
                   return (
                     <tr key={adj.id} className="hover:bg-gray-50/20">
                       <td className="p-6">
                         <p className="text-xs font-bold text-gray-900">{new Date(adj.timestamp).toLocaleDateString()}</p>
                         <p className="text-[10px] text-gray-400 font-medium uppercase">{new Date(adj.timestamp).toLocaleTimeString()}</p>
                       </td>
                       <td className="p-6">
                         <p className="font-bold text-gray-900">{product?.name || 'Unknown'}</p>
                         {variant && <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{variant.name}</p>}
                       </td>
                       <td className="p-6 text-center">
                         <span className={`px-3 py-1 rounded-full text-xs font-black ${isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                           {isPositive ? '+' : ''}{adj.quantityChange}
                         </span>
                       </td>
                       <td className="p-6">
                         <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{adj.reason.replace('_', ' ')}</span>
                       </td>
                       <td className="p-6">
                         <p className="text-xs text-gray-400 italic truncate max-w-[200px]">{adj.note || '-'}</p>
                       </td>
                     </tr>
                   );
                 })}
               </tbody>
             </table>
           </div>
        </div>
      )}

      {/* Add Product Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-gray-900">Add New Product</h2>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Inventory Item Details</p>
                </div>
              </div>
              <button onClick={() => setIsProductModalOpen(false)} className="p-3 hover:bg-gray-200 rounded-full transition-colors">
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>
            
            <form onSubmit={handleProductSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Product Name</label>
                  <div className="relative">
                    <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
                    <input 
                      required
                      type="text"
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g. Fresh Apple Juice"
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">SKU / Barcode</label>
                  <input 
                    type="text"
                    className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-blue-500"
                    placeholder="AUTO-GEN"
                    value={newProduct.sku}
                    onChange={(e) => setNewProduct({...newProduct, sku: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Category</label>
                  <select 
                    className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-blue-500 appearance-none"
                    value={newProduct.categoryId}
                    onChange={(e) => setNewProduct({...newProduct, categoryId: e.target.value})}
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100 col-span-2 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                        <History className="w-4 h-4" />
                      </div>
                      <p className="font-black text-xs uppercase tracking-widest text-gray-600">Stock Tracking</p>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setNewProduct({...newProduct, trackStock: !newProduct.trackStock})}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${newProduct.trackStock ? 'bg-blue-600' : 'bg-gray-200'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${newProduct.trackStock ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                  
                  {newProduct.trackStock && (
                    <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2">
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Initial Stock</label>
                        <input 
                          type="number"
                          className="w-full p-3 bg-white border border-gray-100 rounded-xl font-bold"
                          value={newProduct.stockQuantity}
                          onChange={(e) => setNewProduct({...newProduct, stockQuantity: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Min Level Alert</label>
                        <input 
                          type="number"
                          className="w-full p-3 bg-white border border-gray-100 rounded-xl font-bold"
                          value={newProduct.minStockLevel}
                          onChange={(e) => setNewProduct({...newProduct, minStockLevel: e.target.value})}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Cost Price ({currencySymbol})</label>
                  <input 
                    required
                    type="number"
                    step="0.01"
                    className="w-full p-4 bg-gray-50 border-none rounded-2xl font-black focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                    value={newProduct.costPrice}
                    onChange={(e) => setNewProduct({...newProduct, costPrice: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Selling Price ({currencySymbol})</label>
                  <input 
                    required
                    type="number"
                    step="0.01"
                    className="w-full p-4 bg-gray-50 border-none rounded-2xl font-black text-blue-600 focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                    value={newProduct.sellingPrice}
                    onChange={(e) => setNewProduct({...newProduct, sellingPrice: e.target.value})}
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Image URL (Optional)</label>
                  <div className="relative">
                    <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
                    <input 
                      type="text"
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl font-medium text-sm focus:ring-2 focus:ring-blue-500"
                      placeholder="https://example.com/image.png"
                      value={newProduct.imageUrl}
                      onChange={(e) => setNewProduct({...newProduct, imageUrl: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button 
                  type="submit"
                  className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-lg shadow-xl hover:bg-blue-700 transition-all active:scale-95"
                >
                  Create Product & Update Inventory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stocktake Modal */}
      {isStocktakeModalOpen && selectedProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-md shadow-2xl overflow-hidden animate-in zoom-in duration-300">
             <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <div>
                  <h3 className="text-xl font-black text-gray-900">Inventory Verification</h3>
                  <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">{selectedProduct.name} {selectedVariant ? `(${selectedVariant.name})` : ''}</p>
                </div>
                <button onClick={() => setIsStocktakeModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full"><X /></button>
             </div>
             <form onSubmit={handleStocktakeSubmit} className="p-8 space-y-6">
                <div className="text-center p-6 bg-blue-50 rounded-2xl border border-blue-100">
                  <p className="text-xs font-black text-blue-500 uppercase tracking-widest mb-1">Expected System Stock</p>
                  <p className="text-4xl font-black text-blue-700">{selectedVariant ? selectedVariant.stockQuantity : selectedProduct.stockQuantity}</p>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Actual Stock Hand-Counted</label>
                  <input 
                    required autoFocus
                    type="number" 
                    className="w-full p-5 bg-gray-100 rounded-2xl text-3xl font-black text-center border-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                    value={actualQty}
                    onChange={(e) => setActualQty(e.target.value)}
                  />
                  <p className="text-center text-[10px] text-gray-400 mt-4 font-bold uppercase leading-relaxed">
                    System discrepancy: {parseInt(actualQty || '0') - (selectedVariant ? selectedVariant.stockQuantity : selectedProduct.stockQuantity)} units.
                  </p>
                </div>
                <button type="submit" className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-lg hover:bg-blue-700 shadow-xl transition-all">
                  Sync Actual Stock
                </button>
             </form>
          </div>
        </div>
      )}

      {/* Manual Adjustment Modal */}
      {isAdjModalOpen && selectedProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in duration-300">
             <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black text-gray-900">Inventory Adjustment</h3>
                  <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">{selectedProduct.name} {selectedVariant ? `(${selectedVariant.name})` : ''}</p>
                </div>
                <button onClick={() => { setIsAdjModalOpen(false); setSelectedVariant(null); }} className="p-2 hover:bg-gray-100 rounded-full"><X /></button>
             </div>
             <form onSubmit={handleAdjustmentSubmit} className="p-8 space-y-6">
                <div className="flex p-1 bg-gray-100 rounded-2xl">
                   <button type="button" onClick={() => setAdjType('add')} className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${adjType === 'add' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-400'}`}>Stock-In</button>
                   <button type="button" onClick={() => setAdjType('remove')} className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${adjType === 'remove' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-400'}`}>Stock-Out</button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Quantity</label>
                    <input required type="number" className="w-full p-4 bg-gray-50 rounded-2xl text-xl font-black border-none focus:ring-2 focus:ring-blue-500" value={adjQty} onChange={(e) => setAdjQty(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Reason</label>
                    <select className="w-full p-4 bg-gray-50 rounded-2xl text-sm font-bold border-none appearance-none" value={adjReason} onChange={(e) => setAdjReason(e.target.value as AdjustmentReason)}>
                       <option value="restock">Manual Delivery</option>
                       <option value="waste">Damaged/Waste</option>
                       <option value="return">Customer Return</option>
                       <option value="inventory_count">Adjustment</option>
                    </select>
                  </div>
                </div>
                <textarea className="w-full p-4 bg-gray-50 rounded-2xl text-sm font-medium border-none min-h-[100px]" placeholder="Audit trail note..." value={adjNote} onChange={(e) => setAdjNote(e.target.value)} />
                <button type="submit" className={`w-full py-5 rounded-2xl font-black text-lg text-white shadow-xl transition-all ${adjType === 'add' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}>
                   Confirm {adjType === 'add' ? 'Addition' : 'Removal'}
                </button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryView;
