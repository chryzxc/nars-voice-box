import CustomDataTable from '@/components/CustomDataTable';
import Head from 'next/head';

const columns = [
  {
    name: 'Title',
    selector: (row) => row.title,
    sortable: true,
  },
  {
    name: 'Year',
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

const Patients = () => {
  return (
    <>
      <Head>
        <title>Patients</title>
      </Head>
      <div>
        <CustomDataTable
          title="Patient List"
          columns={columns}
          data={data}
          showPagination
          searchable
        />
      </div>
    </>
  );
};

export default Patients;
