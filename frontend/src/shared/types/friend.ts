export interface Friend {
  user: string;
  status: 'online' | 'offline' | 'pending' | 'active' | 'rejected' | 'cancelled' |'closed';
}