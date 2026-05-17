import React, { createContext, useContext, useState, useCallback } from 'react';

const LiveStreamContext = createContext(null);

export function LiveStreamProvider({ children }) {
  const [teacherLive, setTeacherLive] = useState(null);
  const [studentStream, setStudentStream] = useState(null);
  const [studentDevConf, setStudentDevConf] = useState(null);

  const startTeacherStream = useCallback((data) => setTeacherLive(data), []);
  const endTeacherStream = useCallback(() => setTeacherLive(null), []);

  const joinStudentStream = useCallback((stream, conf) => {
    setStudentStream(stream);
    setStudentDevConf(conf);
  }, []);

  const leaveStudentStream = useCallback(() => {
    setStudentStream(null);
    setStudentDevConf(null);
  }, []);

  return (
    <LiveStreamContext.Provider value={{
      teacherLive, startTeacherStream, endTeacherStream,
      studentStream, studentDevConf, joinStudentStream, leaveStudentStream,
    }}>
      {children}
    </LiveStreamContext.Provider>
  );
}

export const useLiveStream = () => useContext(LiveStreamContext);
