import { Friendship } from '../utils/types';
import FriendListItem from './ui/FriendListItem';
import InviteInput from './ui/InviteInput';
import ScrollContainer from './ui/ScrollContainer';

const OptionsRightContainer: React.FC<{
    friendships: Friendship[];
}> = ({ friendships }) => {
    const priority = { PENDING: 1, ACCEPTED: 2, BLOCKED: 3 };
    friendships = friendships.concat(friendships).concat(friendships);
    friendships.sort((a, b) => priority[a.status] - priority[b.status]);

    let testContent = [];
    for (let i = 4; i < 12; i++) {
        testContent.push(friendships[i]);
    }

    console.log(friendships);
    console.log(testContent);
    return (
        <div className="w-full h-full flex flex-col justify-between ">
            <ScrollContainer headertext="Friendships" className="h-[316px]">
                {friendships.length > 0 &&
                    friendships.map((elem, index) => (
                        <div className="py-0.5 pl-0.5">
                            <FriendListItem key={index} friendship={elem} />
                        </div>
                    ))}
            </ScrollContainer>
            <div className="">
                <InviteInput />
            </div>
            <ScrollContainer headertext="History" className="h-[212px]">
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
