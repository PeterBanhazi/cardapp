import { Avatar, AvatarImage } from '../ui/avatar';
import { Info, X } from 'lucide-react';
import PreferencesTab from '../PreferencesTab';
import { useChatStore } from '../../../../store/useChatStore';
import { useSelectedUser } from '../../store/useSelectedUser';
import { RequestButton } from '../../../../pages/wsFriendStatus/wsFriendStatus';

const ChatTopBar = () => {
    const { selectedUser, setSelectedUser } = useSelectedUser();
    const { activeChatUser, setActiveChatUser } = useChatStore();
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
                    {selectedUser?.user}
                </span>
                {/* <span className="font-medium">{activeChatUser}</span> */}
            </div>
            {selectedUser && (
                <span className="w-full flex justify-start gap-2 m-2 h-6 bg-red-300">
                    <RequestButton
                        friendUser={selectedUser.user}
                        status={selectedUser.status}
                    />
                    <RequestButton
                        friendUser={selectedUser?.user}
                        status={selectedUser.status}
                    />
                </span>
            )}
            <div className="flex gap-2">
                <PreferencesTab />
                <Info className="text-muted-foreground cursor-pointer hover:text-primary" />
                <X
                    className="text-muted-foreground cursor-pointer hover:text-primary"
                    onClick={() => setActiveChatUser(null)}
                />
            </div>
        </div>
    );
};

export default ChatTopBar;
