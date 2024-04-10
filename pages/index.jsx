import { Button } from '@/components/ui/button';
import { useCurrentUser } from '@/lib/user';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { userRole } from '@/lib/constants';

const IndexPage = () => {
  const { data: { user } = {}, isLoading } = useCurrentUser();
  const router = useRouter();

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
      <section className="bg-white dark:bg-gray-900">
        <div className="grid max-w-screen-xl px-4 py-8 mx-auto lg:gap-8 xl:gap-0 lg:py-16 lg:grid-cols-12">
          <div className="mr-auto place-self-center lg:col-span-7">
            <h1 className="max-w-2xl mb-4 text-4xl font-extrabold tracking-tight leading-none md:text-5xl xl:text-6xl text-primary">
              We provide all healthcare solutions
            </h1>
            <p className="max-w-2xl mb-6 font-normal  lg:mb-8 md:text-lg lg:text-xl text-black">
              Effortlessly Efficient: Nursing care that saves time and soothes
              souls
            </p>
            <Button className="bg-secondary">View more</Button>
          </div>
          <div className="hidden lg:mt-0 lg:col-span-5 lg:flex">
            <img
              src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/hero/phone-mockup.png"
              alt="mockup"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default IndexPage;
