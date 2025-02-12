import { Friendship } from '../utils/types';
import { Button, Dropdown, Label, TextInput } from 'flowbite-react';
import ThreeDButton from './ui/ThreeDButton';
import FriendListItem from './ui/FriendListItem';

const OptionsRightContainer: React.FC<{
    friendships: Friendship[];
}> = ({ friendships }) => {
    return (
        <div className="w-full h-full p-1 border overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Friendships</h3>
            <div className="flex max-w-xs flex-col mb-2">
                <form>
                    <div className="">
                        <TextInput
                            type="text"
                            id="inviteform"
                            placeholder="Invite Friend"
                            required
                            color="gray"
                            maxLength={20}
                        />
                    </div>
                    <Button
                        type="submit"
                        value=""
                        color="blue"
                        className="mt-2 flex justify-self-center"
                        pill
                        size="xs"
                    >
                        Send Request
                    </Button>
                </form>
            </div>
            {friendships.map((elem) => (
                <div className="pb-1">
                    <FriendListItem
                        key={elem.friend_username}
                        friendship={elem}
                    />
                </div>
            ))}
        </div>
    );
};

export default OptionsRightContainer;
