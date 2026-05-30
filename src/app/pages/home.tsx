import { Globe } from "@/app/components/Globe";
import { ArrowUpRightIcon } from "@/app/components/icons/arrow-up-right";

const Polaroid = () => {
  return (
    <div>
      <div className="bg-white p-4 shadow-xs flex flex-col gap-4 outline outline-neutral-200/40">
        <div className="flex gap-1.5 items-center">
          <svg
            className="size-2 bg-teal-400 rounded-full"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          />
          <div className="font-bold">Logan Liffick 🇿🇦</div>
        </div>
        <div className="relative">
          <img
            src="/example.png"
            alt="WorkNest"
            className="h-64 object-cover"
          />

          <div className="absolute bottom-5 right-5 text-xs bg-white rounded-2xl px-3 py-1.5">
            upshot.dev
          </div>
        </div>
        <div className="flex justify-between items-center">
          <div className="text-dot-gothic-16">Design Engineer</div>
          <ArrowUpRightIcon size={18} />
        </div>
      </div>
    </div>
  );
};

export const Home = () => {
  return (
    <div className="bg-white min-h-screen flex items-start justify-between pl-12 sm:pl-24 pr-12 max-w-400 gap-10 mx-auto">
      <div className="sticky top-0 self-start">
        <Globe />
      </div>
      <div className="flex-1 h-full flex gap-4 py-10">
        <div className="flex-1 flex flex-col gap-4">
          <Polaroid />
          <Polaroid />
          <Polaroid />
        </div>
        <div className="flex-1 flex flex-col gap-4">
          <Polaroid />
          <Polaroid />
          <Polaroid />
          <Polaroid />
        </div>
      </div>
    </div>
  );
};
