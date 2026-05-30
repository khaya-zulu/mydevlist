import { Globe } from "@/app/components/globe";
import { DevList } from "@/app/features/dev-list";

export const Home = () => {
  return (
    <div className="min-h-screen flex items-center justify-between pl-12 sm:pl-24 pr-12 max-w-400 gap-10 mx-auto">
      <div className="relative">
        <Globe />

        <div className="absolute left-0 top-0 w-full h-full flex flex-col items-center justify-center z-50">
          <h1 className="font-instrument text-4xl bg-white px-4 py-2">
            My Dev List
          </h1>
          <div className="bg-cyan-600 text-white p-1">
            283 Devs ❋ <u>Subscribe</u>
          </div>
        </div>
      </div>
      <DevList />
    </div>
  );
};
