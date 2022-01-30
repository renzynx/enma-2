import { MoonLoader } from "react-spinners";

export const Loading = () => {
  return (
    <div className="w-screen min-h-screen bg-slate-900 flex items-center justify-center flex-col gap-5 text-white">
      <div className="text-[61pt]">
        en
        <span className="text-[#6cc312]  text-[61pt]">ma</span>
      </div>

      <div className="text-[1.75em]">Please wait...</div>
      <MoonLoader loading={true} color="white" />
    </div>
  );
};
