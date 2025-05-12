import { Friendship } from '../../utils/types';
import FriendListItem from '../../components/ui/FriendListItem';
import InviteInput from '../../components/ui/InviteInput';
import ScrollContainer from '../../components/ui/ScrollContainer';

const OptionsRightContainer: React.FC<{
    friendships: Friendship[];
}> = ({ friendships }) => {
    const priority = { PENDING: 1, ACCEPTED: 2, BLOCKED: 3 };

    friendships.sort((a, b) => priority[a.status] - priority[b.status]);

    let testContent = [];
    for (let i = 4; i < 12; i++) {
        testContent.push(friendships[i]);
    }

    return (
        <div className="w-full h-full flex flex-col justify-between ">
            <ScrollContainer
                headertext={<div>Friendships</div>}
                className="h-[316px]"
            >
                <div className="mt-0.5">
                    {friendships.length > 0 &&
                        friendships.map((elem, index) => (
                            <div className="py-0.5 pl-1 pr-1">
                                <FriendListItem key={index} friendship={elem} />
                            </div>
                        ))}
                </div>
            </ScrollContainer>
            <div className="">
                <InviteInput />
            </div>
            <ScrollContainer
                headertext={<div>History</div>}
                className="h-[212px]"
            >
                {testContent.length > 10 &&
                    testContent.map((elem, index) => (
                        <div className="py-0.5 pl-0.5">
                            <FriendListItem key={index} friendship={elem} />
                        </div>
                    ))}
            </ScrollContainer>
        </div>
    );
};

export default OptionsRightContainer;
