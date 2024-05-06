import 'regenerator-runtime';

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Fragment, useMemo, useState } from 'react';
import SpeechRecognition, {
  useSpeechRecognition,
} from 'react-speech-recognition';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

import Appointments from 'pages/appointments';
import Attendance from 'pages/attendance';
import { Button } from '@/components/ui/button';
import { MicrophoneIcon } from '@heroicons/react/24/outline';
import Nurses from 'pages/nurses';
import Patients from 'pages/patients';
import { doctorRoles } from './Layout/UserLayout';
import toast from 'react-hot-toast';
import { useCurrentUser } from '@/lib/user';
import { userRole } from '@/lib/constants';

const SpeechListener = () => {
  const {
    data: { user },
  } = useCurrentUser();
  const [openResults, setOpenResults] = useState(false);
  const [speechCommand, setSpeechCommand] = useState({
    keyword: null,
    command: null,
  });
  const [message, setMessage] = useState('');

  const commandsArr = useMemo(
    () => ({
      attendance: {
        command: 'search attendance',
        component: (
          <Attendance speechRecognitionKeyword={speechCommand.keyword} />
        ),
        roles: doctorRoles,
      },
      patient: {
        command: 'search patient',
        component: (
          <Patients speechRecognitionKeyword={speechCommand.keyword} />
        ),
        roles: [...doctorRoles, userRole.nurse],
      },
      appointment: {
        command: 'search appointment',
        component: (
          <Appointments speechRecognitionKeyword={speechCommand.keyword} />
        ),
        roles: [...doctorRoles, userRole.nurse],
      },
      nurse: {
        command: 'search nurse',
        component: <Nurses speechRecognitionKeyword={speechCommand.keyword} />,
        roles: doctorRoles,
      },
    }),
    [speechCommand.keyword]
  );

  const commandsByRole = useMemo(
    () =>
      Object.values(commandsArr).filter(({ roles }) =>
        roles.includes(user.role)
      ),
    [commandsArr, user.role]
  );

  const resultComponent = useMemo(
    () =>
      commandsByRole.find(({ command }) => {
        return command.toLowerCase() === speechCommand.command?.toLowerCase();
      })?.component,
    [speechCommand.command, commandsByRole]
  );

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition({
    commands: commandsByRole.map(({ command }) => ({
      command: `${command} *`,
      callback: (keyword) => {
        setOpenResults(true);
        setMessage(
          `${command.replaceAll(`${command}`, 'Results for')}: ${keyword}`
        );
        setSpeechCommand({ command, keyword: keyword.replaceAll('.', '') });

        console.log({ resultComponent });
        SpeechRecognition.stopListening();
      },
    })),

    // [
    //   // {
    //   //   command: 'I would like to order *',
    //   //   callback: (food) => setMessage(`Your order is for: ${food}`),
    //   // },
    //   // {
    //   //   command: 'The weather is :condition today',
    //   //   callback: (condition) =>
    //   //     setMessage(`Today, the weather is ${condition}`),
    //   // },
    //   // {
    //   //   command: 'My top sports are * and *',
    //   //   callback: (sport1, sport2) =>
    //   //     setMessage(`#1: ${sport1}, #2: ${sport2}`),
    //   // },
    //   // {
    //   //   command: 'Pass the salt (please)',
    //   //   callback: () => setMessage('My pleasure'),
    //   // },
    //   {
    //     command: commands,
    //     callback: ({ command }) => setMessage(`Searching for "${command}"`),
    //     matchInterim: true,
    //   },
    // ],
  });

  const handleClear = () => {
    SpeechRecognition.stopListening();
    setSpeechCommand({ command: null, keyword: null });
    setMessage('');
    resetTranscript();
  };

  const toggleSpeechListener = () =>
    listening
      ? handleClear()
      : SpeechRecognition.startListening({ continuous: true });

  if (!browserSupportsSpeechRecognition) {
    toast.error(`Browser doesn't support speech recognition.`);
    return null;
  }

  return (
    <Fragment>
      <div className="w-full flex-1">
        {transcript && (
          <p className="text-gray-500 text-sm">Transcript: {transcript}</p>
        )}
      </div>
      <Tooltip>
        <TooltipTrigger>
          <div className="flex justify-center items-center">
            <span className="relative flex h-11 w-11">
              {listening && (
                <span
                  className={
                    'animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75'
                  }
                />
              )}

              <Button
                variant="outline"
                size="icon"
                onClick={toggleSpeechListener}
                className="relative inline-flex h-11 w-11 rounded-full"
              >
                <MicrophoneIcon
                  className={`${
                    listening ? 'text-red-500' : 'text-secondary'
                  } m-2.5`}
                />
              </Button>
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            {listening
              ? 'Disable speech recognition'
              : 'Activate speech recognition'}
          </p>
          <div className="mt-2">
            <p>Voice commands:</p>
            <ul className="list-decimal list-inside">
              {commandsByRole.map(({ command }, idx) => (
                <li
                  key={idx}
                  className="capitalize"
                >{`${command} [keyword]`}</li>
              ))}
            </ul>
          </div>
        </TooltipContent>
      </Tooltip>

      <Drawer open={openResults} onOpenChange={setOpenResults}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{message}</DrawerTitle>
            <DrawerDescription></DrawerDescription>
            {resultComponent}
          </DrawerHeader>
          <DrawerFooter>
            <DrawerClose>
              <Button variant="outline" onClick={handleClear}>
                Close
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </Fragment>
  );
};

export default SpeechListener;
