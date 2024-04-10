import * as React from 'react';

import { Progress } from '@/components/ui/progress';

function Loader() {
  const [progress, setProgress] = React.useState(13);

  React.useEffect(() => {
    const timer = setTimeout(() => setProgress(100), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="h-screen w-screen flex justify-center items-center ">
      <Progress value={progress} className="w-[20%]" />
    </div>
  );
}

export default Loader;
