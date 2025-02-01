import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import Home from '../views/home';
import { useDashboardStore, DashboardItem } from '../store/store';

const Navbar: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();
    const [dimensions, setDimensions] = useState({ left: 0, width: 0 });
    const [hoveredDimensions, setHoveredDimensions] = useState<{
        left: number;
        width: number;
    } | null>(null);
    const navRef = useRef<HTMLDivElement>(null);

    const { addDashboard } = useDashboardStore();

    const handleTestClick = () => {
        addDashboard({
            id: 'TestOne', // or use uuid() if you want multiple instances
            path: '/testone',
            title: 'TestEgyes',
        });
    };

    const handleTestTwoClick = () => {
        addDashboard({
            id: 'TestTwo', // or use uuid() if you want multiple instances
            path: '/testtwo',
            title: 'TestKettes',
        });
    };

    const handleDashboardClick = (
        link: Omit<DashboardItem, 'isCollapsed' | 'key'>
    ) => {
        addDashboard({
            id: link.id, // or use uuid() if you want multiple instances
            path: link.path,
            title: link.title,
        });
    };
    const navLinks = [
        { path: '/', label: 'Home', id: 'home', title: 'Welcome' },
        { path: '/lobby', label: 'Lobby', id: 'lobby', title: 'Lobby' },
        { path: '/ranks', label: 'Ranks', id: 'rank', title: 'Ranks' },
        // { path: '/players', label: 'Players', id: 'players', title: 'Players' },
        {
            path: '/userproperties',
            label: 'Options',
            id: 'options',
            title: 'Options',
        },
        {
            path: '/rules',
            label: 'Rules',
            id: 'rules',
            title: 'Game Rules',
        },
    ];

    const updateNavbarHover = () => {
        const activeLink = navRef.current?.querySelector('.active');
        if (activeLink) {
            const navRect = navRef.current?.getBoundingClientRect();
            const linkRect = activeLink.getBoundingClientRect();
            setDimensions({
                left: linkRect.left - (navRect?.left || 0),
                width: linkRect.width,
            });
        }
    };
    useEffect(() => {
        updateNavbarHover();
    }, [location.pathname]);

    // fix for hovered background if needed:

    // useEffect(() => {
    //     const handleResize = () => {
    //         updateNavbarHover();
    //     };

    //     window.addEventListener('resize', handleResize);

    //     // Initial calculation
    //     updateNavbarHover();

    //     // Cleanup
    //     return () => {
    //         window.removeEventListener('resize', handleResize);
    //     };
    // }, []);

    const handleMouseEnter = (event: React.MouseEvent<HTMLAnchorElement>) => {
        const linkRect = event.currentTarget.getBoundingClientRect();
        const navRect = navRef.current?.getBoundingClientRect();
        setHoveredDimensions({
            left: linkRect.left - (navRect?.left || 0),
            width: linkRect.width,
        });
    };

    const handleNavMouseLeave = () => {
        setHoveredDimensions(null);
    };

    return (
        <div className="container p-4 mx-auto">
            <nav className="top-8 bg-white bg-opacity-70 backdrop-blur-md border border-white border-opacity-40 rounded-t-lg shadow-lg w-full">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-3 justify-between items-center h-16">
                        {/* Logo/Brand */}
                        <div className="flex-shrink-0 w-32">
                            <NavLink
                                to="/"
                                className="text-xl font-bold text-gray-800"
                            >
                                Logo
                            </NavLink>
                            {/* Your other nav items
                                                        <NavLink to="/testone" onClick={handleTestClick}>
                                TestOne
                            </NavLink> */}
                        </div>

                        {/* Desktop Navigation - Centered */}
                        <div className="hidden md:flex md:flex-1 md:justify-center md:items-center">
                            <div
                                ref={navRef}
                                className="relative flex items-center px-2"
                                onMouseLeave={handleNavMouseLeave}
                            >
                                {/* Sliding Background */}
                                <div
                                    className="absolute h-8 rounded-md bg-blue-100 bg-opacity-80 transition-all duration-300 ease-out"
                                    style={{
                                        left:
                                            (hoveredDimensions?.left ??
                                                dimensions.left) + 'px',
                                        width:
                                            (hoveredDimensions?.width ??
                                                dimensions.width) + 'px',
                                    }}
                                />

                                {/* Navigation Links */}
                                {navLinks.map((link) => (
                                    <NavLink
                                        key={link.path}
                                        to={link.path}
                                        className={({ isActive }) =>
                                            `px-1 py-2 mx-1 lg:px-1 lg:mx-1 text-md font-semibold relative z-10 transition-colors duration-200 
                      ${
                          isActive
                              ? 'text-blue-700 active'
                              : 'text-gray-600 hover:text-blue-700'
                      }`
                                        }
                                        onMouseEnter={handleMouseEnter}
                                        onClick={() => {
                                            handleDashboardClick(link);
                                        }}
                                    >
                                        {link.label}
                                    </NavLink>
                                ))}
                            </div>
                        </div>

                        {/* Login Button - Right aligned */}
                        {/* <div className="hidden md:block w-32 text-right">
                            <button className="bg-blue-600 bg-opacity-90 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
                                Log In
                            </button>
                        </div>

                        replaced by home view */}
                        <div className="hidden md:flex justify-end">
                            <Home />
                        </div>
                        {/* Mobile menu button */}
                        <div className="md:hidden flex items-center"></div>
                        <div className="md:hidden flex items-center justify-end">
                            <button
                                onClick={() => setIsOpen(!isOpen)}
                                className="text-gray-600 hover:text-gray-900 focus:outline-none"
                            >
                                {isOpen ? (
                                    <X className="h-6 w-6" />
                                ) : (
                                    <Menu className="h-6 w-6" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Mobile Navigation */}
                    {isOpen && (
                        <div className="md:hidden">
                            <div className="px-2 pt-2 pb-3 space-y-1">
                                {navLinks.map((link) => (
                                    <NavLink
                                        key={link.path}
                                        to={link.path}
                                        className={({ isActive }) =>
                                            `block px-3 py-2 rounded-md text-base font-medium
                      ${
                          isActive
                              ? 'bg-blue-100 text-blue-700'
                              : 'text-gray-600 hover:bg-blue-50'
                      }`
                                        }
                                        onClick={() => {
                                            setIsOpen(false);
                                            handleDashboardClick(link);
                                        }}
                                    >
                                        {link.label}
                                    </NavLink>
                                ))}
                                {/* <button className="w-full mt-2 bg-blue-600 bg-opacity-90 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
                                    Log In
                                </button> */}

                                <div className="w-min mx-auto mt-2">
                                    <Home />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </nav>
        </div>
    );
};

export default Navbar;
