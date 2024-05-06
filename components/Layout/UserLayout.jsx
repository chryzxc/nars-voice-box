import 'regenerator-runtime';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  CalendarDaysIcon,
  ChevronDownIcon,
  DocumentIcon,
  Squares2X2Icon,
  UserGroupIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Menu, SettingsIcon } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { capitalizeFirstLetter, formatString } from '@/lib/utils';
import { useCallback, useState } from 'react';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Logo from '../Logo';
import SpeechListener from '../SpeechListener';
import { fetcher } from '@/lib/fetch';
import toast from 'react-hot-toast';
import { useRouter } from 'next/router';
import { userRole } from '@/lib/constants';

export const doctorRoles = [
  userRole.internal_family_doctor,
  userRole.neurologist,
  userRole.pediatric,
  userRole.surgeon,
];

export const links = [
  {
    label: 'Dashboard',
    icon: Squares2X2Icon,
    href: '/dashboard',
    isActive: true,
    roles: Object.values(userRole).map(String),
  },
  {
    label: 'Nurses',
    icon: UsersIcon,
    href: '/nurses',
    // notificationCount: 3,
    isActive: false,
    roles: doctorRoles,
  },
  {
    label: 'Patients',
    icon: UserGroupIcon,
    href: '/patients',
    // notificationCount: 4,
    isActive: false,
    roles: [...doctorRoles, userRole.nurse],
  },
  {
    label: 'Attendance',
    icon: DocumentIcon,
    href: '/attendance',
    isActive: false,
    roles: [...doctorRoles, userRole.nurse],
  },
  {
    label: 'Appointments',
    icon: CalendarDaysIcon,
    href: '/appointments',
    isActive: false,
    roles: [userRole.nurse, ...doctorRoles],
  },
  {
    label: 'Users',
    icon: UsersIcon,
    href: '/users',
    isActive: false,
    roles: [userRole.admin],
  },
  {
    label: 'Settings',
    icon: SettingsIcon,
    href: '/settings',
    isActive: false,
    roles: [userRole.admin],
  },
];

export default function UserLayout({ mutate, user, content }) {
  const router = useRouter();
  const [openSideNav, setOpenSideNav] = useState(false);
  const isPageActive = (link) => router.asPath === link;

  const handleLogout = useCallback(async () => {
    try {
      await fetcher('/api/auth', {
        method: 'DELETE',
      });
      toast.success('You have been signed out');
      router.push('/');
      mutate({ user: null });
    } catch (e) {
      toast.error(e.message);
    }
  }, [mutate, router]);

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/">
              <Logo />
            </Link>
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              {links
                .filter((link) => link.roles.includes(user.role))
                .map((link, idx) => {
                  return (
                    <Link href={link.href} key={idx}>
                      <div
                        className={`${
                          isPageActive(link.href)
                            ? 'bg-primary text-white transition-all '
                            : 'text-muted-foreground transition-all hover:text-primary '
                        }flex items-center gap-3 rounded-lg cursor-pointer px-3 py-2`}
                      >
                        <link.icon className="h-4 w-4" />
                        {link.label}
                      </div>
                    </Link>
                  );
                })}
            </nav>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
          <Sheet onOpenChange={setOpenSideNav} open={openSideNav}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
              <nav className="grid gap-2 text-lg font-medium">
                <Link href="#">
                  <Logo />
                </Link>
                {links
                  .filter((link) => link.roles.includes(user.role))
                  .map((link, idx) => {
                    return (
                      <Link href={link.href} key={idx}>
                        <div
                          onClick={() => setOpenSideNav(false)}
                          className={`${
                            isPageActive(link.href)
                              ? 'bg-primary text-white transition-all '
                              : 'text-muted-foreground transition-all hover:text-primary '
                          }flex items-center gap-3 rounded-lg cursor-pointer px-3 py-2`}
                          // className="cursor-pointer mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                        >
                          <link.icon className="h-5 w-5" />
                          {link.label}
                        </div>
                      </Link>
                    );
                  })}
              </nav>
            </SheetContent>
          </Sheet>

          {user.role !== userRole.admin ? (
            <SpeechListener />
          ) : (
            <div className="flex-1" />
          )}
          <DropdownMenu className="flex">
            <DropdownMenuTrigger asChild>
              <div className="flex flex-row gap-4">
                <div className="flex flex-row gap-2  justify-center items-center">
                  {user.role !== userRole.admin && (
                    <>
                      <Avatar>
                        <AvatarImage src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRDwmG52pVI5JZfn04j9gdtsd8pAGbqjjLswg&s" />
                        <AvatarFallback>{`${user.firstName} ${user.lastName}`}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col gap-1 items-start justify-center">
                        <p className="font-medium leading-none">{`${user.firstName} ${user.lastName}`}</p>
                        <p className="text-sm text-gray-500 leading-none capitalize">
                          {formatString(user.role)}
                        </p>
                      </div>
                    </>
                  )}

                  {user.role === userRole.admin && (
                    <p className="font-medium text-lg">
                      {capitalizeFirstLetter(formatString(user.role))}
                    </p>
                  )}

                  <ChevronDownIcon className="mx-4  h-3 w-3" />
                </div>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {/* <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator /> */}
              <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 ">
          {content}
        </main>
      </div>
    </div>
  );
}
