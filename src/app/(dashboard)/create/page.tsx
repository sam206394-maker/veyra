import { Suspense } from "react";
import CreateContent from "./CreateContent";

export default function CreatePage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col gap-6">
          <div className="skeleton h-10 w-48 rounded-lg" />
          <div className="skeleton h-64 rounded-xl" />
        </div>
      }
    >
      <CreateContent />
    </Suspense>
  );
}
