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
import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { temporaryPassword, userRole } from '@/lib/constants';

import { Button } from '@/components/ui/button';
import CustomDataTable from '@/components/CustomDataTable';
import Head from 'next/head';
import { Input } from '@/components/ui/input';
import { fetcher } from '@/lib/fetch';
import { speechRecognitionFilter } from '@/lib/utils';
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
];

export const getNurse = async () => {
  const result = await fetcher('/api/users', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  return result.users.filter((user) => user.role === userRole.nurse).reverse();
};

const AddNurseButton = ({ onUpdate }) => {
  const firstNameRef = useRef();
  const middleNameRef = useRef();
  const lastNameRef = useRef();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [newUser, setNewUser] = useState(null);

  const onSubmit = useCallback(async (e) => {
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
      setOpen(false);
      setNewUser(response);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <Fragment>
      <AlertDialog open={!!newUser}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>New nurse account created</AlertDialogTitle>
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
          <Button>Add nurse</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="mb-4">Create nurse account</DialogTitle>
            <form onSubmit={onSubmit}>
              <DialogDescription className="flex flex-col gap-3">
                <Input placeholder="First name" required ref={firstNameRef} />
                <Input
                  placeholder="Middle name (Optional)"
                  ref={middleNameRef}
                />
                <Input placeholder="Last name" required ref={lastNameRef} />
                <Button className="mt-4" type="submit" disabled={isLoading}>
                  Create
                </Button>
              </DialogDescription>
            </form>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </Fragment>
  );
};

const Nurses = ({ speechRecognitionKeyword, asComponent }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const getData = useCallback(async () => {
    setLoading(true);
    try {
      const nurses = await getNurse();
      if (speechRecognitionKeyword) {
        setUsers(speechRecognitionFilter(speechRecognitionKeyword, nurses));
        return;
      }

      setUsers(nurses);
    } catch (e) {
      // do nothing
    } finally {
      setLoading(false);
    }
  }, [speechRecognitionKeyword]);

  useEffect(() => {
    getData();
  }, [getData]);

  return (
    <>
      <Head>
        <title>Nurses</title>
      </Head>

      <div>
        <CustomDataTable
          loading={loading}
          title={
            speechRecognitionKeyword || asComponent ? undefined : 'Nurse list'
          }
          columns={columns}
          data={asComponent ? users.slice(0, 5) : users}
          showPagination={!asComponent && !speechRecognitionKeyword}
          additionalHeader={
            speechRecognitionKeyword || asComponent ? null : (
              <AddNurseButton onUpdate={getData} />
            )
          }
        />
      </div>
    </>
  );
};

export default Nurses;
