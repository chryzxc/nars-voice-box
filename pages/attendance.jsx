import { Button } from '@/components/ui/button';
import CustomDataTable from '@/components/CustomDataTable';
import Head from 'next/head';
import { useCurrentUser } from '@/lib/user';

const columns = [
  {
    name: 'Name',
    selector: (row) => row.title,
    sortable: true,
  },
  {
    name: 'Time in',
    selector: (row) => row.year,
    sortable: true,
  },
  {
    name: 'Time out',
    selector: (row) => row.year,
    sortable: true,
  },
  {
    name: 'Date',
    selector: (row) => row.year,
    sortable: true,
  },
];

const data = [
  {
    id: 1,
    title: 'Beetlejuice',
    year: '1988',
  },
  {
    id: 2,
    title: 'Ghostbusters',
    year: '1984',
  },
];

const Attendance = () => {
  const {
    data: { user },
  } = useCurrentUser();

  const handleTimeIn = () => {};

  const handleTimeOut = () => {};

  return (
    <>
      <Head>
        <title>Attendance</title>
      </Head>
      <div>
        <CustomDataTable
          title="Attendance Record"
          columns={columns}
          data={data}
          showPagination
          searchable
          additionalHeader={
            <div className="flex flex-row gap-1">
              <Button>Time in</Button>
              <Button>Time out</Button>
            </div>
          }
        />
      </div>
    </>
  );
};

export default Attendance;
