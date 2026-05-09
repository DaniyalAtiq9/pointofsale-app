import { useSales } from '../../contexts/SalesContext';
import { useProducts } from '../../contexts/ProductContext';

export default function SalesGrid() {
  const { currentSale, updateLocalItem, removeLocalItem } = useSales();
  const { items: products } = useProducts();

  const getProduct = (productId) => {
    return products.find(p => p.productId === productId);
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm table-auto">

        <thead>
          <tr className="bg-blue-600 dark:bg-indigo-700 border-b border-blue-700 dark:border-indigo-800">
            <th className="px-2 py-2 text-center text-white min-w-[80px]">Code</th>
            <th className="px-2 py-2 text-center text-white min-w-[200px]">Name</th>
            <th className="px-2 py-2 text-center text-white min-w-[80px]">Qty</th>
            <th className="px-2 py-2 text-center text-white min-w-[80px]">Disc %</th>
            <th className="px-2 py-2 text-right text-white min-w-[100px]">Price</th>
            <th className="px-2 py-2 text-right text-white min-w-[100px]">Amount</th>
            <th className="px-2 py-2 text-center text-white min-w-[100px]">Action</th>
          </tr>
        </thead>

        <tbody>
          {currentSale.details.length === 0 ? (
            <tr>
              <td colSpan="7" className="text-center p-4 text-gray-500 dark:text-gray-400">
                No items added
              </td>
            </tr>
          ) : (
            currentSale.details.map((detail) => {
              const product = getProduct(detail.productId);

              const price = detail.retailPrice || 0;
              const qty = detail.quantity || 0;
              const discount = detail.discount || 0;

              const amount = price * qty - discount;

              const discountPercent =
                price > 0
                  ? ((discount / (price * qty)) * 100).toFixed(0)
                  : 0;

              return (
                <tr
                  key={detail.saleDetailId}
                  className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-200"
                >
                  <td className="px-2 py-2">
                    {product?.code || '-'}
                  </td>

                  <td className="px-2 py-2">
                    {product?.name || 'Unknown'}
                  </td>

                  {/* QTY */}
                  <td className="px-2 py-2 text-center">
                    <input
                      type="number"
                      min="1"
                      max="999999"
                      value={qty}
                      onChange={(e) => {
                        const value = Number(e.target.value);
                        const validQty = value > 0 ? Math.min(value, 999999) : 1;
                        updateLocalItem({
                          id: detail.saleDetailId,
                          quantity: validQty,
                          discount,
                        });
                      }}
                      onBlur={(e) => {
                        const value = Number(e.target.value);
                        if (value <= 0 || isNaN(value)) {
                          updateLocalItem({
                            id: detail.saleDetailId,
                            quantity: 1,
                            discount,
                          });
                        } else if (value > 999999) {
                          updateLocalItem({
                            id: detail.saleDetailId,
                            quantity: 999999,
                            discount,
                          });
                        }
                      }}
                      className="w-14 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 text-center"
                    />
                  </td>

                  {/* DISCOUNT % */}
                  <td className="px-2 py-2 text-center">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={discountPercent}
                      onChange={(e) => {
                        const percent = Number(e.target.value);
                        if (percent < 0) return;
                        const validPercent = Math.min(percent, 100);
                        const newDiscount = (price * qty * validPercent) / 100;
                        updateLocalItem({
                          id: detail.saleDetailId,
                          quantity: qty,
                          discount: newDiscount,
                        });
                      }}
                      onBlur={(e) => {
                        const percent = Number(e.target.value);
                        if (percent < 0 || isNaN(percent)) {
                          updateLocalItem({
                            id: detail.saleDetailId,
                            quantity: qty,
                            discount: 0,
                          });
                        } else if (percent > 100) {
                          const newDiscount = price * qty;
                          updateLocalItem({
                            id: detail.saleDetailId,
                            quantity: qty,
                            discount: newDiscount,
                          });
                        }
                      }}
                      className="w-14 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 text-center"
                    />
                  </td>

                  <td className="px-2 py-2 text-right">
                    {price.toFixed(2)}
                  </td>

                  <td className="px-2 py-2 text-right font-medium">
                    {amount.toFixed(2)}
                  </td>

                  {/* DELETE */}
                  <td className="px-2 py-2 text-center">
                    <button
                      onClick={() => removeLocalItem(detail.saleDetailId)}
                      className="px-2 py-1 bg-red-500 text-white text-xs rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>

      </table>
    </div>
  );
}
