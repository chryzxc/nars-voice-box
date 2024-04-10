import { Calendar, momentLocalizer } from 'react-big-calendar';

import Head from 'next/head';
import moment from 'moment';

const localizer = momentLocalizer(moment);

const Attendance = () => {
  return (
    <>
      <Head>
        <title>Attendance</title>
      </Head>
      <Calendar
        localizer={localizer}
        events={[]}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }}
      />
    </>
  );
};

export default Attendance;
