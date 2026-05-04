import { useState } from 'react';
import { useSales } from '../../contexts/SalesContext';
import { useSalespersons } from '../../contexts/SalespersonContext';

export default function SalesRecords({ onEdit }) {
  const { items: sales } = useSales();
  const { items: salespersons } = useSalespersons();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleRowDoubleClick = (sale) => {
    if (onEdit) {
      onEdit(sale);
    }
  };

  // Filter sales based on search term across all columns
  const filteredSales = sales.filter((sale) => {
    const salespersonName =
      salespersons.find((sp) => sp.salespersonId === sale.salespersonId)?.name || '';
    
    const saleDate = sale.saleDate
      ? new Date(sale.saleDate).toLocaleDateString()
      : '';
    
    const editDate = sale.editDate
      ? new Date(sale.editDate).toLocaleDateString()
      : '';
    
    const total = Number(sale.total || 0).toFixed(2);
    const comments = sale.comments || '';

    const searchLower = searchTerm.toLowerCase();

    return (
      saleDate.toLowerCase().includes(searchLower) ||
      editDate.toLowerCase().includes(searchLower) ||
      total.includes(searchLower) ||
      salespersonName.toLowerCase().includes(searchLower) ||
      comments.toLowerCase().includes(searchLower)
    );
  }).sort((a, b) => {
    // Sort by editDate in descending order (most recently edited first)
    const dateA = new Date(a.editDate || a.saleDate);
    const dateB = new Date(b.editDate || b.saleDate);
    return dateB - dateA;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredSales.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentSales = filteredSales.slice(startIndex, endIndex);

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Reset to page 1 when search term changes
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="bg-white rounded border border-gray-200 p-4 shadow-sm">
      <h2 className="text-lg font-bold mb-4">Sales Records</h2>

      {/* Search Input */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search sales..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
        />
      </div>

      {currentSales.length === 0 ? (
        <p className="text-gray-500 text-sm">No sales records found</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-blue-600 border-b">
                <tr>
                  <th className="px-4 py-2 text-center font-medium text-white">
                    Sale Date
                  </th>

                  <th className="px-4 py-2 text-center font-medium text-white">
                    Edit Date
                  </th>

                  <th className="px-4 py-2 text-center font-medium text-white">
                    Total
                  </th>

                  <th className="px-4 py-2 text-center font-medium text-white">
                    Salesperson
                  </th>

                  <th className="px-4 py-2 text-center font-medium text-white">
                    Comments
                  </th>
                </tr>
              </thead>

              <tbody>
                {currentSales.map((sale) => {
                  const salespersonName =
                    salespersons.find(
                      (sp) => sp.salespersonId === sale.salespersonId
                    )?.name || "N/A";

                  return (
                    <tr 
                      key={sale.saleId} 
                      className="border-b hover:bg-gray-50 cursor-pointer"
                      onDoubleClick={() => handleRowDoubleClick(sale)}
                    >
                      {/* Sale Date (Creation equivalent) */}
                      <td className="px-4 py-2">
                        {sale.saleDate
                          ? new Date(sale.saleDate).toLocaleDateString()
                          : "-"}
                      </td>

                      {/* Edit Date */}
                      <td className="px-4 py-2">
                        {sale.editDate
                          ? new Date(sale.editDate).toLocaleDateString()
                          : "-"}
                      </td>

                      {/* Total */}
                      <td className="px-4 py-2 text-center font-medium">
                        {Number(sale.total || 0).toFixed(2)}
                      </td>

                      {/* Salesperson */}
                      <td className="px-4 py-2">
                        {salespersonName}
                      </td>

                      {/* Comments */}
                      <td className="px-4 py-2">
                        {sale.comments || "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <div className="text-sm text-gray-600">
              Page {currentPage} of {totalPages} ({filteredSales.length} records)
            </div>
            <div className="flex gap-2">
              <button
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}