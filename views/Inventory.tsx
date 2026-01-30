
import React, { useState } from 'react';
import { dbService } from '../services/mockDb';
import { useApp } from '../App';
import { Product, Category } from '../types';
import { Plus, Edit2, Trash2, Search, Filter, X, CheckCircle2, Package } from 'lucide-react';

const InventoryView: React.FC = () => {
  const { currencySymbol } = useApp();
  const [products, setProducts] = useState<Product[]>(dbService.getProducts());
  const [categories] = useState<Category[]>(dbService.getCategories());
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    categoryId: categories[0]?.id || '',
    costPrice: '',
    sellingPrice: '',
    stockQuantity: '',
    imageUrl: ''
  });

  const filtered = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newProduct: Product = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.name,
      sku: formData.sku,
      categoryId: formData.categoryId,
      costPrice: parseFloat(formData.costPrice) || 0,
      sellingPrice: parseFloat(formData.sellingPrice) || 0,
      stockQuantity: parseInt(formData.stockQuantity) || 0,
      imageUrl: formData.imageUrl || `https://picsum.photos/seed/${formData.name}/200`,
      active: true
    };

    const updatedProducts = [...products, newProduct];
    setProducts(updatedProducts);
    dbService.updateProducts(updatedProducts);
    
    // Reset and Close
    setFormData({
      name: '',
      sku: '',
      categoryId: categories[0]?.id || '',
      costPrice: '',
      sellingPrice: '',
      stockQuantity: '',
      imageUrl: ''
    });
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      const updated = products.filter(p => p.id !== id);
      setProducts(updated);
      dbService.updateProducts(updated);
    }
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-500">Manage your product catalog, prices, and stock levels.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Add Product
        </button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search products by name or SKU..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              <th className="p-5 font-bold text-sm text-gray-400 uppercase tracking-widest">Product Info</th>
              <th className="p-5 font-bold text-sm text-gray-400 uppercase tracking-widest">SKU</th>
              <th className="p-5 font-bold text-sm text-gray-400 uppercase tracking-widest">Category</th>
              <th className="p-5 font-bold text-sm text-gray-400 uppercase tracking-widest text-right">Pricing</th>
              <th className="p-5 font-bold text-sm text-gray-400 uppercase tracking-widest text-center">Stock</th>
              <th className="p-5 font-bold text-sm text-gray-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map(p => (
              <tr key={p.id} className="hover:bg-gray-50/30 transition-colors group">
                <td className="p-5">
                  <div className="flex items-center gap-4">
                    <img src={p.imageUrl} className="w-12 h-12 rounded-xl object-cover shadow-sm group-hover:scale-110 transition-transform" />
                    <div>
                      <p className="font-bold text-gray-900">{p.name}</p>
                      <p className="text-xs text-gray-400">ID: {p.id}</p>
                    </div>
                  </div>
                </td>
                <td className="p-5 font-mono text-sm text-gray-500 font-medium">{p.sku}</td>
                <td className="p-5">
                  <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
                    {categories.find(c => c.id === p.categoryId)?.name}
                  </span>
                </td>
                <td className="p-5 text-right">
                  <p className="font-black text-gray-900">{currencySymbol}{p.sellingPrice.toFixed(2)}</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Cost: {currencySymbol}{p.costPrice.toFixed(2)}</p>
                </td>
                <td className="p-5 text-center">
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full font-bold text-sm ${p.stockQuantity < 10 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                    <Package className="w-3 h-3" />
                    {p.stockQuantity}
                  </div>
                </td>
                <td className="p-5 text-right">
                  <div className="flex justify-end gap-2">
                    <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => handleDelete(p.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
                  <Plus className="w-7 h-7" />
                </div>
                <h2 className="text-2xl font-black text-gray-900">Add New Product</h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-gray-200 rounded-full transition-colors">
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>
            
            <form onSubmit={handleAddProduct} className="p-10 space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-sm font-black text-gray-400 uppercase tracking-widest mb-2">Product Name</label>
                  <input 
                    required
                    type="text" 
                    placeholder="e.g. Fresh Orange Juice"
                    className="w-full p-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-blue-500 outline-none font-bold text-lg"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-black text-gray-400 uppercase tracking-widest mb-2">SKU / Code</label>
                  <input 
                    required
                    type="text" 
                    placeholder="OJ-001"
                    className="w-full p-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-blue-500 outline-none font-bold"
                    value={formData.sku}
                    onChange={(e) => setFormData({...formData, sku: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-black text-gray-400 uppercase tracking-widest mb-2">Category</label>
                  <select 
                    className="w-full p-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-blue-500 outline-none font-bold appearance-none"
                    value={formData.categoryId}
                    onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-black text-gray-400 uppercase tracking-widest mb-2">Cost Price ({currencySymbol})</label>
                  <input 
                    required
                    type="number" 
                    step="0.01"
                    placeholder="0.00"
                    className="w-full p-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-blue-500 outline-none font-bold"
                    value={formData.costPrice}
                    onChange={(e) => setFormData({...formData, costPrice: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-black text-gray-400 uppercase tracking-widest mb-2">Selling Price ({currencySymbol})</label>
                  <input 
                    required
                    type="number" 
                    step="0.01"
                    placeholder="0.00"
                    className="w-full p-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-blue-500 outline-none font-bold"
                    value={formData.sellingPrice}
                    onChange={(e) => setFormData({...formData, sellingPrice: e.target.value})}
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-black text-gray-400 uppercase tracking-widest mb-2">Initial Stock Quantity</label>
                  <input 
                    required
                    type="number" 
                    placeholder="0"
                    className="w-full p-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-blue-500 outline-none font-bold"
                    value={formData.stockQuantity}
                    onChange={(e) => setFormData({...formData, stockQuantity: e.target.value})}
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-5 bg-blue-600 text-white rounded-3xl font-black text-xl shadow-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
              >
                <CheckCircle2 className="w-6 h-6" />
                Add to Inventory
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryView;
