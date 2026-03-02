import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext();

export const useApp = () => useContext(AppContext);

export function AppProvider({ children }) {
  const [user] = useState({
    name: 'Arjun Sharma',
    email: 'arjun@example.com',
    avatar: 'AS',
    goal: 'Muscle Gain',
    weight: 75,
    height: 178,
    memberSince: 'Jan 2024',
    plan: 'Pro',
  });

  const [crowdLevel] = useState(62);
  const [notifications] = useState(4);

  return (
    <AppContext.Provider value={{ user, crowdLevel, notifications }}>
      {children}
    </AppContext.Provider>
  );
}
