import { useCallback, useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import CustomDataTable from '@/components/CustomDataTable';
import Head from 'next/head';
import dayjs from 'dayjs';
import { fetcher } from '@/lib/fetch';
import { useCurrentUser } from '@/lib/user';
import { userRole } from '@/lib/constants';

const Attendance = () => {
  const { data: { user } = {} } = useCurrentUser();
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const isNurse = user.role === userRole.nurse;

  const todaysTimeIn = useMemo(
    () =>
      attendanceRecords.find(
        (attendance) =>
          attendance.timeIn && dayjs().isSame(dayjs(attendance.timeIn), 'day')
      ),
    [attendanceRecords]
  );
  const todaysTimeOut = useMemo(
    () =>
      attendanceRecords.find(
        (attendance) =>
          attendance.timeOut && dayjs().isSame(dayjs(attendance.timeOut), 'day')
      ),
    [attendanceRecords]
  );

  const getData = useCallback(async () => {
    setLoading(true);
    try {
      let result = [];
      if (isNurse) {
        result = await fetcher('/api/user/attendance', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
      } else {
        result = await fetcher('/api/attendance', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
      }

      setAttendanceRecords(result);
    } catch (e) {
      // do nothing
    } finally {
      setLoading(false);
    }
  }, []);

  const handleTimeIn = async () => {
    try {
      await fetcher('/api/user/time-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      getData();
    } catch (e) {
      // do nothing
    } finally {
      //
    }
  };

  const handleTimeOut = async () => {
    try {
      await fetcher('/api/user/time-out', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      getData();
    } catch (e) {
      // do nothing
    } finally {
      //
    }
  };

  useEffect(() => {
    getData();
  }, [getData]);

  return (
    <>
      <Head>
        <title>Attendance Records</title>
      </Head>
      <div>
        <CustomDataTable
          loading={loading}
          title="Attendance Records"
          columns={[
            {
              ...(!isNurse && {
                name: 'Name',
                selector: (row) => `${row.user.firstName} ${row.user.lastName}`,
                sortable: true,
              }),
            },
            {
              name: 'Time in',
              selector: (row) =>
                row.timeIn ? dayjs(row.timeIn).format('hh:mm a') : null,
              sortable: true,
            },
            {
              name: 'Time out',
              selector: (row) =>
                row.timeOut ? dayjs(row.timeOut).format('hh:mm a') : null,
              sortable: true,
            },
            {
              name: 'Date',
              selector: (row) => dayjs(row.timeIn).format('MMM DD, YYYY'),
              sortable: true,
            },
          ]}
          data={attendanceRecords}
          showPagination
          searchable
          additionalHeader={
            isNurse ? (
              <div className="flex flex-row gap-1">
                <Button onClick={handleTimeIn} disabled={todaysTimeIn}>
                  Time in
                </Button>
                <Button
                  onClick={handleTimeOut}
                  disabled={!todaysTimeIn || todaysTimeOut}
                >
                  Time out
                </Button>
              </div>
            ) : undefined
          }
        />
      </div>
    </>
  );
};

export default Attendance;
