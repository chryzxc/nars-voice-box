// import '@/assets/base.css';
import '../styles/globals.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';

import { Badge } from '@/components/ui/badge';
import { Layout } from '@/components/Layout';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'react-hot-toast';
import { TooltipProvider } from '@/components/ui/tooltip';

export default function MyApp({ Component, pageProps }) {
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
