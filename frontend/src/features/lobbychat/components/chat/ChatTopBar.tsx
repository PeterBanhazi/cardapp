import { Avatar, AvatarImage } from '../ui/avatar';
import { Info, X } from 'lucide-react';
import PreferencesTab from '../PreferencesTab';
import { useChatStore } from '../../../../core/store/useChatStore';
import { useSelectedUser } from '../../store/useSelectedUser';
import { useFriendsStore } from '@/core/store/useFriendsStore';
import { ChatActionButton } from './ChatActionButton';
import { useAuthStore } from '@/core/store/useAuthStore';

const ChatTopBar = () => {
    const selectedUser = useSelectedUser((state) => state.selectedUser);

    const { sendClosedChat } = useFriendsStore();
    const { activeChatUser, setActiveChatUser, closeChat } = useChatStore();
    const loggedInUsername =
        useAuthStore((state) => state.user?.username) ?? '';
    const { sendAction } = useFriendsStore();
    return (
        <div className="w-full h-20 flex p-4 justify-between items-center border-b">
            <div className="flex items-center gap-2">
                {activeChatUser && (
                    <Avatar className="flex justify-center items-center">
                        <AvatarImage
                            src={'/user-placeholder.png'}
                            alt="User Image"
                            className="w-10 h-10 object-cover rounded-full"
                        />
                    </Avatar>
                )}
                <span className="font-medium text-2xl">
                    {selectedUser?.user}{' '}
                </span>
                {/* <span className="font-medium">{activeChatUser}</span> */}
            </div>
            {selectedUser && (
                <span className="w-full flex justify-start gap-2 m-2 h-6 bg-red-300">
                    <ChatActionButton
                        friendUsername={selectedUser.user}
                        localUser={loggedInUsername}
                        sendAction={sendAction}
                    />
                </span>
            )}
            <div className="flex gap-2">
                <PreferencesTab />
                <Info className="text-muted-foreground cursor-pointer hover:text-primary" />
                {selectedUser && (
                    <X
                        className="text-muted-foreground cursor-pointer hover:text-primary"
                        onClick={() => {
                            (setActiveChatUser(null),
                                sendClosedChat(selectedUser.user),
                                closeChat(selectedUser.user));
                        }}
                    />
                )}
            </div>
        </div>
    );
};

export default ChatTopBar;
