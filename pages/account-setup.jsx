import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import Head from 'next/head';
import { Input } from '@/components/ui/input';
import { fetcher } from '@/lib/fetch';
import toast from 'react-hot-toast';
import { useRouter } from 'next/router';
import { userRole } from '@/lib/constants';

const AccountSetup = () => {
  const router = useRouter();
  const newPasswordRef = useRef();
  const confirmPasswordRef = useRef();

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log({
      firstName: newPasswordRef.current.value,
      middleName: confirmPasswordRef.current.value,
    });

    if (newPasswordRef.current.value !== confirmPasswordRef.current.value) {
      toast.error('Password does not match');
      return;
    }
    try {
      setIsLoading(true);
      const response = await fetcher(`/api/user/setup-account`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newPassword: newPasswordRef.current.value,
        }),
      });
      console.log('response', response);

      toast.success('Account has been successfully setup');
      router.push('/dashboard');
    } catch (e) {
      toast.error(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Account setup</title>
      </Head>
      <form onSubmit={handleSubmit}>
        <Card className="w-[400px]">
          <CardHeader>
            <CardTitle>Account setup</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Input
              type="password"
              placeholder="New password"
              ref={newPasswordRef}
              required
            />
            <Input
              type="password"
              placeholder="Confirm password"
              ref={confirmPasswordRef}
              required
            />
          </CardContent>
          <CardFooter>
            <Button disabled={isLoading}>Proceed</Button>
          </CardFooter>
        </Card>
      </form>
    </>
  );
};

export default AccountSetup;
