import {
  CalendarDaysIcon,
  ClockIcon,
  SunIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Nurses, { getNurse } from './nurses';
import Patients, { getPatients } from './patients';
import { useEffect, useMemo, useState } from 'react';

import { CalendarIcon } from 'lucide-react';
import Doctor from '@/page-components/Appointment/Doctor';
import Head from 'next/head';
import Nurse from '@/page-components/Appointment/Nurse';
import dayjs from 'dayjs';
import { fetcher } from '@/lib/fetch';
import { getUserAttendance } from './attendance';
import { isDoctor } from '@/lib/utils';
import moment from 'moment';
import { useCurrentUser } from '@/lib/user';
import { userRole } from '@/lib/constants';

const DashboardCard = ({ label, value, icon: Icon }) => {
  return (
    <Card>
      <CardHeader className="flex flex-col gap-2">
        <div className="flex flex-row justify-between">
          <p className=" text-md font-medium tracking-tight">{label}</p>
          {Icon && <Icon className="h-7 w-7" />}
        </div>
        <p className="font-bold text-4xl">{value}</p>
      </CardHeader>
    </Card>
  );
};

const UserAttendance = () => {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const todaysTimeIn = useMemo(
    () =>
      attendanceRecords.find(
        (attendance) =>
          attendance.timeIn && dayjs().isSame(dayjs(attendance.timeIn), 'day')
      )?.timeIn || null,
    [attendanceRecords]
  );
  const todaysTimeOut = useMemo(
    () =>
      attendanceRecords.find(
        (attendance) =>
          attendance.timeOut && dayjs().isSame(dayjs(attendance.timeOut), 'day')
      )?.timeOut || null,
    [attendanceRecords]
  );

  useEffect(() => {
    (async () => {
      const data = await getUserAttendance();
      console.log('data', data);
      setAttendanceRecords(data || []);
    })();
  }, []);

  return (
    <Card>
      <CardHeader className="flex flex-col gap-2">
        <div className="flex flex-row justify-between">
          <p className=" text-md font-medium tracking-tight">
            Attendance for today
          </p>
        </div>
        <div className="flex flex-row justify-between">
          <div>
            <p className="text-sm text-gray-500">Time in</p>
            <p className="font-bold text-lg">
              {todaysTimeIn ? moment(todaysTimeIn).format('hh:mm a') : 'None'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Time out</p>
            <p className="font-bold text-lg">
              {todaysTimeOut ? moment(todaysTimeOut).format('hh:mm a') : 'None'}
            </p>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
};

const FirstCard = ({ user }) => {
  const [data, setData] = useState({
    label: null,
    value: 0,
    icon: null,
  });

  useEffect(() => {
    (async () => {
      if (user.role !== userRole.nurse) {
        const nurses = await getNurse();
        setData({
          label: 'Nurses',
          value: nurses.length ?? 0,
          icon: UsersIcon,
        });
      }
    })();
  }, [user]);

  if (user.role === userRole.nurse) return <UserAttendance />;

  return <DashboardCard {...data} />;
};

const SecondCard = ({ user }) => {
  const [data, setData] = useState({
    label: null,
    value: 0,
    icon: null,
  });

  useEffect(() => {
    (async () => {
      if (user.role === userRole.nurse) {
        const patients = await getPatients(user._id);
        setData({
          label: 'Patients',
          value: patients.length ?? 0,
          icon: UsersIcon,
        });
      } else {
        const patients = await getPatients();
        setData({
          label: 'Patients',
          value: patients.length ?? 0,
          icon: UsersIcon,
        });
      }
    })();
  }, [user]);

  return <DashboardCard {...data} />;
};

const ThirdCard = ({ user }) => {
  const [data, setData] = useState({
    label: null,
    value: 0,
    icon: null,
  });

  const filterToday = (data) =>
    moment(data.date).isSame(moment(), 'd') &&
    moment(data.date).isAfter(moment(), 'h');

  useEffect(() => {
    (async () => {
      if (user.role === userRole.nurse) {
        const results = await fetcher(
          `/api/appointment?creatorId=${user._id}`,
          {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          }
        );
        setData({
          label: 'Todays Appointment',
          value: results.filter(filterToday).length ?? 0,
          icon: CalendarIcon,
        });
      } else if (isDoctor(user.role)) {
        const results = await fetcher(
          `/api/appointment?doctorUserId=${user._id}`,
          {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          }
        );
        setData({
          label: 'Todays Appointment',
          value: results.filter(filterToday).length ?? 0,
          icon: CalendarIcon,
        });
      } else {
        const results = await fetcher(`/api/appointment`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        setData({
          label: 'Todays Appointment',
          value: results.filter(filterToday).length ?? 0,
          icon: CalendarIcon,
        });
      }
    })();
  }, [user]);

  return <DashboardCard {...data} />;
};

const Dashboard = () => {
  const date = dayjs().format('MMMM DD, YYYY');
  const dayName = dayjs().format('dddd');
  const time = dayjs().format('hh:mm a');

  const {
    data: { user },
  } = useCurrentUser();

  useEffect(() => {}, []);

  return (
    <>
      <Head>
        <title>Dashboard</title>
      </Head>

      {user.role !== userRole.admin && (
        <p className="text-xl font-bold">Welcome, {user.firstName}</p>
      )}
      <div className="flex flex-col md:grid md:grid-cols-4 gap-4">
        <FirstCard user={user} />
        <SecondCard user={user} />
        <ThirdCard user={user} />

        <div className="hidden md:flex flex-col justify-around">
          <div className="flex flex-row gap-4 items-center">
            <CalendarDaysIcon className="h-7 w-7" />
            <p className="text-lg font-medium">{date}</p>
          </div>
          <div className="flex flex-row gap-4">
            <SunIcon className="h-7 w-7" />
            <p className="text-2xl font-bold">{dayName}</p>
          </div>
          <div className="flex flex-row gap-4">
            <ClockIcon className="h-7 w-7" />
            <p className="text-2xl font-bold">{time}</p>
          </div>
        </div>
        <div
          className={`${
            user.role === userRole.admin ? 'col-span-4' : 'col-span-2'
          }`}
        >
          <Card>
            <CardHeader>
              <CardTitle>Patient History</CardTitle>
            </CardHeader>
            <CardContent>
              <Patients asComponent />
            </CardContent>
          </Card>
        </div>
        {user.role !== userRole.admin && (
          <div className="col-span-2 ...">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Appointment</CardTitle>
              </CardHeader>
              <CardContent>
                {user.role === userRole.nurse ? (
                  <Nurse asComponent />
                ) : (
                  <Doctor asComponent />
                )}
              </CardContent>
            </Card>
          </div>
        )}
        {isDoctor(user.role) && (
          <div className="col-span-4 ...">
            <Card>
              <CardHeader>
                <CardTitle>Nurse List</CardTitle>
              </CardHeader>
              <CardContent>
                <Nurses asComponent />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </>
  );
};

export default Dashboard;
