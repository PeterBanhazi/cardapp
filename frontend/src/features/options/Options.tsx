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
        data,
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
        <div className="flex justify-evenly w-full h-[600px] ">
            <OptionsDnDCardWrapper
                userName={userName}
                playerCards={filteredPlayers}
                currentCardId={currentCardId}
                currentPlayer={currentPlayer}
                isOnline={isOnline}
                rankPoints={rankPoints}
            ></OptionsDnDCardWrapper>

            <div className="w-[150px] h-[592px] pt-1">
                <OptionsRightContainer />
            </div>
        </div>
    );
}

export default Options;
