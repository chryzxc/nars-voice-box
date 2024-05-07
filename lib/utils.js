import { clsx } from 'clsx';
import dayjs from 'dayjs';
import moment from 'moment';
import { timeZone } from './constants';
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
  const targetDate = moment(date);
  const startDate = targetDate.startOf('d').toDate();

  const endDate = targetDate.endOf('d').toDate();

  return { startDate, endDate };
};

export const formatHourInDate = (date, time, addOneHour) => {
  const formattedDate = moment(date).format('YYYY-MM-DD');
  return moment(`${formattedDate} ${time}`, 'YYYY-MM-DD h:mm a').add(
    addOneHour ? 1 : 0,
    'hour'
  );
};

export const speechRecognitionFilter = (keyword, dataArr, keysToDelete = []) =>
  dataArr
    .map((data) => {
      keysToDelete.forEach((key) => delete data[key]);
      return data;
    })
    .filter((data) =>
      keyword.split(' ').every((str) => {
        console.log('str', str);
        console.log('data', JSON.stringify(data));
        console.log('stringified', JSON.stringify(data).toLowerCase());
        console.log('test');
        return JSON.stringify(data).toLowerCase().includes(str.toLowerCase());
      })
    );

export const eventHasPassed = (date) => moment(date).isBefore(moment());

export function sortByDateTime(arr) {
  arr.sort(function (a, b) {
    const dateA = moment(a.date);
    const dateB = moment(b.date);

    if (dateA.isBefore(dateB)) return -1;
    if (dateA.isAfter(dateB)) return 1;

    const timeA = moment(a.time, 'h:mm a');
    const timeB = moment(b.time, 'h:mm a');

    if (timeA.isBefore(timeB)) return -1;
    if (timeA.isAfter(timeB)) return 1;

    return 0;
  });
  return arr;
}

export const newDate = (date) => moment(date).tz(timeZone).toDate();
