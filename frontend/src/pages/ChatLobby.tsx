import ChatLayout from '../features/lobbychat/components/chat/ChatLayout';
import Cookies from 'js-cookie';

const ChatLobby = () => {
    const layout = Cookies.get('react-resizable-panels:layout');
    const defaultLayout = layout ? JSON.parse(layout) : undefined;

    return (
        <div className="z-10 rounded-lg max-w-full w-full h-full text-sm lg:flex-row">
            <div className="h-full ">
                <ChatLayout defaultLayout={defaultLayout} />
            </div>
        </div>
    );
};

export default ChatLobby;
