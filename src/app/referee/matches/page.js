'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const RefereeMatchesPage = () => {
  const router = useRouter();

  useEffect(() => {
    router.push('/referee');
  }, [router]);

  return null;
};

export default RefereeMatchesPage;