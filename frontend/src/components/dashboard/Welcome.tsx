import {
  ApolloCache,
  DefaultContext,
  MutationFunctionOptions,
  OperationVariables,
} from "@apollo/client";
import { FC, Fragment, lazy, useState } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, SelectorIcon } from "@heroicons/react/solid";
import { useParams } from "react-router-dom";
import { GuildChannelType, GuildConfig } from "../../lib/types";

type props = {
  config: GuildConfig;
  mutateWelcome: (
    options?:
      | MutationFunctionOptions<
          any,
          OperationVariables,
          DefaultContext,
          ApolloCache<any>
        >
      | undefined
  ) => Promise<any>;
  channels?: GuildChannelType[];
};

export const Welcome: FC<props> = ({ config, mutateWelcome, channels }) => {
  const Modal = lazy(() => import("../layouts/Modal"));
  const { id } = useParams();

  const [selected, setSelected] = useState(
    channels && config.welcome_channel !== null
      ? `#${channels.filter((c) => c.id === config.welcome_channel)[0].name}`
      : "Please select a channel!"
  );

  const [channelId, setchannelId] = useState("");

  const [isOpen, setIsOpen] = useState(false);
  const [isOpenF, setIsOpenF] = useState(false);
  const [isOpenW, setIsOpenW] = useState(false);

  return (
    <>
      <div className="ring-1 p-5 rounded-md shadow-xl bg-slate-800 text-slate-800 hover:ring-red-400 ease-linear duration-500">
        <p className="block text-md mb-4 text-gray-100 font-semibold">
          Set Welcome Channel
        </p>
        <Listbox
          value={selected}
          onChange={(e) => {
            setSelected(e);
            channels &&
              channels.some((k) => {
                if ("#" + k.name === e) return setchannelId(k.id);
                return null;
              });
          }}
        >
          <div className="relative mt-1 ring-1 rounded-md">
            <Listbox.Button className="relative w-full py-2 pl-3 pr-10 text-left bg-white rounded-lg shadow-md cursor-default focus:outline-none focus-visible:ring-2 focus-visible:ring-opacity-75 focus-visible:ring-white focus-visible:ring-offset-orange-300 focus-visible:ring-offset-2 focus-visible:border-indigo-500 sm:text-sm">
              <span className="block truncate">{selected}</span>
              <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <SelectorIcon
                  className="w-5 h-5 text-gray-400"
                  aria-hidden="true"
                />
              </span>
            </Listbox.Button>
            <Transition
              as={Fragment}
              enter="transition duration-100 ease-out"
              enterFrom="transform scale-95 opacity-0"
              enterTo="transform scale-100 opacity-100"
              leave="transition duration-75 ease-out"
              leaveFrom="transform scale-100 opacity-100"
              leaveTo="transform scale-95 opacity-0"
            >
              <Listbox.Options className="absolute w-full py-1 mt-1 overflow-auto text-base bg-white rounded-md shadow-lg max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                {channels &&
                  channels.map((channel: GuildChannelType) => (
                    <Listbox.Option
                      key={channel.id}
                      className={({ active }) =>
                        `${
                          active
                            ? "text-indigo-900 bg-indigo-100 "
                            : "text-gray-900"
                        }
                  select-none relative py-2 pl-10 pr-4 cursor-pointer`
                      }
                      value={`#${channel.name}`}
                    >
                      {({ selected, active }) => (
                        <>
                          <span
                            className={`${
                              selected ? "font-medium" : "font-normal"
                            } block truncate`}
                          >
                            #{channel.name}
                          </span>
                          {selected ? (
                            <span
                              className={`${
                                active ? "text-indigo-600" : "text-indigo-600"
                              }
                            absolute inset-y-0 left-0 flex items-center pl-3`}
                            >
                              <CheckIcon
                                className="w-5 h-5"
                                aria-hidden="true"
                              />
                            </span>
                          ) : null}
                        </>
                      )}
                    </Listbox.Option>
                  ))}
              </Listbox.Options>
            </Transition>
          </div>
        </Listbox>
        <div className="mt-2 gap-5 flex">
          <button
            onClick={() => {
              if (!channelId.length) {
                setIsOpenF(true);
                return setTimeout(() => setIsOpenF(false), 3000);
              }

              setIsOpen(true);
              mutateWelcome({
                variables: {
                  id,
                  welcome: channelId,
                },
              });
              return setTimeout(() => setIsOpen(false), 3000);
            }}
            className="px-6 py-2 mt-2 text-sm ring-1 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white shadow-md ease-linear duration-500"
          >
            Save
          </button>
          <button
            onClick={() => {
              mutateWelcome({
                variables: { id, welcome: null },
              });
              setIsOpenW(true);
              return setTimeout(() => setIsOpenW(false), 3000);
            }}
            className="px-6 py-2 mt-2 text-sm rounded-md text-white bg-red-600 hover:bg-red-500 shadow-md ease-linear duration-500"
          >
            Reset
          </button>
        </div>
      </div>
      <Modal
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        title="Success"
        titleColor="text-green-500"
        description={`Updated welcome channel to ${selected}`}
      />
      <Modal
        isOpen={isOpenF}
        setIsOpen={setIsOpenF}
        title="Error"
        titleColor="text-red-500"
        description="You need to select a channel before saving!"
      />
      <Modal
        isOpen={isOpenW}
        setIsOpen={setIsOpenW}
        title="Success"
        titleColor="text-green-500"
        description={`Deleted welcome channel id from database!`}
      />
    </>
  );
};
