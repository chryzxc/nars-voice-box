import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useCallback, useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import CustomDataTable from '@/components/CustomDataTable';
import Head from 'next/head';
import { Input } from '@/components/ui/input';
import { UserLayout } from '@/components/Layout';
import { fetcher } from '@/lib/fetch';
import toast from 'react-hot-toast';
import { userRole } from '@/lib/constants';

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
];

const AddNurseButton = ({ onUpdate }) => {
  const firstNameRef = useRef();
  const middleNameRef = useRef();
  const lastNameRef = useRef();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
            middleName: middleNameRef.current.value,
            lastName: lastNameRef.current.value,
            role: userRole.nurse,
          }),
        });
        console.log('response', response);

        toast.success('Account has been created');
        onUpdate?.();
        setOpen(false);
      } catch (e) {
        toast.error(e.message);
      } finally {
        setIsLoading(false);
      }
    },
    [onUpdate]
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button>Add nurse</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="mb-4">Create nurse account</DialogTitle>
          <form onSubmit={onSubmit}>
            <DialogDescription className="flex flex-col gap-3">
              <Input placeholder="First name" required ref={firstNameRef} />
              <Input placeholder="Middle name (Optional)" ref={middleNameRef} />
              <Input placeholder="Last name" required ref={lastNameRef} />
              <Button className="mt-4" type="submit" disabled={isLoading}>
                Create
              </Button>
            </DialogDescription>
          </form>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

const Nurses = () => {
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
        result.users.filter((user) => user.role === userRole.nurse).reverse()
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
        <title>Nurses</title>
      </Head>
      <UserLayout.Content>
        <div>
          <CustomDataTable
            title="Nurse list"
            columns={columns}
            data={users}
            showPagination
            searchable
            additionalHeader={<AddNurseButton onUpdate={getData} />}
          />
        </div>
      </UserLayout.Content>
    </>
  );
};

export default Nurses;
