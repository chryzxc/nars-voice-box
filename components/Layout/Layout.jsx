import { Bars3Icon, BellIcon, XMarkIcon } from '@heroicons/react/24/outline';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Fragment } from 'react';
import { Input } from '@/components/ui/Input';
import Loader from '../Loader';
import { UserLayout } from '.';
import { fetcher } from '@/lib/fetch';
import toast from 'react-hot-toast';
import { useCurrentUser } from '@/lib/user';
import { useRouter } from 'next/router';
import { userRole } from '@/lib/constants';

const navigation = [
  { name: 'Home', href: '#', current: true },
  { name: 'About us', href: '#', current: false },
  { name: 'Contact us', href: '#', current: false },
];

const userNavigation = [
  { name: 'Your Profile', href: '#' },
  { name: 'Settings', href: '#' },
  { name: 'Sign out', href: '#' },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const LoginButton = () => {
  const usernameRef = useRef();
  const passwordRef = useRef();

  const [isLoading, setIsLoading] = useState(false);

  const { mutate } = useCurrentUser();

  const onSubmit = useCallback(
    async (event) => {
      setIsLoading(true);
      event.preventDefault();
      try {
        const response = await fetcher('/api/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: usernameRef.current.value,
            password: passwordRef.current.value,
          }),
        });
        mutate({ user: response.user }, false);

        toast.success('You have been logged in.');
      } catch (e) {
        toast.error('Incorrect username or password.');
      } finally {
        setIsLoading(false);
      }
    },
    [mutate]
  );
  return (
    <Dialog>
      <DialogTrigger>
        <Button className="uppercase" variant="outline">
          Login
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Login</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <Input
            ref={usernameRef}
            htmlType="username"
            autoComplete="username"
            placeholder="Username"
            ariaLabel="Username"
            size="large"
            required
          />

          <Input
            ref={passwordRef}
            htmlType="password"
            autoComplete="current-password"
            placeholder="Password"
            ariaLabel="Password"
            size="large"
            type="password"
            required
          />

          <Button htmlType="submit" loading={isLoading}>
            Log in
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const Layout = ({ children }) => {
  const { data: { user } = {}, mutate, isLoading } = useCurrentUser();
  const router = useRouter();

  // useEffect(() => {
  //   if (isLoading) return;
  //   if (user) {
  //     if (user && user.role === userRole.admin) {
  //       router.replace('/dashboard');
  //       return;
  //     }
  //     if (user && (!user.temporaryPasswordChanged || !user.role)) {
  //       router.replace('/account-setup');
  //       return;
  //     }
  //   }
  // }, [user, router, isLoading]);

  const home = (
    <div className="min-h-full">
      <Disclosure as="nav" className="bg-white">
        {({ open }) => (
          <>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex h-16 items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <img
                      className="h-8 w-8"
                      src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=500"
                      alt="Your Company"
                    />
                  </div>
                  <div className="hidden md:block">
                    <div className="ml-10 flex items-baseline space-x-4">
                      {navigation.map((item) => (
                        <a
                          key={item.name}
                          href={item.href}
                          className={classNames(
                            item.current
                              ? 'bg-primary-900 underline decoration-secondary decoration-2'
                              : 'hover:bg-secondary hover:text-white',
                            'rounded-md px-3 py-2 text-md font-bold text-primary '
                          )}
                          aria-current={item.current ? 'page' : undefined}
                        >
                          {item.name}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="hidden md:block">
                  <div className="ml-4 flex items-center md:ml-6">
                    {/* <button
                      type="button"
                      className="relative rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
                    >
                      <span className="absolute -inset-1.5" />
                      <span className="sr-only">View notifications</span>
                      <BellIcon className="h-6 w-6" aria-hidden="true" />
                    </button> */}
                    <LoginButton />

                    {/* Profile dropdown */}
                    <Menu as="div" className="relative ml-3">
                      <div>
                        <Menu.Button className="relative flex max-w-xs items-center rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                          <span className="absolute -inset-1.5" />
                          <span className="sr-only">Open user menu</span>
                          {/* <img
                        className="h-8 w-8 rounded-full"
                        src={user.imageUrl}
                        alt=""
                      /> */}
                        </Menu.Button>
                      </div>
                      <Transition
                        as={Fragment}
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                      >
                        <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                          {userNavigation.map((item) => (
                            <Menu.Item key={item.name}>
                              {({ active }) => (
                                <a
                                  href={item.href}
                                  className={classNames(
                                    active ? 'bg-gray-100' : '',
                                    'block px-4 py-2 text-sm text-gray-700'
                                  )}
                                >
                                  {item.name}
                                </a>
                              )}
                            </Menu.Item>
                          ))}
                        </Menu.Items>
                      </Transition>
                    </Menu>
                  </div>
                </div>
                <div className="-mr-2 flex md:hidden">
                  {/* Mobile menu button */}
                  <Disclosure.Button className="relative inline-flex items-center justify-center rounded-md bg-gray-800 p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                    <span className="absolute -inset-0.5" />
                    <span className="sr-only">Open main menu</span>
                    {open ? (
                      <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                    ) : (
                      <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                    )}
                  </Disclosure.Button>
                </div>
              </div>
            </div>

            <Disclosure.Panel className="md:hidden">
              <div className="space-y-1 px-2 pb-3 pt-2 sm:px-3">
                {navigation.map((item) => (
                  <Disclosure.Button
                    key={item.name}
                    as="a"
                    href={item.href}
                    className={classNames(
                      item.current
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                      'block rounded-md px-3 py-2 text-base font-medium'
                    )}
                    aria-current={item.current ? 'page' : undefined}
                  >
                    {item.name}
                  </Disclosure.Button>
                ))}
              </div>
              <div className="border-t border-gray-700 pb-3 pt-4">
                <div className="flex items-center px-5">
                  <div className="flex-shrink-0">
                    {/* <img
                  className="h-10 w-10 rounded-full"
                  src={user.imageUrl}
                  alt=""
                /> */}
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium leading-none text-white">
                      {/* {user.name} */}
                    </div>
                    <div className="text-sm font-medium leading-none text-gray-400">
                      {/* {user.email} */}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="relative ml-auto flex-shrink-0 rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
                  >
                    <span className="absolute -inset-1.5" />
                    <span className="sr-only">View notifications</span>
                    <BellIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                <div className="mt-3 space-y-1 px-2">
                  {userNavigation.map((item) => (
                    <Disclosure.Button
                      key={item.name}
                      as="a"
                      href={item.href}
                      className="block rounded-md px-3 py-2 text-base font-medium text-gray-400 hover:bg-gray-700 hover:text-white"
                    >
                      {item.name}
                    </Disclosure.Button>
                  ))}
                </div>
              </div>
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>

      {/* <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Dashboard
          </h1>
        </div>
      </header> */}
      <main>
        <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
          {/* Your content */}
          {children}
        </div>
      </main>
    </div>
  );

  if (isLoading) return <Loader />;

  if (!user) return home;

  if (!user.temporaryPasswordChanged)
    return (
      <div className="h-screen w-screen flex justify-center mt-[40px]">
        {children}
      </div>
    );

  return <UserLayout content={children} user={user} mutate={mutate} />;

  // return (
  //   // <>
  //   //   <Head>
  //   //     <title>Next.js MongoDB App</title>
  //   //     <meta
  //   //       key="viewport"
  //   //       name="viewport"
  //   //       content="width=device-width, initial-scale=1, shrink-to-fit=no"
  //   //     />
  //   //     <meta
  //   //       name="description"
  //   //       content="nextjs-mongodb-app is a continously developed app built with Next.JS and MongoDB. This project goes further and attempts to integrate top features as seen in real-life apps."
  //   //     />
  //   //     <meta property="og:title" content="Next.js + MongoDB App" />
  //   //     <meta
  //   //       property="og:description"
  //   //       content="nextjs-mongodb-app is a continously developed app built with Next.JS and MongoDB. This project goes further and attempts to integrate top features as seen in real-life apps."
  //   //     />
  //   //     <meta
  //   //       property="og:image"
  //   //       content="https://repository-images.githubusercontent.com/201392697/5d392300-eef3-11e9-8e20-53310193fbfd"
  //   //     />
  //   //   </Head>
  //   //   <Nav />
  //   //   <main className={styles.main}>{children}</main>
  //   //   <Footer />
  //   // </>

  //   // New
  //   // <div> {}</div>
  // );
};

export default Layout;
