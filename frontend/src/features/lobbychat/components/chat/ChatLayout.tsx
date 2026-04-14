import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import Sidebar from '../SideBar';
import MessageContainer from './MessageContainer';
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from '../ui/resizable';

import { useChatStore } from '@/core/store/useChatStore';

interface ChatLayoutProps {
    defaultLayout: number[] | undefined;
}

const ChatLayout = ({ defaultLayout = [320, 480] }: ChatLayoutProps) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const { activeChatUser } = useChatStore();

    useEffect(() => {
        const checkScreenWidth = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        // Initial check
        checkScreenWidth();

        // Event listener for screen width changes
        window.addEventListener('resize', checkScreenWidth);

        // Cleanup the event listener on component unmount
        return () => {
            window.removeEventListener('resize', checkScreenWidth);
        };
    }, []);

    return (
        <>
            {/* <FriendsList /> */}
            <ResizablePanelGroup
                direction="horizontal"
                className="h-full items-stretch bg-slate-200/20 rounded-md rounded-t-none  shadow-md"
                onLayout={(sizes: number[]) => {
                    document.cookie = `react-resizable-panels:layout=${JSON.stringify(
                        sizes
                    )}`;
                }}
            >
                <ResizablePanel
                    defaultSize={defaultLayout[0]}
                    collapsedSize={10}
                    collapsible={true}
                    minSize={isMobile ? 10 : 12}
                    maxSize={isMobile ? 18 : 20}
                    onCollapse={() => {
                        setIsCollapsed(true);
                        document.cookie = `react-resizable-panels:collapsed=true;`;
                    }}
                    onExpand={() => {
                        setIsCollapsed(false);
                        document.cookie = `react-resizable-panels:collapsed=false;`;
                    }}
                    className={cn(
                        isCollapsed &&
                            'min-w-[92px] transition-all duration-300 ease-in-out'
                    )}
                >
                    <Sidebar isCollapsed={isCollapsed} />
                </ResizablePanel>

                <ResizableHandle withHandle />

                <ResizablePanel defaultSize={defaultLayout[1]} minSize={30}>
                    <MessageContainer />

                    {!activeChatUser && (
                        <div className="flex justify-center items-center h-full w-full px-10">
                            <div className="flex flex-col justify-center items-center gap-4">
                                <img
                                    src={'/user-placeholder.png'}
                                    alt="Logo"
                                    className="w-full md:w-2/3 lg:w-1/2"
                                />
                                <p className="text-muted-foreground text-center">
                                    Click on a chat to view the messages
                                </p>
                            </div>
                        </div>
                    )}
                    {activeChatUser && <MessageContainer />}
                </ResizablePanel>
            </ResizablePanelGroup>
        </>
    );
};

export default ChatLayout;
