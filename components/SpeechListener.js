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
import { Fragment, useState } from 'react';
import SpeechRecognition, {
  useSpeechRecognition,
} from 'react-speech-recognition';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

import Attendance from 'pages/attendance';
import { Button } from '@/components/ui/button';
import { MicrophoneIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const SpeechListener = () => {
  const commands = ['Search attendance'];
  const [openResults, setOpenResults] = useState(false);
  const [keyword, setKeyword] = useState(null);
  const [message, setMessage] = useState('');

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition({
    commands: commands.map((command) => ({
      command: `${command} *`,
      callback: (keyword) => {
        setOpenResults(true);
        setMessage(
          `${command.replaceAll(`${command}`, 'Results for')}: ${keyword}`
        );
        setKeyword(keyword.replaceAll('.', ''));
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
    setKeyword(null);
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
              {commands.map((command, idx) => (
                <li key={idx}>{`${command} [keyword]`}</li>
              ))}
            </ul>
          </div>
        </TooltipContent>
      </Tooltip>

      <Drawer open={openResults} onOpenChange={setOpenResults}>
        <DrawerContent>
          <DrawerHeader>
            {/* {!!transcript && (
              <div className="relative flex flex-row gap-2 items-center">
                <p className="text-gray-500 text-sm"></p>
              </div>
            )} */}
            <DrawerTitle>{message}</DrawerTitle>
            <DrawerDescription></DrawerDescription>
            <Attendance speechRecognitionKeyword={keyword} />
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
