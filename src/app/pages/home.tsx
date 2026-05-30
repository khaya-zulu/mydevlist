import { Globe } from "@/app/components/globe";
import { DevList } from "@/app/features/dev-list";

export const Home = () => {
  return (
    <div className="min-h-screen flex items-start justify-between pl-12 sm:pl-24 pr-12 max-w-400 gap-10 mx-auto">
      <div className="sticky top-0 self-start">
        <Globe />
      </div>
      <DevList />
    </div>
  );
};
