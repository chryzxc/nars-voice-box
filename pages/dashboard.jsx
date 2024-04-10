import {
  CalendarDaysIcon,
  ClockIcon,
  SunIcon,
  UserGroupIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import CustomDataTable from '@/components/CustomDataTable';
import Head from 'next/head';
import { UserLayout } from '@/components/Layout';
import dayjs from 'dayjs';
import { useCurrentUser } from '@/lib/user';
import { userRole } from '@/lib/constants';

const cards = [
  { label: 'Nurses', value: 5, icon: UsersIcon },
  { label: 'Patients', value: 5, icon: UserGroupIcon },
  { label: 'Appointments', value: 5, icon: CalendarDaysIcon },
];

const Dashboard = () => {
  const date = dayjs().format('MMMM DD, YYYY');
  const dayName = dayjs().format('dddd');
  const time = dayjs().format('hh:mm a');
  const {
    data: { user },
  } = useCurrentUser();
  return (
    <>
      <Head>
        <title>Dashboard</title>
      </Head>
      <UserLayout.Content>
        {user.role !== userRole.admin && (
          <p className="text-xl font-bold">Welcome, {user.name}</p>
        )}
        <div className="grid grid-cols-4 gap-4">
          {cards.map((card, idx) => (
            <div key={idx}>
              <Card>
                <CardHeader className="flex flex-col gap-2">
                  <div className="flex flex-row justify-between">
                    <p className=" text-md font-medium tracking-tight">
                      {card.label}
                    </p>
                    <card.icon className="h-7 w-7" />
                  </div>
                  <p className="font-bold text-4xl">{card.value}</p>
                </CardHeader>
              </Card>
            </div>
          ))}
          <div className="flex flex-col justify-around">
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
          <div className="col-span-2 ...">
            <Card>
              <CardHeader>
                <CardTitle>Medical Record</CardTitle>
              </CardHeader>
              <CardContent>
                <CustomDataTable
                  columns={[
                    {
                      name: 'First Name',
                      selector: (row) => row.firstName,
                      sortable: true,
                    },
                    {
                      name: 'Middle Name',
                      selector: (row) => row.middleName,
                      sortable: true,
                    },
                    {
                      name: 'Last Name',
                      selector: (row) => row.lastName,
                      sortable: true,
                    },
                    {
                      name: 'Username',
                      selector: (row) => row.username,
                      sortable: true,
                    },
                  ]}
                  data={[]}
                />
              </CardContent>
            </Card>
          </div>
          <div className="col-span-2 ...">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Appointment</CardTitle>
              </CardHeader>
              <CardContent>
                <CustomDataTable
                  columns={[
                    {
                      name: 'First Name',
                      selector: (row) => row.firstName,
                      sortable: true,
                    },
                    {
                      name: 'Middle Name',
                      selector: (row) => row.middleName,
                      sortable: true,
                    },
                    {
                      name: 'Last Name',
                      selector: (row) => row.lastName,
                      sortable: true,
                    },
                    {
                      name: 'Username',
                      selector: (row) => row.username,
                      sortable: true,
                    },
                  ]}
                  data={[]}
                />
              </CardContent>
            </Card>
          </div>
          <div className="col-span-4 ...">
            <Card>
              <CardHeader>
                <CardTitle>Nurse List</CardTitle>
              </CardHeader>
              <CardContent>
                <CustomDataTable
                  columns={[
                    {
                      name: 'First Name',
                      selector: (row) => row.firstName,
                      sortable: true,
                    },
                    {
                      name: 'Middle Name',
                      selector: (row) => row.middleName,
                      sortable: true,
                    },
                    {
                      name: 'Last Name',
                      selector: (row) => row.lastName,
                      sortable: true,
                    },
                    {
                      name: 'Username',
                      selector: (row) => row.username,
                      sortable: true,
                    },
                  ]}
                  data={[]}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </UserLayout.Content>
    </>
  );
};

export default Dashboard;
