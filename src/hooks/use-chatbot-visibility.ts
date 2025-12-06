import { useAuth } from './use-auth';

export const useChatbotVisibility = () => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return true; 
  }

  if (user?.roles?.includes('student') || user?.roles?.includes('guest')) {
    return true; 
  }
  
  if (user?.roles?.includes('admin') || user?.roles?.includes('manager')) {
    return false;
  }
  return false;
};