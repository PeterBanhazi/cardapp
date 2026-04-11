import OptionsRightContainer from './OptionsRightContainer';
import OptionsDnDCardWrapper from './OptionsDnDCardWrapper';
import { useOptionsDataTransformer } from './useOptionsDataTransformer';

function Options() {
    const {
        userName,
        currentPlayer,
        currentCardId,
        filteredPlayers,
        isOnline,
        rankPoints,
        isPending,
        isError,
        error,
    } = useOptionsDataTransformer();

    if (isPending) {
        return <span>Loading...</span>;
    }

    if (isError) {
        return <span>Error: {error!.message}</span>;
    }
    if (!currentPlayer || !userName)
        return <span>Error: Something went wrong!</span>;

    return (
        <div className="p-3">
            <div className="flex flex-row justify-evenly min-w-max w-full h-[604px] ">
                <OptionsDnDCardWrapper
                    userName={userName}
                    playerCards={filteredPlayers}
                    currentCardId={currentCardId}
                    currentPlayer={currentPlayer}
                    isOnline={isOnline}
                    rankPoints={rankPoints}
                ></OptionsDnDCardWrapper>
            </div>
        </div>
    );
}

export default Options;
