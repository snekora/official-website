import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAdminProducts, deleteProduct } from "../redux/adminProductSlice";
import { toast } from "react-toastify";
import { Package, Plus, Trash2, Edit2, Loader2, Image as ImageIcon, Layers } from "lucide-react";
import ProductForm from "./ProductForm";
import VariantManager from "./VariantManager";
import ConfirmDeleteProductModal from "../modal/ConfirmDeleteProductModal";

const ProductManager = () => {
  const dispatch = useDispatch();
  const { products, loading, total } = useSelector((state) => state.adminProduct);
  const [isAdding, setIsAdding] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedProductForVariantsId, setSelectedProductForVariantsId] = useState(null);
  const selectedProductForVariants = selectedProductForVariantsId
    ? products.find((p) => p._id === selectedProductForVariantsId)
    : null;
  
  const [productToDelete, setProductToDelete] = useState(null); // { id, name }
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    dispatch(fetchAdminProducts({ limit: 50 }));
  }, [dispatch]);

  const handleDeleteClick = (id, name) => {
    setProductToDelete({ id, name });
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    try {
      await dispatch(deleteProduct(productToDelete.id)).unwrap();
      toast.success("Product deleted successfully!");
      setProductToDelete(null);
    } catch (error) {
      toast.error(error || "Failed to delete product");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isAdding) {
    return <ProductForm onClose={() => setIsAdding(false)} />;
  }

  if (editingProduct) {
    return (
      <ProductForm
        product={editingProduct}
        onClose={() => setEditingProduct(null)}
      />
    );
  }

  if (selectedProductForVariants) {
    return (
      <VariantManager
        product={selectedProductForVariants}
        onClose={() => setSelectedProductForVariantsId(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-white">
          <Package size={18} className="text-lime-400" />
          <h2 className="text-base font-semibold">Manage Products ({total})</h2>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-lime-400 px-3.5 py-2 text-xs font-semibold text-black transition hover:bg-lime-300"
        >
          <Plus size={16} />
          Add Product
        </button>
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#111113] p-1">
        {loading && products.length === 0 ? (
          <div className="flex min-h-[300px] items-center justify-center text-zinc-500">
            <Loader2 size={28} className="animate-spin text-lime-400" />
          </div>
        ) : products.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed border-white/10 text-zinc-500 p-6 text-center">
            <Package size={40} className="mb-3 text-zinc-600" />
            <p className="text-base font-medium text-zinc-400">No products found</p>
            <p className="text-sm mt-1">Get started by creating a new product.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-white">
              <thead className="bg-white/[0.03]">
                <tr className="border-b border-white/10 text-[11px] uppercase tracking-wider text-zinc-500">
                  <th className="px-5 py-3.5 font-medium">Product</th>
                  <th className="px-5 py-3.5 font-medium">Category</th>
                  <th className="px-5 py-3.5 font-medium">Price</th>
                  <th className="px-5 py-3.5 font-medium">Variants</th>
                  <th className="px-5 py-3.5 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((prod) => {
                  const firstVariant = prod.variants?.[0];
                  const firstImage = firstVariant?.images?.[0]?.url;

                  return (
                    <tr
                      key={prod._id}
                      className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.03] transition"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-4">
                          {firstImage ? (
                            <img
                              src={firstImage}
                              alt={prod.name}
                              className="h-12 w-12 rounded-xl object-cover border border-white/10 bg-[#0c0c0d]"
                            />
                          ) : (
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0c0c0d] border border-white/10 text-zinc-500">
                              <ImageIcon size={18} />
                            </div>
                          )}
                          <div>
                            <p className="text-xs font-semibold text-white">{prod.name}</p>
                            <p className="text-[11px] text-zinc-400 mt-0.5 max-w-[200px] truncate">
                              {prod.description}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center rounded-md bg-white/5 px-2 py-0.5 text-[11px] font-medium text-zinc-300 border border-white/10">
                          {prod.category?.name || "Uncategorized"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-xs font-semibold text-lime-400">${prod.price}</p>
                        {prod.originalPrice > prod.price && (
                          <p className="text-[11px] text-zinc-500 line-through">${prod.originalPrice}</p>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-medium text-zinc-300">
                            {prod.variants?.length || 0}
                          </span>
                          <span className="text-[11px] text-zinc-500">Colors</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedProductForVariantsId(prod._id)}
                            className="p-2 rounded-lg bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white transition"
                            title="Manage Variants"
                          >
                            <Layers size={16} />
                          </button>
                          <button
                            onClick={() => setEditingProduct(prod)}
                            className="p-2 rounded-lg bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white transition"
                            title="Edit Product"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(prod._id, prod.name)}
                            className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmDeleteProductModal
        isOpen={Boolean(productToDelete)}
        onClose={() => setProductToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Product"
        itemLabel={productToDelete?.name}
        description="This action cannot be undone and will delete all associated images."
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default ProductManager;
