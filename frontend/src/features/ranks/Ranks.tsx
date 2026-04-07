import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../core/store/useAuthStore';
import { Button } from 'flowbite-react';
import { useGetUsersRanks } from './useGetUsersRanks';

import ScrollContainer from '../../shared/components/ui/ScrollContainer';
import { UsernameWrapper } from '@/shared/components/ui/UsernameWrapper';

const Ranks: React.FC = () => {
    const [currentPage, setCurrentPage] = useState<number>(0);
    const [itemsPerPage] = useState<number>(12);
    const [totalPages, setTotalPages] = useState<number>(0);

    const { isLoading, error, data } = useGetUsersRanks();
    const loggedInUsername = useAuthStore((s) => s.user?.username);

    useEffect(() => {
        if (data) {
            const getUserPageIndex = Math.floor(
                data.findIndex((user) => user.username === loggedInUsername) /
                    itemsPerPage
            );
            if (getUserPageIndex > -1) {
                setCurrentPage(getUserPageIndex);
            }
            setTotalPages(Math.ceil(data.length / itemsPerPage));
        }
    }, [data]);

    const handleNextPage = () => {
        if (currentPage < totalPages - 1) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 0) {
            setCurrentPage(currentPage - 1);
        }
    };
    const currentItems = (data ?? []).slice(
        currentPage * itemsPerPage,
        (currentPage + 1) * itemsPerPage
    );
    return (
        <>
            {isLoading ? (
                <div className="text-center">Loading...</div>
            ) : (
                <>
                    <div className="p-3">
                        <div className="w-full flex items-center">
                            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-6 gap-4 mx-auto">
                                {currentItems.map((user, index) => (
                                    <ScrollContainer
                                        key={user.username}
                                        className={`text-center max-h-17 w-[200px] overflow-hidden ${
                                            user.username === loggedInUsername
                                                ? 'bg-red-500'
                                                : ''
                                        }`}
                                        headertext={
                                            <div className="flex justify-between mb-0.5">
                                                <div className="min-w-8 pb-0.5  mt-0.5 bg-amber-300/60 rounded-b-full">
                                                    {index +
                                                        1 +
                                                        currentPage *
                                                            itemsPerPage}
                                                </div>
                                                <div className="bg-neutral-300/60 h-5 min-w-10  rounded-b-md ring-1 font-bold text-slate-600 ring-blue-200 px-3">
                                                    <div className="relative -top-0.5">
                                                        {user.rankpoints}
                                                    </div>
                                                </div>
                                                <div className="min-w-8"></div>
                                            </div>
                                        }
                                    >
                                        <p className="text-lg font-bold flex justify-center mt-0.5 text-slate-800">
                                            <UsernameWrapper
                                                username={user.username}
                                                options={{
                                                    maxWidth: 186,
                                                    tooltipIsActive: true,
                                                    tooltipTheme: 'light',
                                                    isClickable: false,
                                                }}
                                            />
                                        </p>
                                    </ScrollContainer>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-between items-center mt-4 mx-6">
                            <Button
                                onClick={handlePrevPage}
                                disabled={currentPage === 0}
                                color="cardAppPrimary"
                                className="ring-1 ring-slate-300"
                            >
                                Previous
                            </Button>
                            <span className="font-semibold text-slate-700">
                                Page {currentPage + 1} of {totalPages}
                            </span>
                            <Button
                                onClick={handleNextPage}
                                disabled={currentPage === totalPages - 1}
                                color="cardAppPrimary"
                                className="ring-1 ring-slate-300"
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                </>
            )}
        </>
    );
};

export default Ranks;
