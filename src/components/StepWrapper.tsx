import React, { ReactNode } from 'react';

export default function StepWrapper({ children }: { children: ReactNode }) {
  return (
    <li className="md:flex-1">
      <div className="flex flex-col space-y-2 border-l-4 border-zinc-300 py-4 pl-4 md:border-l-0 md:border-t-2 md:pb-0 md:pl-0 md:pt-4">
        {children}
      </div>
    </li>
  );
}
