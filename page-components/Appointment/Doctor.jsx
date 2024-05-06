import { Calendar, momentLocalizer } from 'react-big-calendar';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Fragment, useCallback, useEffect, useState } from 'react';
import {
  capitalizeFirstLetter,
  formatHourInDate,
  speechRecognitionFilter,
} from '@/lib/utils';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import CustomDataTable from '@/components/CustomDataTable';
import Spinner from '@/components/Spinner';
import dayjs from 'dayjs';
import { fetcher } from '@/lib/fetch';
import moment from 'moment';
import theme from '@/styles/theme';
import toast from 'react-hot-toast';
import { useCurrentUser } from '@/lib/user';

const localizer = momentLocalizer(moment);

const timeSlotsArr = [
  {
    time: '6:00 am',
    period: 'morning',
    enabled: false,
  },
  {
    time: '7:00 am',
    period: 'morning',
    enabled: false,
  },
  {
    time: '8:00 am',
    period: 'morning',
    enabled: true,
  },
  {
    time: '9:00 am',
    period: 'morning',
    enabled: true,
  },
  {
    time: '10:00 am',
    period: 'morning',
    enabled: true,
  },
  {
    time: '11:00 am',
    period: 'morning',
    enabled: true,
  },
  {
    time: '1:00 pm',
    period: 'afternoon',
    enabled: true,
  },
  {
    time: '2:00 pm',
    period: 'afternoon',
    enabled: true,
  },
  {
    time: '3:00 pm',
    period: 'afternoon',
    enabled: true,
  },
  {
    time: '4:00 pm',
    period: 'afternoon',
    enabled: true,
  },
  {
    time: '5:00 pm',
    period: 'afternoon',
    enabled: true,
  },
  {
    time: '6:00 pm',
    period: 'evening',
    enabled: false,
  },
  {
    time: '7:00 pm',
    period: 'evening',
    enabled: false,
  },
  {
    time: '8:00 pm',
    period: 'evening',
    enabled: false,
  },
  {
    time: '9:00 pm',
    period: 'evening',
    enabled: false,
  },
  {
    time: '10:00 pm',
    period: 'evening',
    enabled: false,
  },
  {
    time: '11:00 pm',
    period: 'evening',
    enabled: false,
  },
];

