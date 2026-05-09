export default function DataTable({
  columns = [],
  data = [],
  loading = false,
  emptyMessage = 'No records found',
  renderRow,
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">

      {loading ? (
        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
          Loading...
        </div>
      ) : data.length === 0 ? (
        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
          {emptyMessage}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse table-fixed">

            {/* HEADER */}
            <thead>
              <tr className="bg-blue-600 dark:bg-indigo-700 border-b border-gray-300 dark:border-gray-600">
                {columns.map((col, index) => (
                  <th
                    key={index}
                    className={`px-6 py-4 font-semibold text-white border-r border-gray-300 dark:border-gray-600 last:border-r-0 ${
                      col.align === 'right'
                        ? 'text-right'
                        : col.align === 'center'
                        ? 'text-center'
                        : 'text-left'
                    }`}
                    style={{ width: col.width }}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>

            {/* BODY */}
            <tbody>
              {data.map((item, index) => (
                <tr
                  key={item.id || index}
                  className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {renderRow(item, columns.length)}
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      )}
    </div>
  );
}
