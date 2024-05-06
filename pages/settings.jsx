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
import GlobalSettings from '@/page-components/Settings/GlobalSettings';
import Head from 'next/head';
import { Input } from '@/components/ui/input';
import PasswordSettings from '@/page-components/Settings/PasswordSettings';
import { Textarea } from '@/components/ui/textarea';
import { fetcher } from '@/lib/fetch';
import toast from 'react-hot-toast';
import { useCurrentUser } from '@/lib/user';
import { useForm } from 'react-hook-form';
import { userRole } from '@/lib/constants';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const SettingPage = () => {
  const {
    data: { user },
  } = useCurrentUser();

  return (
    <>
      <Head>
        <title>Settings</title>
      </Head>
      {user.role === userRole.admin ? <GlobalSettings /> : <PasswordSettings />}
    </>
  );
};

export default SettingPage;
