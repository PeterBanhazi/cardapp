import { Friendship } from '../utils/types';

const OptionsRightContainer: React.FC<{
    friendships: Friendship[];
}> = ({ friendships }) => {
    return (
        <div className="w-full h-full p-1 border overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Friendships</h3>
            <div className="pb-3">
                <form action="/action_page.php" id="inviteform" className="">
                    <input
                        type="text"
                        name="inviteform"
                        placeholder="Invite friend"
                        className="w-[138px]"
                    />
                    <input type="submit" value="Send Request" />
                </form>
            </div>
            {friendships.map((friend) => (
                <div
                    key={friend.friend_username}
                    className={`flex items-center flex-column text-sm font-semibold mb-2 pb-2 border-b ${
                        friend.status === `PENDING`
                            ? 'bg-yellow-500'
                            : friend.status === 'ACCEPTED'
                            ? 'bg-green-500'
                            : 'bg-red-500'
                    }`}
                >
                    <div>
                        <span>{friend.friend_username}</span>
                        {friend.status === `PENDING` ? (
                            <div> Accept Reject:</div>
                        ) : (
                            <div>Chat Play Del Info</div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default OptionsRightContainer;
