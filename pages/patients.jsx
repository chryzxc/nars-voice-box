import {
  buildFullName,
  capitalizeFirstLetter,
  speechRecognitionFilter,
} from '@/lib/utils';
import { useEffect, useState } from 'react';

import CustomDataTable from '@/components/CustomDataTable';
import Head from 'next/head';
import { fetcher } from '@/lib/fetch';
import moment from 'moment';

export const getPatients = async () => {
  const results = await fetcher('/api/appointment', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  return results.filter((result) => moment(result.date).isBefore());
};

const Patients = ({ speechRecognitionKeyword, asComponent }) => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  const columns = [
    {
      name: 'Name',
      selector: (row) => row.patientName,
      sortable: true,
    },
    {
      name: 'Contact information',
      selector: (row) => row.patientContactInformation,
      sortable: true,
    },
    {
      name: 'Address',
      selector: (row) => row.patientAddress,
      sortable: true,
    },
  ];

  if (!speechRecognitionKeyword) {
    columns.push(
      ...[
        {
          name: 'Nurse',
          selector: (row) =>
            `${buildFullName({
              firstName: row.creator.firstName,
              lastName: row.creator.lastName,
              middleName: row.creator.lastName,
            })} `,
          sortable: true,
        },
        {
          name: 'Attending Doctor',
          selector: (row) =>
            `${buildFullName({
              firstName: row.doctor.firstName,
              lastName: row.doctor.lastName,
              middleName: row.doctor.lastName,
            })} (${capitalizeFirstLetter(row.doctor.role)})`,
          sortable: true,
        },
        {
          name: 'Schedule',
          selector: (row) =>
            `${moment(row.date).format('MMM DD YYYY')} (${row.time})`,
          sortable: true,
        },
      ]
    );
  }
  console.log('speechRecognitionKeyword', speechRecognitionKeyword);
  useEffect(() => {
    console.log('running patient');
    const getData = async () => {
      setLoading(true);
      try {
        const result = await getPatients();
        console.log('patients');
        if (speechRecognitionKeyword) {
          console.log('keyword', speechRecognitionKeyword);
          console.log('result', result);
          console.log(
            'filtered',
            speechRecognitionFilter(speechRecognitionKeyword, result)
          );
          setPatients(
            speechRecognitionFilter(speechRecognitionKeyword, result)
          );
          return;
        }

        setPatients(result);
      } catch (e) {
        // do nothing
      } finally {
        setLoading(false);
      }
    };

    getData();
  }, [speechRecognitionKeyword]);

  return (
    <>
      <Head>
        <title>Patients</title>
      </Head>
      <div>
        <CustomDataTable
          loading={loading}
          title={
            speechRecognitionKeyword || asComponent ? undefined : 'Patient List'
          }
          columns={columns}
          data={asComponent ? patients.slice(0, 5) : patients}
          showPagination={!speechRecognitionKeyword && !asComponent}
          searchable={!asComponent && !speechRecognitionKeyword}
          expandableComponent={
            speechRecognitionKeyword
              ? null
              : ({ data }) => {
                  return (
                    <div className="flex flex-col gap-1 my-2">
                      {data.notes && (
                        <p className="text-gray-500">
                          Note: <span className="text-black">{data.notes}</span>
                        </p>
                      )}
                      {data.createdAt && (
                        <p className="text-gray-500">
                          Created:
                          <span className="text-black">
                            {' '}
                            {moment(data.createdAt).format(
                              'MMM DD YYYY, h:mm a'
                            )}
                          </span>
                        </p>
                      )}
                    </div>
                  );
                }
          }
        />
      </div>
    </>
  );
};

export default Patients;
