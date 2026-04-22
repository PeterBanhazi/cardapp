import ChatLayout from '../features/lobbychat/components/chat/ChatLayout';
import Cookies from 'js-cookie';

const ChatLobby = () => {
    const layout = Cookies.get('react-resizable-panels:layout');
    const defaultLayout = layout ? JSON.parse(layout) : undefined;

    return (
        <div className="max-w-full w-full h-[500px]">
            <div className="h-full">
                <ChatLayout defaultLayout={defaultLayout} />
            </div>
        </div>
    );
};

export default ChatLobby;