export const getDoctorAppointments = async (userId) => {
  const results = await fetcher(`/api/appointment?doctorUserId=${userId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  return results;
  return results.filter((result) => moment(result.date).isAfter(moment()));
};

const SetSchedule = ({ onClose, defaultTimeSlots }) => {
  const [loading, setLoading] = useState(true);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState(defaultTimeSlots);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const selectTimeSlot = (timeSlot) => {
    if (selectedTimeSlots.includes(timeSlot)) {
      setSelectedTimeSlots((curr) =>
        curr.filter((currTimeSlot) => currTimeSlot !== timeSlot)
      );
      return;
    }
    setSelectedTimeSlots((curr) => [...curr, timeSlot]);
  };

  const handleSelectDate = ({ start }) => setSelectedDate(start);

  const handleSetDaySchedule = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await fetcher('/api/user/schedule/daytime-slots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timeSlots: selectedTimeSlots,
          date: selectedDate,
        }),
      });
      toast.success('Time slots has been successfully updated');
    } catch (e) {
      // toast.error(`Failed: ${e}`);
    } finally {
      setLoading(false);
    }
  };

  const getData = useCallback(async () => {
    setLoading(true);
    try {
      const { timeSlots = [], allDayUnavailable } =
        (await fetcher(
          `/api/user/schedule/daytime-slots?date=${selectedDate}`,
          {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          }
        )) || {};

      if (timeSlots && timeSlots?.length) {
        setSelectedTimeSlots(timeSlots);
      } else if (allDayUnavailable) {
        setSelectedTimeSlots([]);
      } else {
        setSelectedTimeSlots(defaultTimeSlots);
      }
    } catch (e) {
      setSelectedTimeSlots(defaultTimeSlots);
      // toast.error(`Failed: ${e}`);
    } finally {
      setLoading(false);
    }
  }, [selectedDate, defaultTimeSlots]);

  useEffect(() => {
    getData();
  }, [getData]);

  return (
    <Fragment>
      <div>
        <Button className="bg-secondary" onClick={onClose}>
          Cancel
        </Button>
      </div>
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <Calendar
            dayPropGetter={(date) => {
              return {
                style: {
                  border: dayjs(date).isSame(dayjs(selectedDate))
                    ? `solid ${theme.secondary} 1px`
                    : undefined,
                  backgroundColor: dayjs(date).isSame(dayjs(selectedDate))
                    ? theme.secondary
                    : undefined,
                },
              };
            }}
            localizer={localizer}
            events={[]}
            startAccessor="start"
            endAccessor="end"
            selectable
            onSelectSlot={handleSelectDate}
            views={{
              month: true,
            }}
            style={{ height: 500 }}
          />
        </div>
        <form onSubmit={handleSetDaySchedule}>
          <Card>
            <CardHeader>
              <p className="text-gray-500 text-sm">
                Set your daytime slots for:
              </p>
              <CardTitle className="text-xl font-bold">
                {dayjs(selectedDate).format('dddd')}
              </CardTitle>
              <CardDescription className="text-md font-medium">
                {dayjs(selectedDate).format('MMMM DD, YYYY')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col justify-between">
                <div className="flex flex-col gap-2">
                  <p className="text-primary font-medium">Morning</p>
                  <div className="flex flex-wrap gap-2">
                    {timeSlotsArr
                      .filter(({ period }) => period === 'morning')
                      .map(({ time }, idx) => (
                        <Badge
                          variant={
                            selectedTimeSlots.includes(time)
                              ? 'secondary'
                              : 'outline'
                          }
                          key={idx}
                          className={`cursor-pointer whitespace-nowrap ${
                            selectedTimeSlots.includes(time) && 'text-white'
                          }`}
                          onClick={() => selectTimeSlot(time)}
                        >
                          {time}
                        </Badge>
                      ))}
                  </div>
                  <p className="text-primary font-medium">Afternoon</p>
                  <div className="flex flex-wrap gap-2">
                    {timeSlotsArr
                      .filter(({ period }) => period === 'afternoon')
                      .map(({ time }, idx) => (
                        <Badge
                          variant={
                            selectedTimeSlots.includes(time)
                              ? 'secondary'
                              : 'outline'
                          }
                          key={idx}
                          className={`cursor-pointer whitespace-nowrap ${
                            selectedTimeSlots.includes(time) && 'text-white'
                          }`}
                          onClick={() => selectTimeSlot(time)}
                        >
                          {time}
                        </Badge>
                      ))}
                  </div>
                  <p className="text-primary font-medium">Evening</p>
                  <div className="flex flex-wrap gap-2">
                    {timeSlotsArr
                      .filter(({ period }) => period === 'evening')
                      .map(({ time }, idx) => (
                        <Badge
                          variant={
                            selectedTimeSlots.includes(time)
                              ? 'secondary'
                              : 'outline'
                          }
                          key={idx}
                          className={`cursor-pointer whitespace-nowrap ${
                            selectedTimeSlots.includes(time) && 'text-white'
                          }`}
                          onClick={() => selectTimeSlot(time)}
                        >
                          {time}
                        </Badge>
                      ))}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="mt-4 w-full" loading={loading}>
                Confirm
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </Fragment>
  );
};

const Doctor = ({ speechRecognitionKeyword, asComponent }) => {
  const { data: { user } = {} } = useCurrentUser();

  const [loading, setLoading] = useState(true);
  const [isSettingSchedule, setIsSettingSchedule] = useState(false);
  const [openDefaultTimeSlot, setOpenDefaultTimeSlot] = useState(true);
  const [hasDefaultTimeSlots, setHasDefaultTimeSlots] = useState(false);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState([]);

  const [bookedAppointments, setBookedAppointments] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [selectedAppointment, setSelectedApppointment] = useState(null);

  const selectTimeSlot = (timeSlot) => {
    if (selectedTimeSlots.includes(timeSlot)) {
      setSelectedTimeSlots((curr) =>
        curr.filter((currTimeSlot) => currTimeSlot !== timeSlot)
      );
      return;
    }
    setSelectedTimeSlots((curr) => [...curr, timeSlot]);
  };

  const handleSetDefaultTimeSlots = async (e) => {
    e.preventDefault();
    try {
      await fetcher('/api/user/schedule/default-time-slots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timeSlots: selectedTimeSlots }),
      });
    } catch (e) {
      // do nothing
    } finally {
      getData();
    }
  };

  const getData = useCallback(async () => {
    setLoading(true);
    try {
      const timeSlots = await fetcher('/api/user/schedule/default-time-slots', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      const appointments = await getDoctorAppointments(user._id);

      if (speechRecognitionKeyword) {
        setBookedAppointments(
          speechRecognitionFilter(speechRecognitionKeyword, appointments)
        );
        return;
      }

      setBookedAppointments(appointments);
      setCalendarEvents(
        appointments.map((appointment) => ({
          id: appointment._id,
          title: `${capitalizeFirstLetter(appointment.patientName)} (${
            appointment.time
          })`,
          start: new Date(formatHourInDate(appointment.date, appointment.time)),
          end: new Date(
            formatHourInDate(appointment.date, appointment.time, true)
          ),
          data: appointment,
        })) || []
      );

      if (!timeSlots?.length) {
        setSelectedTimeSlots(
          timeSlotsArr.filter(({ enabled }) => enabled).map(({ time }) => time)
        );
        setHasDefaultTimeSlots(false);
        return;
      } else {
        setSelectedTimeSlots(timeSlots);
        setHasDefaultTimeSlots(true);
      }
    } catch (e) {
      // toast.error(`Failed: ${e}`);
    } finally {
      setLoading(false);
    }
  }, [user._id]);

  useEffect(() => {
    getData();
  }, [getData]);

  if (loading) return <Spinner />;

  console.log('data', bookedAppointments);

  if (speechRecognitionKeyword || asComponent)
    return (
      <CustomDataTable
        loading={loading}
        columns={[
          {
            name: 'Patient Name',
            selector: (row) => row.patientName,
            sortable: true,
          },
          {
            name: 'Date',
            selector: (row) => moment(row.date).format('MMMM DD, YYYY '),
            sortable: true,
          },
          {
            name: 'Time',
            selector: (row) => row.time,
            sortable: true,
          },
        ]}
        data={bookedAppointments}
      />
    );

  return (
    <Fragment>
      <Dialog
        open={!hasDefaultTimeSlots ?? openDefaultTimeSlot}
        onOpenChange={setOpenDefaultTimeSlot}
      >
        <DialogContent>
          <form onSubmit={handleSetDefaultTimeSlots}>
            <DialogHeader>
              <DialogTitle>Set your default working time slots</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-2">
              <p className="text-primary font-medium">Morning</p>
              <div className="flex flex-row gap-2">
                {timeSlotsArr
                  .filter(({ period }) => period === 'morning')
                  .map(({ time }, idx) => (
                    <Badge
                      variant={
                        selectedTimeSlots.includes(time) ? undefined : 'outline'
                      }
                      key={idx}
                      className="cursor-pointer"
                      onClick={() => selectTimeSlot(time)}
                    >
                      {time}
                    </Badge>
                  ))}
              </div>
              <p className="text-primary font-medium">Afternoon</p>
              <div className="flex flex-row gap-2">
                {timeSlotsArr
                  .filter(({ period }) => period === 'afternoon')
                  .map(({ time }, idx) => (
                    <Badge
                      variant={
                        selectedTimeSlots.includes(time) ? undefined : 'outline'
                      }
                      key={idx}
                      className="cursor-pointer"
                      onClick={() => selectTimeSlot(time)}
                    >
                      {time}
                    </Badge>
                  ))}
              </div>
              <p className="text-primary font-medium">Evening</p>
              <div className="flex flex-row gap-2">
                {timeSlotsArr
                  .filter(({ period }) => period === 'evening')
                  .map(({ time }, idx) => (
                    <Badge
                      variant={
                        selectedTimeSlots.includes(time) ? undefined : 'outline'
                      }
                      key={idx}
                      className="cursor-pointer"
                      onClick={() => selectTimeSlot(time)}
                    >
                      {time}
                    </Badge>
                  ))}
              </div>
              <Button type="submit" className="mt-4">
                Submit
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      {isSettingSchedule ? (
        <SetSchedule
          onClose={() => setIsSettingSchedule(false)}
          defaultTimeSlots={selectedTimeSlots}
        />
      ) : (
        <Fragment>
          <div>
            <Button
              className="bg-secondary"
              onClick={() => setIsSettingSchedule(true)}
            >
              Set working schedule
            </Button>
          </div>
          <Calendar
            eventPropGetter={() => {
              return {
                style: {
                  backgroundColor: theme.primary,
                },
              };
            }}
            localizer={localizer}
            events={calendarEvents}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 500 }}
          />
        </Fragment>
      )}
    </Fragment>
  );
};

export default Doctor;
