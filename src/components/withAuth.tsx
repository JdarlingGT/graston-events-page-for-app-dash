import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { hasPermission, ROLES } from '@/lib/permissions';

interface WithAuthProps {
  requiredPermission: string;
  children: React.ReactNode;
}

const WithAuth: React.FC<WithAuthProps> = ({ requiredPermission, children }) => {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Simulate fetching user role from authentication context
    const userRole = ROLES.USER; // Replace with actual user role fetching logic

    if (hasPermission(userRole, requiredPermission)) {
      setIsAuthorized(true);
    } else {
      setIsAuthorized(false);
      router.push('/unauthorized');
    }
  }, [requiredPermission, router]);

  if (isAuthorized === null) {
    return <div>Loading...</div>;
  }

  if (!isAuthorized) {
    return <div>Unauthorized access</div>;
  }

  return <>{children}</>;
};

export default WithAuth;