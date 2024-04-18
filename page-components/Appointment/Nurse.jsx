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
import { Fragment, useEffect, useMemo, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  buildFullName,
  capitalizeFirstLetter,
  filterDoctor,
  formatHourInDate,
  formatString,
} from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import dayjs from 'dayjs';
import { fetcher } from '@/lib/fetch';
import moment from 'moment';
import theme from '@/styles/theme';
import toast from 'react-hot-toast';
import { useCurrentUser } from '@/lib/user';
import { useForm } from 'react-hook-form';
import { userRole } from '@/lib/constants';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const localizer = momentLocalizer(moment);

const Nurse = () => {
  const { data: { user } = {} } = useCurrentUser();
  const [isCreatingAppointment, setIsCreatingAppointment] = useState(false);
  const [bookedAppointments, setBookedAppointments] = useState([]);
  const [selectedAppointment, setSelectedApppointment] = useState(null);

  useEffect(() => {
    const getBookedAppointments = async () => {
      try {
        const bookedAppointmentsResult = await fetcher(
          `/api/appointment?creatorId=${user._id}`,
          {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          }
        );
        setBookedAppointments(
          bookedAppointmentsResult.map((bookedAppointment) => ({
            id: 1,
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
          })) || []
        );
      } catch (e) {
        toast.error(`Failed to get appointments: ${e}`);
      }
    };
    getBookedAppointments();
  }, []);

  return (
    <Fragment>
      {isCreatingAppointment ? (
        <CreateAppointment onCancel={() => setIsCreatingAppointment(false)} />
      ) : (
        <Fragment>
          <div>
            <Button
              className="bg-secondary"
              onClick={() => setIsCreatingAppointment(true)}
            >
              Create appointment
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
            events={bookedAppointments}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 500 }}
          />
        </Fragment>
      )}
    </Fragment>
  );
};

const CreateAppointment = ({ onCancel }) => {
  const [loading, setLoading] = useState(true);
  const [doctors, setDoctors] = useState([]);
  const [bookedAppointments, setBookedAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

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
      doctorType: '',
      doctorUserId: '',
      time: '',
      patientName: '',
      patientContactInformation: '',
      patientAddress: '',
      notes: '',
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
      await fetcher('/api/appointment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values,
          date: selectedDate,
        }),
      });

      toast.success('Appointment has been successfully created');
      onCancel();
    } catch (e) {
      toast.error(`Failed: ${e}`);
    } finally {
      setLoading(false);
    }
  }

  const handleSelectDate = ({ start }) => setSelectedDate(start);

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
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="col-span-2">
            <Card className="lg:max-h-[75vh] lg:overflow-hidden lg:overflow-y-scroll">
              <CardHeader>
                <p className="text-gray-500 text-sm">Create appointment for:</p>
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
                              .filter(filterDoctor)
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
                  {/* <Input
                    placeholder="Patient name"
                    ref={patientNameRef}
                    required
                  /> */}
                  {/* <Input
                    placeholder="Patient contact information"
                    ref={patientContactInfoRef}
                    required
                  /> */}
                  {/* <Input
                    placeholder="Patient address"
                    ref={patientAddressRef}
                    required
                  /> */}
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
                  Create appointment
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
