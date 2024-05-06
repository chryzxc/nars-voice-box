import { AtSignIcon, MapPinIcon, PhoneIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

import { fetcher } from '@/lib/fetch';
import { useCurrentUser } from '@/lib/user';
import { useRouter } from 'next/router';
import { userRole } from '@/lib/constants';

const IndexPage = () => {
  const { data: { user } = {}, isLoading } = useCurrentUser();
  const router = useRouter();
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    const getData = async () => {
      const response = await fetcher(`/api/settings`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      setSettings(response);
    };
    getData();
  }, []);

  useEffect(() => {
    if (isLoading) return;
    if (user) {
      if (
        user &&
        user.role !== userRole.admin &&
        (!user.temporaryPasswordChanged || !user.role)
      ) {
        router.replace('/account-setup');
        return;
      }

      router.replace('/dashboard');
      return;
    }
  }, [user, router, isLoading]);

  return (
    <div>
      <section className=" dark:bg-gray-900 h-[80vh]" id="home">
        <div className="grid max-w-screen-xl px-4 py-8 mx-auto lg:gap-8 xl:gap-0 lg:py-16 lg:grid-cols-12 gap-4">
          <div className="mr-auto place-self-center lg:col-span-7">
            <p className="text-secondary max-w-2xl font-bold md:text-lg lg:text-xl text-black">
              We provide all healthcare solutions
            </p>
            <h1 className="max-w-2xl text-2xl font-bold tracking-tight leading-none md:text-5xl xl:text-6xl text-primary">
              Effortlessly Efficient: Nursing care that saves time and soothes
              souls
            </h1>
          </div>
          <div className="mt-0 col-span-5 flex justify-center ">
            <img src="/images/MCU 1.png" alt="mockup" className="w-full" />
          </div>
        </div>
      </section>
      <section className="bg-white dark:bg-gray-900  h-[80vh]" id="about-us">
        <div className="grid max-w-screen-xl px-4 py-8 mx-auto lg:py-16 lg:grid-cols-12 gap-14">
          <div className="hidden mt-0 col-span-5 lg:flex">
            <div className="relative w-full h-full">
              <img
                src="/images/MCU 3.png"
                alt="mockup"
                className="absolute w-[280px] h-[220px] top-0 left-0"
              />
              <img
                src="/images/MCU 2.png"
                alt="mockup"
                className="absolute w-[280px] h-[220px] right-0 bottom-0"
              />
            </div>
          </div>
          <div className="m-auto place-self-center lg:col-span-6">
            <p className="text-secondary text-xl font-medium text-center">
              About us
            </p>
            <p className="text-primary text-3xl font-bold text-center">
              Our Mission
            </p>
            <p className="text-lg">{`To harness the power of technology to
streamline workflow processes, foster effective
communication, and bolster data management in healthcare
settings. We are committed to facilitating evidence-based
decision-making, thereby improving patient care and
outcomes.`}</p>

            <p className="text-primary text-3xl font-bold mt-8 text-center">
              Our Vision
            </p>
            <p className="text-lg text-center">{`To be a leading force in the healthcare industry,
where technology and innovation drive efficiency and
effectiveness. We envision a future where data-driven
decisions are the norm, enhancing the quality of healthcare
and transforming patient experiences.`}</p>
          </div>
        </div>
      </section>
      <section
        className="bg-white dark:bg-gray-900  h-[80vh] max-w-screen-xl px-4 py-8 mx-auto lg:gap-8 xl:gap-0 lg:py-16"
        id="contact-us"
      >
        <div className="flex flex-col justify-center items-center">
          <p className="text-xl text-secondary font-medium">Contact us</p>
          <p className="text-3xl font-bold text-primary text-center">
            Get in touch with one of our friendly team members
          </p>
          <p className="text-gray-500 text-lg">
            Were here to help! if you have technical, account, or billing
            questions.
          </p>
          <div className="mt-10 flex flex-col gap-4">
            <div className="grid grid-cols-4 items-center">
              <div className="flex flex-row gap-4 items-center col-span-2">
                <AtSignIcon className="text-primary" />
                <p className="text-lg font-bold text-primary">Email:</p>
              </div>
              <p> {settings?.email}</p>
            </div>
            <div className="grid grid-cols-4 items-center">
              <div className="flex flex-row gap-4 items-center col-span-2">
                <PhoneIcon className="text-primary" />
                <p className="text-lg font-bold text-primary">Mobile Number:</p>
              </div>
              <p> {settings?.mobileNumber}</p>
            </div>

            <div className="grid grid-cols-4 items-center">
              <div className="flex flex-row gap-4 items-center col-span-2">
                <MapPinIcon className="text-primary" />
                <p className="text-lg font-bold text-primary">Address:</p>
              </div>
              <p> {settings?.address}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default IndexPage;
