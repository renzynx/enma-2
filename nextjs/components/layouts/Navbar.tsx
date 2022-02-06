import { Fragment, useEffect, useState } from "react";
import { Disclosure, Menu, Transition } from "@headlessui/react";
import { MenuIcon, XIcon } from "@heroicons/react/outline";
import { UserConfig, UserQueryType } from "../../lib/types";
import { useMutation, useQuery } from "@apollo/client";
import { logOutMutation } from "../../lib/graphql/mutation";
import { UserQuery } from "../../lib/graphql/query";
import { Loading } from "./Loading";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { graphqlClient } from "../../lib/graphql";

const navigation = [
  { name: "Home", href: "/dashboard", current: false },
  {
    name: "Invite me",
    href: "/invite",
    current: false,
  },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

const Navbar = () => {
  const { data, loading } = useQuery<UserQueryType>(UserQuery);

  const [logOut] = useMutation(logOutMutation);

  if (loading) return <Loading />;

  const user = data?.user;

  if (!user) return <></>;

  return (
    <Disclosure as="nav" className="bg-gray-800">
      {({ open }) => (
        <>
          <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
            <div className="relative flex items-center justify-between h-16">
              <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                {/* Mobile menu button*/}
                <Disclosure.Button className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <MenuIcon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
              <div className="flex-1 flex items-center justify-center sm:items-stretch sm:justify-start">
                <div className="flex-shrink-0 flex items-center">
                  <div className="block lg:hidden h-8 w-8">
                    <Image
                      className="rounded-full"
                      height="32px"
                      width="32px"
                      src="https://cdn.discordapp.com/avatars/772690931539247104/5f0aa26a8e2b83c3d218989b3063615e.webp"
                      alt="enma"
                    />
                  </div>
                  <div className="hidden lg:block h-8 w-8 rounded-full">
                    <Image
                      className="rounded-full"
                      height="32px"
                      width="32px"
                      src="https://cdn.discordapp.com/avatars/772690931539247104/5f0aa26a8e2b83c3d218989b3063615e.webp"
                      alt="enma"
                    />
                  </div>
                </div>
                <div className="hidden sm:block sm:ml-6">
                  <div className="flex space-x-4">
                    {navigation.map((item) => (
                      <div
                        key={item.name}
                        className={classNames(
                          item.current
                            ? "bg-gray-900 text-white"
                            : "text-gray-300 hover:bg-gray-700 hover:text-white",
                          "px-3 py-2 rounded-md text-sm font-medium"
                        )}
                      >
                        <Link
                          href={item.href}
                          passHref={true}
                          aria-current={item.current ? "page" : undefined}
                        >
                          {item.name}
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                {/* Profile dropdown */}
                <Menu as="div" className="ml-3 relative">
                  <div>
                    <Menu.Button className="bg-gray-800 flex items-center ring-2 ring-indigo-400 gap-1 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">
                      <span className="sr-only">Open user menu</span>
                      <Image
                        className="h-8 w-8 rounded-full"
                        width="32px"
                        height="32px"
                        src={`https://cdn.discordapp.com/avatars/${user?.uid}/${user?.avatar}.webp`}
                        alt="avatar"
                      />
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
                    <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <Menu.Item>
                        {({ active }) => (
                          <div
                            className={classNames(
                              active ? "bg-gray-100" : "",
                              "block px-4 py-2 text-sm text-gray-700"
                            )}
                          >
                            <Link href="/dashboard" passHref={true}>
                              Dashboard
                            </Link>
                          </div>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <div
                            className={classNames(
                              active ? "bg-gray-100" : "",
                              "block px-4 py-2 text-sm text-red-700"
                            )}
                            onClick={(e) => {
                              e.preventDefault();
                              logOut({
                                onCompleted: () => (window.location.href = "/"),
                                onError: (error) => console.log(error),
                              });
                            }}
                          >
                            Sign out
                          </div>
                        )}
                      </Menu.Item>
                    </Menu.Items>
                  </Transition>
                </Menu>
              </div>
            </div>
          </div>

          <Disclosure.Panel className="sm:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => (
                <Disclosure.Button
                  key={item.name}
                  as="a"
                  href={item.href}
                  className={classNames(
                    item.current
                      ? "bg-gray-900 text-white"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white",
                    "block px-3 py-2 rounded-md text-base font-medium"
                  )}
                  aria-current={item.current ? "page" : undefined}
                >
                  {item.name}
                </Disclosure.Button>
              ))}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
};

export { Navbar as default };
