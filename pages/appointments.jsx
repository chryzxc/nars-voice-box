import Doctor from '@/page-components/Appointment/Doctor';
import Head from 'next/head';
import Nurse from '@/page-components/Appointment/Nurse';
import { useCurrentUser } from '@/lib/user';
import { userRole } from '@/lib/constants';

const Appointments = ({ speechRecognitionKeyword }) => {
  const {
    data: { user },
  } = useCurrentUser();

  return (
    <>
      <Head>
        <title>Appointments</title>
      </Head>

      {user.role === userRole.nurse ? (
        <Nurse speechRecognitionKeyword={speechRecognitionKeyword} />
      ) : (
        <Doctor speechRecognitionKeyword={speechRecognitionKeyword} />
      )}
    </>
  );
};

export default Appointments;
