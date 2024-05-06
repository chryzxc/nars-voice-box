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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { appointmentStatuses, userRole } from '@/lib/constants';
import {
  buildFullName,
  capitalizeFirstLetter,
  eventHasPassed,
  formatHourInDate,
  formatString,
  isDoctor,
  sortByDateTime,
  speechRecognitionFilter,
} from '@/lib/utils';

import AppointmentModal from './AppointmentModal';
import { Button } from '@/components/ui/button';
import CustomDataTable from '@/components/CustomDataTable';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import dayjs from 'dayjs';
import { fetcher } from '@/lib/fetch';
import moment from 'moment';
import theme from '@/styles/theme';
import toast from 'react-hot-toast';
import { useCurrentUser } from '@/lib/user';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const localizer = momentLocalizer(moment);

export const getNurseAppointments = async (userId) => {
  const results = await fetcher(
    `/api/appointment?creatorId=${userId}&status=${appointmentStatuses.pending}`,
    {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    }
  );
  return results;
  return results.filter((result) => moment(result.date).isAfter(moment()));
};

const Nurse = ({ speechRecognitionKeyword, asComponent }) => {
  const { data: { user } = {} } = useCurrentUser();
  const [isCreatingAppointment, setIsCreatingAppointment] = useState(false);
  const [bookedAppointments, setBookedAppointments] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [selectedAppointmentId, setSelectedApppointmentId] = useState(null);

  const selectedAppointmentData = useMemo(
    () => bookedAppointments.find(({ _id }) => selectedAppointmentId === _id),
    [selectedAppointmentId, bookedAppointments]
  );

  const markAsDone = async () => {
    try {
      await fetcher(`/api/appointment?id=${selectedAppointmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: appointmentStatuses.done,
        }),
      });
      toast.success(`Appointment has been updated`);
      getBookedAppointments();
    } catch (e) {
      toast.error(`Failed to update: ${e}`);
    }
  };

  const cancelAppointment = async () => {
    try {
      await fetcher(`/api/appointment?id=${selectedAppointmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: appointmentStatuses.cancelled,
        }),
      });
      toast.success(`Appointment has been cancelled`);
      getBookedAppointments();
    } catch (e) {
      toast.error(`Failed to update: ${e}`);
    }
  };

  const getBookedAppointments = useCallback(async () => {
    try {
      const results = await getNurseAppointments(user._id);

      if (speechRecognitionKeyword) {
        setBookedAppointments(
          speechRecognitionFilter(speechRecognitionKeyword, results)
        );
        return;
      }

      setBookedAppointments(results);
      setCalendarEvents(
        results.map((bookedAppointment) => ({
          id: bookedAppointment._id,
          title: `${capitalizeFirstLetter(bookedAppointment.patientName)} (${
            bookedAppointment.doctor.firstName
          } ${bookedAppointment.time})`,
          start: new Date(
            formatHourInDate(bookedAppointment.date, bookedAppointment.time)
          ),
          end: new Date(
            formatHourInDate(
              bookedAppointment.date,
              bookedAppointment.time,
              true
            )
          ),
          data: bookedAppointment,
        })) || []
      );
    } catch (e) {
      toast.error(`Failed to get appointments: ${e}`);
    }
  }, [speechRecognitionKeyword, user._id]);

  useEffect(() => {
    getBookedAppointments();
  }, [getBookedAppointments]);

  if (speechRecognitionKeyword || asComponent)
    return (
      <CustomDataTable
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
        data={sortByDateTime(bookedAppointments)}
      />
    );

  return (
    <Fragment>
      {isCreatingAppointment ? (
        <CreateAppointment
          onCancel={() => {
            getBookedAppointments();
            setIsCreatingAppointment(false);
          }}
          appointmentData={
            selectedAppointmentId ? selectedAppointmentData : null
          }
        />
      ) : (
        <Fragment>
          <AppointmentModal
            open={selectedAppointmentId && selectedAppointmentData}
            onOpenChange={() => setSelectedApppointmentId(null)}
            onEdit={() => setIsCreatingAppointment(true)}
            data={selectedAppointmentData}
            onComplete={markAsDone}
            onCancel={cancelAppointment}
          />
          <div>
            <Button
              className="bg-secondary"
              onClick={() => setIsCreatingAppointment(true)}
            >
              Create appointment
            </Button>
          </div>
          <Calendar
            eventPropGetter={(event) => {
              console.log({
                test: eventHasPassed(event.data.date),
                data: event.data,
              });
              return {
                style: {
                  backgroundColor: eventHasPassed(event.data.date)
                    ? 'orange'
                    : theme.primary,
                  color: 'white',
                  flexWrap: 'nowrap',
                },
              };
            }}
            onSelectEvent={({ id }) => setSelectedApppointmentId(id)}
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

const CreateAppointment = ({ onCancel, appointmentData }) => {
  const [loading, setLoading] = useState(true);
  const [doctors, setDoctors] = useState([]);
  const [bookedAppointments, setBookedAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(moment().add(1, 'day'));

  const formSchema = z.object({
    doctorType: z
      .string()
      .min(1, { message: 'Medical profession is required' }),
    doctorUserId: z.string().min(1, { message: 'Doctor is required' }),
    time: z.string().min(1, { message: 'Time  is required' }),
    patientName: z.string().min(4).max(50),
    patientContactInformation: z.string().min(4).max(50),
    patientAddress: z.string().min(4).max(70),
    notes: z.string().nullable(),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      doctorType: appointmentData?.doctor.role || '',
      doctorUserId: appointmentData?.doctor._id || '',
      time: appointmentData?.time || '',
      patientName: appointmentData?.patientName || '',
      patientContactInformation:
        appointmentData?.patientContactInformation || '',
      patientAddress: appointmentData?.patientAddress || '',
      notes: appointmentData?.notes || '',
    },
  });

  const watchSelectedDoctorUserId = form.watch('doctorUserId');
  const watchSelectedDoctorType = form.watch('doctorType');

  const selectedDoctorTimeSlots = useMemo(
    () =>
      doctors.find(({ _id }) => _id === watchSelectedDoctorUserId)?.timeSlots ||
      [],
    [doctors, watchSelectedDoctorUserId]
  );

  async function onSubmit(values) {
    try {
      setLoading(true);
      await fetcher(
        `/api/appointment${
          appointmentData ? `?id=${appointmentData._id}` : ''
        }`,
        {
          method: appointmentData ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...values,
            date: selectedDate,
          }),
        }
      );

      toast.success(
        `Appointment has been successfully ${
          appointmentData ? 'updated' : 'created'
        }`
      );
      onCancel();
    } catch (e) {
      toast.error(`Failed: ${e}`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    form.resetField('doctorUserId');
    form.resetField('time');

    const getDoctors = async () => {
      setLoading(true);
      try {
        const doctors = await fetcher(`/api/users/doctors`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        const doctorsByRoles = doctors.filter(
          (doctor) => doctor.role === watchSelectedDoctorType
        );

        const doctorsWithTimeSlots = await Promise.all(
          doctorsByRoles.map(async (doctor) => {
            const timeSlots = await fetcher(
              `/api/users/${doctor._id}/daytime-slots?date=${selectedDate}`,
              {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
              }
            );

            return {
              ...doctor,
              timeSlots,
            };
          })
        );

        setDoctors(doctorsWithTimeSlots);
      } catch (e) {
        toast.error(`Failed: ${e}`);
      } finally {
        setLoading(false);
      }
    };
    getDoctors();
  }, [watchSelectedDoctorType, selectedDate, form]);

  useEffect(() => {
    if (!watchSelectedDoctorUserId) {
      setBookedAppointments([]);
      return;
    }

    const getBookedAppointments = async () => {
      try {
        const bookedAppointments = await fetcher(
          `/api/appointment?date=${selectedDate}&doctorUserId=${watchSelectedDoctorUserId}`,
          {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          }
        );
        setBookedAppointments(bookedAppointments || []);
      } catch (e) {
        //
      }
    };
    getBookedAppointments();
  }, [watchSelectedDoctorUserId, selectedDate]);

  return (
    <Fragment>
      <div>
        <Button className="bg-secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
      <div className="flex flex-col lg:grid lg:grid-cols-4 gap-6">
        <div className="col-span-2">
          <Calendar
            dayPropGetter={(date) => {
              const isSame = moment(date).isSame(moment(selectedDate), 'day');
              return {
                style: {
                  border: isSame ? `solid ${theme.secondary} 1px` : undefined,
                  backgroundColor: isSame ? theme.secondary : undefined,
                },
              };
            }}
            localizer={localizer}
            events={[]}
            startAccessor="start"
            endAccessor="end"
            selectable
            onSelectSlot={({ start }) => {
              if (moment(start).isAfter()) {
                setSelectedDate(start);
              }
            }}
            views={{
              month: true,
            }}
            style={{ height: 500 }}
          />
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="col-span-2">
            <Card className="lg:max-h-[75vh] lg:overflow-hidden lg:overflow-y-scroll">
              <CardHeader>
                <p className="text-gray-500 text-sm">
                  {appointmentData ? 'Update' : 'Create'} appointment for:
                </p>
                <CardTitle className="text-xl font-bold">
                  {dayjs(selectedDate).format('dddd')}
                </CardTitle>
                <CardDescription className="text-md font-medium">
                  {dayjs(selectedDate).format('MMMM DD, YYYY')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4">
                  <FormField
                    control={form.control}
                    name="doctorType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Medical Profession</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select medical profession" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.values(userRole)
                              .filter(isDoctor)
                              .map((role, idx) => (
                                <SelectItem value={role} key={idx}>
                                  {capitalizeFirstLetter(formatString(role))}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>

                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="doctorUserId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Doctor</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={!form.getValues('doctorType')}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Doctor" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {doctors.map((doctor) => (
                              <SelectItem
                                value={doctor._id}
                                key={doctor._id}
                                disabled={!doctor.timeSlots.length}
                              >
                                {buildFullName({
                                  firstName: doctor.firstName,
                                  middleName: doctor.middleName,
                                  lastName: doctor.lastName,
                                })}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Time</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={!form.getValues('doctorUserId')}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Time" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {selectedDoctorTimeSlots.map((time, idx) => (
                              <SelectItem
                                value={time}
                                key={idx}
                                disabled={bookedAppointments.find(
                                  ({ time: bookedTime }) => bookedTime === time
                                )}
                                className={`${
                                  bookedAppointments.find(
                                    ({ time: bookedTime }) =>
                                      bookedTime === time
                                  )
                                    ? 'text-red-700 line-through'
                                    : undefined
                                }`}
                              >
                                {time}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="patientName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Patient name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter patient name" {...field} />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="patientContactInformation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Patient contact information</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter patient contact information (email/phone number)"
                            {...field}
                          />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="patientAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Patient address</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter patient address"
                            {...field}
                          />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Type any notes here"
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="mt-4 w-full" loading={loading}>
                  {appointmentData
                    ? 'Update appointment'
                    : 'Create appointment'}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </Form>
      </div>
    </Fragment>
  );
};

export default Nurse;
