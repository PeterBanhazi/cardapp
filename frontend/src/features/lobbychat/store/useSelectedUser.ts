import { create } from "zustand";
import { FriendDisplayUser } from "@/shared/types/friendTypes";


type SelectedUserState = {
	selectedUser: FriendDisplayUser | null;
	setSelectedUser: (user: FriendDisplayUser | null) => void;
};

export const useSelectedUser = create<SelectedUserState>((set) => ({
	selectedUser: null,
	setSelectedUser: (user: FriendDisplayUser | null) => set({ selectedUser: user }),
}));
