import { useState } from 'react';

export function useUserId() {
  const [userId, setUserIdState] = useState(() =>
    sessionStorage.getItem('series_rec_user_id') ?? null
  );

  function setUserId(id) {
    if (id) {
      sessionStorage.setItem('series_rec_user_id', id);
    } else {
      sessionStorage.removeItem('series_rec_user_id');
    }
    setUserIdState(id);
  }

  return [userId, setUserId];
}
