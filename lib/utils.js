import { clsx } from 'clsx';
import dayjs from 'dayjs';
import moment from 'moment';
import { twMerge } from 'tailwind-merge';

export const cn = (...inputs) => {
  return twMerge(clsx(inputs));
};

export const capitalizeFirstLetter = (string) => {
  return string?.charAt(0).toUpperCase() + string?.slice(1);
};

export const formatString = (raw) => {
  return raw.replaceAll('_', ' ');
};

export const formatDate = (raw) => dayjs(raw).format('DD/MM/YYYY hh:mm a');

export const isDoctor = (role) => role !== 'admin' && role !== 'nurse';

export const buildFullName = ({ firstName, middleName, lastName }) =>
  `${capitalizeFirstLetter(firstName)} ${
    middleName ? `${capitalizeFirstLetter(middleName.charAt(0))}.` : ''
  } ${capitalizeFirstLetter(lastName)}`;

export const sortTimeSlots = (array) => {
  function timeTo24Hour(time) {
    // eslint-disable-next-line no-unused-vars
    const [hour, minute, period] = time.match(/\d+|\w+/g);
    return period.toLowerCase() === 'pm'
      ? parseInt(hour, 10) + 12
      : parseInt(hour, 10);
  }

  array.sort((a, b) => {
    const timeA = timeTo24Hour(a);
    const timeB = timeTo24Hour(b);
    return timeA - timeB;
  });

  return array;
};

export const getStartAndEndDate = (date) => {
  const targetDate = new Date(date);
  const startDate = new Date(
    targetDate.getFullYear(),
    targetDate.getMonth(),
    targetDate.getDate()
  );

  const endDate = new Date(
    targetDate.getFullYear(),
    targetDate.getMonth(),
    targetDate.getDate() + 1
  );

  return { startDate, endDate };
};

export const formatHourInDate = (date, time, addOneHour) => {
  const formattedDate = moment(date).format('YYYY-MM-DD');
  return moment(`${formattedDate} ${time}`, 'YYYY-MM-DD h:mm a').add(
    addOneHour ? 1 : 0,
    'hour'
  );
};

export const speechRecognitionFilter = (keyword, dataArr) =>
  dataArr.filter((data) =>
    keyword
      .split(' ')
      .every((str) => JSON.stringify(data).toLowerCase().includes(str))
  );

export const eventHasPassed = (date) => moment(date).isBefore(moment());
