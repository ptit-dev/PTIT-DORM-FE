export interface User {
  user_id: string;
  username: string;
  display_name?: string;
  avatar?: string;
  email?: string;
  roles?: string[];
  // Add other user properties as needed
}
