import { useState } from 'react';

export function useUserId() {
  const [userId] = useState(() => {
    let id = localStorage.getItem('series_rec_user_id');
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem('series_rec_user_id', id);
    }
    return id;
  });
  return userId;
}
