import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import DataTable from 'react-data-table-component';
import { Input } from '@/components/ui/input';

const CustomDataTable = ({
  title,
  data,
  columns,
  showPagination,
  searchable,
  additionalHeader,
  loading,
}) => {
  const [filterText, setFilterText] = useState('');
  const [resetPaginationToggle, setResetPaginationToggle] = useState(false);
  const filteredItems = data.filter((item) =>
    JSON.stringify(item).toLowerCase().includes(filterText.toLowerCase())
  );

  const subHeaderComponentMemo = useMemo(() => {
    const handleClear = () => {
      if (filterText) {
        setResetPaginationToggle(!resetPaginationToggle);
        setFilterText('');
      }
    };

    return (
      <div className="flex flex-row gap-2">
        <div>{additionalHeader}</div>
        {searchable && (
          <div className="inline-flex rounded-md shadow-sm" role="group">
            <Input
              placeholder="Search"
              onChange={(e) => setFilterText(e.target.value)}
              value={filterText}
              className="rounded-r-none"
            />
            <Button className="bg-red-500 rounded-l-none" onClick={handleClear}>
              Clear
            </Button>
          </div>
        )}
      </div>
    );
  }, [filterText, resetPaginationToggle, additionalHeader, searchable]);

  if (loading) {
    return <div>Loading</div>;
  }

  return (
    <DataTable
      title={title}
      columns={columns}
      data={filteredItems}
      pagination={showPagination}
      paginationResetDefaultPage={resetPaginationToggle}
      subHeader={searchable || additionalHeader}
      subHeaderComponent={subHeaderComponentMemo}
      persistTableHead
    />
  );
};

export default CustomDataTable;
