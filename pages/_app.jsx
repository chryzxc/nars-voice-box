// import '@/assets/base.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '../styles/globals.css';

import { Layout } from '@/components/Layout';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'react-hot-toast';
import { TooltipProvider } from '@/components/ui/tooltip';
import momentTimeZone from 'moment-timezone';
import { timeZone } from '@/lib/constants';

momentTimeZone.tz.setDefault(timeZone);

export default function MyApp({ Component, pageProps }) {
  console.log('Hello fellow devs! https://github.com/chryzxc');
  return (
    <ThemeProvider>
      <TooltipProvider>
        <Layout>
          <Component {...pageProps} />
          <Toaster />
        </Layout>
      </TooltipProvider>
    </ThemeProvider>
  );
}
