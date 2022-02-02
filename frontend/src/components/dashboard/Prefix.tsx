import { useMutation } from "@apollo/client";
import { FC, lazy, useState } from "react";
import { updatePrefix } from "../../lib/graphql/mutation";

import { useParams } from "react-router-dom";
import type { GuildConfig } from "../../lib/types";

type prefixProps = {
  config: GuildConfig;
};

const Prefix: FC<prefixProps> = ({ config }) => {
  const Modal = lazy(() => import("../layouts/Modal"));
  const { id } = useParams();
  const [mutatePrefix] = useMutation(updatePrefix);

  const [isOpen, setIsOpen] = useState(false);
  const [isOpenF, setIsOpenF] = useState(false);
  const [isOpenW, setIsOpenW] = useState(false);
  const [value, setValue] = useState(config.prefix);

  return (
    <>
      <div className="shadow-xl p-5 ring-1 rounded-md bg-slate-800 hover:ring-red-400 ease-linear duration-500">
        <label
          htmlFor="prefix"
          className="block text-md mb-4 font-semibold text-gray-100"
        >
          Change Prefix
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <input
            type="text"
            id="prefix"
            className="focus:ring-indigo-500 focus:border-indigo-500 ring-1 block w-full pl-2 pr-6 py-[8px] sm:text-sm border-gray-300 rounded-md"
            maxLength={5}
            value={value}
            onChange={(e) => {
              e.preventDefault();
              setValue(e.target.value);
            }}
          />
        </div>
        <div className="mt-2 gap-5 flex">
          <button
            onClick={async (e) => {
              e.preventDefault();
              if (!value.length) {
                setIsOpenF(true);
                return setTimeout(() => setIsOpenF(false), 3000);
              }
              mutatePrefix({
                variables: { id, prefix: value },
              });
              setIsOpen(true);
              return setTimeout(() => setIsOpen(false), 3000);
            }}
            className="px-6 py-2 mt-2 text-sm rounded-md bg-indigo-600 hover:bg-indigo-500 shadow-md text-white ease-linear duration-500"
          >
            Save
          </button>
          <button
            onClick={() => {
              mutatePrefix({
                variables: { id, prefix: "?" },
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
        description={`Changed the guild prefix to ${value}`}
      />
      <Modal
        isOpen={isOpenF}
        setIsOpen={setIsOpenF}
        title="Error"
        titleColor="text-red-500"
        description="You need to input a prefix before saving!"
      />
      <Modal
        isOpen={isOpenW}
        setIsOpen={setIsOpenW}
        title="Success"
        titleColor="text-green-500"
        description={`The prefix is now ?`}
      />
    </>
  );
};

export { Prefix as default };
