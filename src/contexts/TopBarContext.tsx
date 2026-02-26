import { createContext, useContext, useState } from "react";

interface TopBarContextValue {
  backAction: { fn: () => void } | null;
  setBackAction: (fn: (() => void) | undefined) => void;
}

const TopBarContext = createContext<TopBarContextValue>({
  backAction: null,
  setBackAction: () => {},
});

export function TopBarProvider({ children }: { children: React.ReactNode }) {
  const [backAction, setBackActionState] = useState<{ fn: () => void } | null>(null);

  const setBackAction = (fn: (() => void) | undefined) => {
    setBackActionState(fn ? { fn } : null);
  };

  return (
    <TopBarContext.Provider value={{ backAction, setBackAction }}>
      {children}
    </TopBarContext.Provider>
  );
}

export const useTopBar = () => useContext(TopBarContext);
