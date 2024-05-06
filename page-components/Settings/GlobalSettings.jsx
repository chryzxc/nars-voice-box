import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import Head from 'next/head';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { fetcher } from '@/lib/fetch';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const GlobalSettings = () => {
  const [loading, setLoading] = useState(false);

  const formSchema = z.object({
    email: z.string().nullable(),
    mobileNumber: z.string().nullable(),
    address: z.string().nullable(),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      mobileNumber: '',
      address: '',
    },
  });

  async function onSubmit(values) {
    try {
      setLoading(true);
      await fetcher(`/api/settings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      toast.success(`Settings has been successfully updated`);
    } catch (e) {
      toast.error(`Failed: ${e}`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const getData = async () => {
      const response = await fetcher(`/api/settings`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      Object.entries(response).forEach(([key, value]) =>
        form.setValue(key, value)
      );
    };
    getData();
  }, [form]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        <Card>
          <CardHeader>
            <CardTitle>Contact us</CardTitle>
            <CardDescription>
              This will appear in your landing page
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="Enter email"
                      {...field}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="mobileNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mobile Number</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="Enter mobile number"
                      {...field}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Textarea
                      disabled={loading}
                      placeholder="Enter address here"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
        <div className="flex justify-end">
          <Button className="w-[120px]" disabled={loading}>
            Save
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default GlobalSettings;
