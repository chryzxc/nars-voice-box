import { ReloadIcon } from '@radix-ui/react-icons';

const Spinner = () => {
  return (
    <div className="flex justify-center items-center h-full w-full text-secondary">
      <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
    </div>
  );
};

export default Spinner;
