"use client";

import { useState, useEffect } from "react";
import { PlusIcon, PhotoIcon, TrashIcon, PencilIcon, ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/24/outline";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";
import { toast } from "react-hot-toast";
import { z } from "zod";

const productSchema = z.object({
  name: z.string().min(2, "Product name must be at least 2 characters"),
  price: z.number().positive("Price must be greater than 0"),
  category: z.string().min(2, "Category is required"),
  salePercentage: z.number().min(1).max(99).nullable().optional(),
});

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  hoverImageUrl: string | null;
  category: string;
  stock: number;
  sizeStock: any;
  sku: string | null;
  isFeatured: boolean;
  isOnSale: boolean;
  salePercentage: number | null;
  orderIndex: number;
  images: string[];
  createdAt: string;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [description, setDescription] = useState("");
  const [isOnSale, setIsOnSale] = useState(false);
  const [sizeStock, setSizeStock] = useState({ XS: 0, S: 0, M: 0, L: 0, XL: 0 });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      if (Array.isArray(data)) {
        setProducts(data);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  };

  const [images, setImages] = useState<string[]>([]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleMoveImage = (index: number, direction: 'left' | 'right') => {
    if (direction === 'left' && index === 0) return;
    if (direction === 'right' && index === images.length - 1) return;
    
    setImages(prev => {
      const newImages = [...prev];
      const targetIndex = direction === 'left' ? index - 1 : index + 1;
      [newImages[index], newImages[targetIndex]] = [newImages[targetIndex], newImages[index]];
      return newImages;
    });
  };

  const handleEdit = (product: Product) => {
    setIsAdding(true);
    setEditingId(product.id);
    setSelectedProduct(product);
    setDescription(product.description || "");
    setIsOnSale(product.isOnSale || false);
    
    // Combine existing imageUrl and hoverImageUrl if images array is empty (for legacy products)
    let prodImages = product.images || [];
    if (prodImages.length === 0 && product.imageUrl) {
      prodImages = [product.imageUrl];
      if (product.hoverImageUrl) prodImages.push(product.hoverImageUrl);
    }
    setImages(prodImages);
    
    // Parse sizeStock
    const sizeStockObj = product.sizeStock
      ? (typeof product.sizeStock === "string" ? JSON.parse(product.sizeStock) : product.sizeStock)
      : { XS: 0, S: 0, M: 0, L: 0, XL: 0 };
    setSizeStock(sizeStockObj);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchProducts();
        toast.success("Product deleted");
      } else {
        toast.error("Failed to delete product");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleReorder = async (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === products.length - 1) return;

    const newProducts = [...products];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap the elements in the local array
    [newProducts[index], newProducts[targetIndex]] = [newProducts[targetIndex], newProducts[index]];
    
    // Optimistic UI update
    setProducts(newProducts);

    // Send the new order to the API
    const orderedIds = newProducts.map(p => p.id);
    try {
      await fetch('/api/products/reorder', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderedIds })
      });
    } catch (e) {
      console.error("Failed to reorder", e);
      // Revert if failed
      fetchProducts();
    }
  };

  const handleSubmitProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (images.length === 0) {
      toast.error("Please upload at least one product image");
      return;
    }
    const formData = new FormData(e.currentTarget);
    const totalStock = Object.values(sizeStock).reduce((acc, val) => acc + (parseInt(val as any) || 0), 0);
    const productData = {
      name: formData.get("name"),
      description: description,
      price: formData.get("price"),
      category: formData.get("category"),
      stock: totalStock,
      sizeStock: sizeStock,
      sku: formData.get("sku"),
      isFeatured: formData.get("isFeatured") === "on",
      isOnSale: isOnSale,
      salePercentage: isOnSale ? formData.get("salePercentage") : null,
      images: images,
      imageUrl: images[0],
      hoverImageUrl: images[1] || null,
    };

    const validationResult = productSchema.safeParse({
      name: productData.name,
      price: Number(productData.price),
      category: productData.category,
      salePercentage: productData.salePercentage ? Number(productData.salePercentage) : null,
    });

    if (!validationResult.success) {
      toast.error(validationResult.error.errors[0].message);
      return;
    }

    try {
      const url = editingId ? `/api/products/${editingId}` : "/api/products";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });

      if (res.ok) {
        setIsAdding(false);
        setEditingId(null);
        setSelectedProduct(null);
        setDescription("");
        setIsOnSale(false);
        setImages([]);
        setSizeStock({ XS: 0, S: 0, M: 0, L: 0, XL: 0 });
        fetchProducts();
        toast.success(editingId ? "Product updated successfully!" : "Product added successfully!");
      } else {
        const errorData = await res.json().catch(() => ({}));
        toast.error(`Failed to save product: ${errorData.details || errorData.error || res.statusText}`);
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div className="text-gray-500">Loading products...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-900">Products</h2>
        <button
          onClick={() => {
            setIsAdding(!isAdding);
            if (!isAdding) {
              setEditingId(null);
              setSelectedProduct(null);
              setDescription("");
              setIsOnSale(false);
              setImages([]);
              setSizeStock({ XS: 0, S: 0, M: 0, L: 0, XL: 0 });
            }
          }}
          className="bg-black text-white px-4 py-2 rounded-lg flex items-center text-sm hover:bg-gray-800 transition-colors"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          {isAdding ? "Cancel" : "Add Product"}
        </button>
      </div>

      {isAdding && (
        <form key={editingId || 'new'} id="product-form" onSubmit={handleSubmitProduct} className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Left Column: Details & Inventory */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-8 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100">
              <h3 className="text-lg font-serif text-gray-900 tracking-tight mb-6">General Information</h3>
              <div className="space-y-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold tracking-widest uppercase text-gray-500">Product Name</label>
                  <input name="name" required defaultValue={selectedProduct?.name || ""} className="w-full border-b border-gray-200 py-3 bg-transparent focus:outline-none focus:border-black transition-colors text-sm" placeholder="e.g. Summer Linen Dress" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-2 block">Description</label>
                  <div className="bg-white">
                    <ReactQuill theme="snow" value={description} onChange={setDescription} className="h-32 mb-10" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold tracking-widest uppercase text-gray-500">Category</label>
                  <select name="category" required defaultValue={selectedProduct?.category || "Skirts"} className="w-full border-b border-gray-200 py-3 bg-transparent focus:outline-none focus:border-black transition-colors text-sm text-gray-700">
                    <option value="Skirts">Skirts</option>
                    <option value="Tops">Tops</option>
                    <option value="Dresses">Dresses</option>
                    <option value="Bottoms">Bottoms</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100">
              <h3 className="text-lg font-serif text-gray-900 tracking-tight mb-6">Pricing & Inventory</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold tracking-widest uppercase text-gray-500">Price ($)</label>
                  <input name="price" type="number" step="0.01" required defaultValue={selectedProduct?.price || ""} className="w-full border-b border-gray-200 py-3 bg-transparent focus:outline-none focus:border-black transition-colors text-sm" placeholder="0.00" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold tracking-widest uppercase text-gray-500">SKU (Optional)</label>
                  <input name="sku" defaultValue={selectedProduct?.sku || ""} className="w-full border-b border-gray-200 py-3 bg-transparent focus:outline-none focus:border-black transition-colors text-sm" placeholder="e.g. SK-12345" />
                </div>
              </div>

              {/* Size Stocks Section */}
              <div className="space-y-4 pt-6 border-t border-gray-100">
                <label className="text-[10px] font-bold tracking-widest uppercase text-gray-500 block">Inventory by Size</label>
                <div className="grid grid-cols-5 gap-4">
                  {["XS", "S", "M", "L", "XL"].map((size) => (
                    <div key={size} className="space-y-1">
                      <span className="text-[10px] font-bold text-gray-400 block text-center">{size} Stock</span>
                      <input
                        type="number"
                        min="0"
                        value={sizeStock[size as keyof typeof sizeStock] ?? 0}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0;
                          setSizeStock((prev) => ({
                            ...prev,
                            [size]: val,
                          }));
                        }}
                        className="w-full border-b border-gray-200 py-2 bg-transparent focus:outline-none focus:border-black transition-colors text-center text-sm font-semibold"
                        placeholder="0"
                      />
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-gray-400 mt-2">
                  Total Computed Stock: <span className="font-bold text-gray-700">{Object.values(sizeStock).reduce((a, b) => a + b, 0)}</span>
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100">
                <label className="flex items-center space-x-3 cursor-pointer mb-4">
                  <input type="checkbox" checked={isOnSale} onChange={(e) => setIsOnSale(e.target.checked)} className="w-4 h-4 text-black rounded border-gray-300 focus:ring-black accent-black" />
                  <span className="text-sm font-medium text-gray-700">Put Product on Sale</span>
                </label>
                
                {isOnSale && (
                  <div className="space-y-1 md:w-1/3 mt-4">
                    <label className="text-[10px] font-bold tracking-widest uppercase text-gray-500">Sale Discount (%)</label>
                    <input name="salePercentage" type="number" min="1" max="99" required defaultValue={selectedProduct?.salePercentage || ""} className="w-full border-b border-gray-200 py-3 bg-transparent focus:outline-none focus:border-black transition-colors text-sm" placeholder="e.g. 20" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Media & Publish */}
          <div className="space-y-8">
            <div className="bg-white p-8 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100">
              <h3 className="text-lg font-serif text-gray-900 tracking-tight mb-6">Product Images</h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {images.map((imgStr, idx) => (
                    <div key={idx} className="relative group rounded-xl overflow-hidden border border-gray-200 aspect-square">
                      <img src={imgStr} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                        <div className="flex justify-between">
                          <button type="button" onClick={() => handleMoveImage(idx, 'left')} disabled={idx === 0} className="p-1 bg-white/20 hover:bg-white/40 text-white rounded disabled:opacity-30">
                            <ArrowUpIcon className="w-4 h-4 -rotate-90" />
                          </button>
                          <button type="button" onClick={() => handleMoveImage(idx, 'right')} disabled={idx === images.length - 1} className="p-1 bg-white/20 hover:bg-white/40 text-white rounded disabled:opacity-30">
                            <ArrowDownIcon className="w-4 h-4 -rotate-90" />
                          </button>
                        </div>
                        <button type="button" onClick={() => handleRemoveImage(idx)} className="self-center p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors shadow-lg">
                          <TrashIcon className="w-4 h-4" />
                        </button>
                        {idx === 0 && (
                          <span className="absolute bottom-2 left-2 text-[8px] font-bold tracking-widest uppercase bg-black text-white px-2 py-1 rounded">Main</span>
                        )}
                        {idx === 1 && (
                          <span className="absolute bottom-2 left-2 text-[8px] font-bold tracking-widest uppercase bg-gray-500 text-white px-2 py-1 rounded">Hover</span>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  <label className="cursor-pointer flex flex-col items-center justify-center w-full aspect-square border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 hover:bg-gray-100 hover:border-black transition-all">
                    <PhotoIcon className="w-8 h-8 mb-2 text-gray-400" />
                    <p className="text-xs font-semibold text-gray-500">Add Images</p>
                    <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
                  </label>
                </div>
                <p className="text-[10px] text-gray-400">First image is the primary thumbnail. Second image is shown on hover.</p>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100">
              <h3 className="text-lg font-serif text-gray-900 tracking-tight mb-6">Visibility</h3>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input type="checkbox" name="isFeatured" defaultChecked={selectedProduct?.isFeatured || false} className="w-4 h-4 text-black rounded border-gray-300 focus:ring-black accent-black" />
                <span className="text-sm font-medium text-gray-700">Feature on Homepage</span>
              </label>
              
              <div className="mt-8 pt-6 border-t border-gray-100">
                <button type="submit" className="w-full bg-black text-white px-8 py-4 rounded-xl text-xs font-bold tracking-widest uppercase hover:bg-gray-800 hover:shadow-lg transition-all duration-300">
                  {editingId ? "Save Changes" : "Publish Product"}
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      <div className="bg-white rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead className="text-[10px] font-bold text-gray-500 uppercase tracking-widest bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 w-20 text-center">Order</th>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">SKU</th>
                <th className="px-6 py-4">Stock</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No products found. Add your first product above.
                  </td>
                </tr>
              ) : (
                products.map((product, index) => (
                  <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center space-y-1">
                        <button 
                          onClick={() => handleReorder(index, 'up')}
                          disabled={index === 0}
                          className="p-1 text-gray-400 hover:text-black disabled:opacity-30 transition-colors"
                        >
                          <ArrowUpIcon className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleReorder(index, 'down')}
                          disabled={index === products.length - 1}
                          className="p-1 text-gray-400 hover:text-black disabled:opacity-30 transition-colors"
                        >
                          <ArrowDownIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-12 w-12 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                          <img className="h-full w-full object-cover" src={product.imageUrl} alt="" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-semibold text-gray-900">{product.name}</div>
                          <div className="text-xs text-gray-500 mt-0.5">{product.category}</div>
                          {product.isFeatured && (
                            <span className="inline-block mt-1 text-[8px] font-bold tracking-widest uppercase bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded">Featured</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500 font-mono text-xs">
                      {product.sku || "—"}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full ${
                        product.stock > 10 ? "bg-green-50 text-green-700" :
                        product.stock > 0 ? "bg-orange-50 text-orange-700" :
                        "bg-red-50 text-red-700"
                      }`}>
                        {product.stock} in stock
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-900 font-medium">
                      ${product.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button 
                          onClick={() => handleEdit(product)}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(product.id)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
