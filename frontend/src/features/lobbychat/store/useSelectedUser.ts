import { User } from "../db/dummy";
import { create } from "zustand";

interface Friend {
    user: string;
    status: 'online' | 'offline' | 'request' | 'closed' | 'accepted';
} 

type SelectedUserState = {
	selectedUser: Friend | null;
	setSelectedUser: (user: Friend | null) => void;
};

export const useSelectedUser = create<SelectedUserState>((set) => ({
	selectedUser: null,
	setSelectedUser: (user: Friend | null) => set({ selectedUser: user }),
}));
