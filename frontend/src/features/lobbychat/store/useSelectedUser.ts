import { create } from "zustand";
import {Friend} from "@/shared/types/friend"


type SelectedUserState = {
	selectedUser: Friend | null;
	setSelectedUser: (user: Friend | null) => void;
};

export const useSelectedUser = create<SelectedUserState>((set) => ({
	selectedUser: null,
	setSelectedUser: (user: Friend | null) => set({ selectedUser: user }),
}));
