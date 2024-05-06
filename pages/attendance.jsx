import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import CustomDataTable from '@/components/CustomDataTable';
import Head from 'next/head';
import dayjs from 'dayjs';
import { fetcher } from '@/lib/fetch';
import moment from 'moment';
import { speechRecognitionFilter } from '@/lib/utils';
import toast from 'react-hot-toast';
import { useCurrentUser } from '@/lib/user';
import { userRole } from '@/lib/constants';

export const getUserAttendance = async () =>
  await fetcher('/api/user/attendance', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

export const Attendance = ({ speechRecognitionKeyword }) => {
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
      let results = [];
      if (isNurse) {
        results = await getUserAttendance();
      } else {
        results = await fetcher('/api/attendance', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
      }

      if (speechRecognitionKeyword) {
        const processedData = results.map((result) => {
          delete result.user.role;
          return result;
        });

        setAttendanceRecords(
          speechRecognitionFilter(speechRecognitionKeyword, processedData)
        );
        return;
      }

      setAttendanceRecords(results);
    } catch (e) {
      // do nothing
    } finally {
      setLoading(false);
    }
  }, [isNurse, speechRecognitionKeyword]);

  const handleTimeIn = async () => {
    try {
      await fetcher('/api/user/time-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      getData();
      toast.success(`Successfully clocked in`);
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
      toast.success(`Successfully timed out`);
    } catch (e) {
      // do nothing
    } finally {
      //
    }
  };

  const columns = [
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
  ];

  if (!isNurse) {
    columns.unshift({
      name: 'Name',
      selector: (row) => `${row.user.firstName} ${row.user.lastName}`,
      sortable: true,
    });
  }

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
          title={speechRecognitionKeyword ? '' : 'Attendance Records'}
          columns={columns}
          data={attendanceRecords}
          showPagination
          searchable={!speechRecognitionKeyword}
          additionalHeader={
            isNurse && !speechRecognitionKeyword ? (
              <div className="flex flex-row gap-1">
                <Dialog>
                  <DialogTrigger disabled={todaysTimeIn}>
                    <Button disabled={todaysTimeIn}>Time in</Button>
                  </DialogTrigger>
                  <DialogContent className="w-[400px]">
                    <div className="flex flex-col justify-center items-center">
                      <p className="text-xl font-medium">
                        {moment().format('MMMM DD, YYYY')}
                      </p>
                      <p className="text-2xl font-bold">
                        {moment().format('dddd')}
                      </p>
                      <p className="text-2xl font-bold">
                        {moment().format('hh:mm a')}
                      </p>
                    </div>

                    <DialogDescription>
                      Hurry up! Time in now and be productive everyday
                    </DialogDescription>

                    <Button onClick={handleTimeIn}>Time in</Button>
                  </DialogContent>
                </Dialog>

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
