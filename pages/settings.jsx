import GlobalSettings from '@/page-components/Settings/GlobalSettings';
import Head from 'next/head';
import PasswordSettings from '@/page-components/Settings/PasswordSettings';
import { useCurrentUser } from '@/lib/user';
import { userRole } from '@/lib/constants';

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
