import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { capitalizeFirstLetter, formatDate, formatString } from 'lib/utils';
import { temporaryPassword, userRole } from '@/lib/constants';
import { useCallback, useEffect, useRef, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import CustomDataTable from '@/components/CustomDataTable';
import Head from 'next/head';
import { Input } from '@/components/ui/input';
import { fetcher } from '@/lib/fetch';
import toast from 'react-hot-toast';

const columns = [
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
  {
    name: 'Type',
    selector: (row) => capitalizeFirstLetter(formatString(row.role)),
    sortable: true,
  },
  {
    name: 'Account setup',
    selector: (row) =>
      row.temporaryPasswordChanged ? (
        <Badge className="bg-green-600 cursor-pointer">Done</Badge>
      ) : (
        <HoverCard>
          <HoverCardTrigger>
            <Badge className="bg-orange-600 cursor-pointer">Pending</Badge>
          </HoverCardTrigger>
          <HoverCardContent>
            <div>
              <p className="text-md font-semibold">User credentials</p>
              <p>Username: {row.username}</p>
              <p>Password: {temporaryPassword}</p>
            </div>
          </HoverCardContent>
        </HoverCard>
      ),
    sortable: true,
  },
  {
    name: 'Created',
    selector: (row) => formatDate(row.created),
    sortable: true,
  },
];

const AddUserButton = ({ onUpdate }) => {
  const firstNameRef = useRef();
  const middleNameRef = useRef();
  const lastNameRef = useRef();
  const [role, setRole] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const [newUser, setNewUser] = useState(null);

  const onSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      try {
        setIsLoading(true);
        const response = await fetcher('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firstName: firstNameRef.current.value,
            middleName: middleNameRef.current.value || '',
            lastName: lastNameRef.current.value,
            role: role,
          }),
        });
        console.log('response', response);

        toast.success('Account has been created');
        setOpen(false);
        setNewUser(response);
      } catch (e) {
        toast.error(e.message);
      } finally {
        setIsLoading(false);
      }
    },
    [role]
  );

  return (
    <>
      <AlertDialog open={!!newUser}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>New user created</AlertDialogTitle>
            <AlertDialogDescription>
              <p>Username: {newUser?.username}</p>
              <p>Password: {temporaryPassword}</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => {
                setOpen(false);
                setNewUser(null);
                onUpdate?.();
              }}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger>
          <Button>Add user</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="mb-4">Create user account</DialogTitle>
            <form onSubmit={onSubmit}>
              <DialogDescription className="flex flex-col gap-3">
                <Input placeholder="First name" required ref={firstNameRef} />
                <Input
                  placeholder="Middle name (Optional)"
                  ref={middleNameRef}
                />
                <Input placeholder="Last name" required ref={lastNameRef} />
                <Select onValueChange={setRole} required>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(userRole)
                      .filter((val) => val !== userRole.admin)
                      .map((val, idx) => (
                        <SelectItem value={val} key={idx}>
                          {capitalizeFirstLetter(formatString(val))}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <Button className="mt-4" type="submit" disabled={isLoading}>
                  Create
                </Button>
              </DialogDescription>
            </form>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
};

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const getData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetcher('/api/users', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      setUsers(
        result.users.filter((user) => user.role !== userRole.admin).reverse()
      );
    } catch (e) {
      // do nothing
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getData();
  }, [getData]);

  return (
    <>
      <Head>
        <title>Users</title>
      </Head>

      <div>
        <CustomDataTable
          loading={loading}
          title="Users"
          columns={columns}
          data={users}
          showPagination
          searchable
          additionalHeader={<AddUserButton onUpdate={getData} />}
        />
      </div>
    </>
  );
};

export default Users;
