// # TODO: use import { createTheme } from "flowbite-react";

import React from 'react';
import {
    Mail,
    Globe,
    Home,
    Users,
    Trophy,
    Settings,
    Book,
    Facebook,
    Twitter,
    Instagram,
    Linkedin,
    Github,
} from 'lucide-react';
import { useLocation } from 'react-router-dom';

const BottomFooter = () => {
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // Handle newsletter subscription
    };

    const currentYear = new Date().getFullYear();

    const location = useLocation();
    const isAtHome: boolean = location.pathname === '/';

    return (
        <div className="container mx-auto px-4">
            <footer
                className={`${isAtHome ? 'bg-white/95' : 'bg-stone-200/30 '} text-black container  rounded-b-lg mb-6 border border-slate-200/40 px-2 mx-auto`}
            >
                <div className="container mx-auto px-4 py-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {/* Play Column */}
                        <div>
                            <h2 className="text-2xl font-bold mb-2">
                                Game set...
                            </h2>
                            <p className="text-gray-900">
                                Step onto the virtual court and experience
                                tennis like never before! Join our growing
                                community of players, compete in exciting
                                matches, and climb the ranks to become a tennis
                                legend.
                            </p>
                        </div>

                        {/* Company Info Column */}
                        <div>
                            <h3 className="text-xl font-semibold mb-2">
                                Made By
                            </h3>
                            <p className="text-gray-900 mb-2">
                                TechServe Solutions - Crafting innovative
                                digital experiences since 2020. We're passionate
                                about bringing sports and technology together.
                            </p>
                            <div className="flex items-center gap-2 text-gray-900 mb-0">
                                <Mail size={16} />
                                <span>contact@techserve.com</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-900">
                                <Globe size={16} />
                                <a
                                    href="#"
                                    className="hover:text-blue-600 transition-colors"
                                >
                                    www.techserve.com
                                </a>
                            </div>
                        </div>

                        {/* Links Column */}
                        <div className="flex justify-evenly">
                            <div className="">
                                <h3 className="text-xl font-semibold mb-2">
                                    Links
                                </h3>
                                <nav>
                                    <ul className="space-y-0">
                                        <li>
                                            <a
                                                href="#"
                                                className="flex items-center gap-2 text-gray-900 hover:text-gray-700 transition-colors"
                                            >
                                                <Home size={16} /> Home
                                            </a>
                                        </li>
                                        <li>
                                            <a
                                                href="#"
                                                className="flex items-center gap-2 text-gray-900 hover:text-gray-700 transition-colors"
                                            >
                                                <Users size={16} /> Lobby
                                            </a>
                                        </li>
                                        <li>
                                            <a
                                                href="#"
                                                className="flex items-center gap-2 text-gray-900 hover:text-gray-700 transition-colors"
                                            >
                                                <Trophy size={16} /> Ranks
                                            </a>
                                        </li>
                                        <li>
                                            <a
                                                href="#"
                                                className="flex items-center gap-2 text-gray-900 hover:text-gray-700 transition-colors"
                                            >
                                                <Settings size={16} /> Options
                                            </a>
                                        </li>
                                        <li>
                                            <a
                                                href="#"
                                                className="flex items-center gap-2 text-gray-900 hover:text-gray-700 transition-colors"
                                            >
                                                <Book size={16} /> Rules
                                            </a>
                                        </li>
                                    </ul>
                                </nav>
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold mb-2">
                                    Legal
                                </h3>
                                <ul className="space-y-1">
                                    <li>
                                        {' '}
                                        <a
                                            href="#"
                                            className="flex items-center gap-2 text-gray-900 hover:text-gray-700 transition-colors"
                                        >
                                            Terms of Service
                                        </a>
                                    </li>
                                    <li>
                                        {' '}
                                        <a
                                            href="#"
                                            className="flex items-center gap-2 text-gray-900 hover:text-gray-700 transition-colors"
                                        >
                                            Privacy Policy
                                        </a>
                                    </li>
                                    <li>
                                        {' '}
                                        <a
                                            href="#"
                                            className="flex items-center gap-2 text-gray-900 hover:text-gray-700 transition-colors"
                                        >
                                            Cookie Policy
                                        </a>
                                    </li>
                                    <li></li>
                                </ul>
                            </div>
                        </div>
                        {/* Newsletter Column */}
                        <div className="md:max-w-11/12 max-w-64 flex-col justify-self-center">
                            <h3 className="text-xl font-semibold text-center lg:text-left mb-2">
                                Newsletter
                            </h3>
                            <form onSubmit={handleSubmit} className="mb-3">
                                <div className="flex flex-col gap-2">
                                    <input
                                        type="email"
                                        placeholder="Enter your email"
                                        className="px-4 py-2 font-medium bg-white text-black border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                    />
                                    <button
                                        type="submit"
                                        className="px-4 py-2 font-medium bg-orange-400 text-slate-100 rounded-lg hover:bg-orange-300 transition-colors"
                                    >
                                        Subscribe
                                    </button>
                                </div>
                            </form>

                            <div className="flex justify-between px-8">
                                <a
                                    href="#"
                                    className="text-gray-900 hover:text-black transition-colors"
                                >
                                    <Facebook size={20} />
                                </a>
                                <a
                                    href="#"
                                    className="text-gray-900 hover:text-black transition-colors"
                                >
                                    <Twitter size={20} />
                                </a>
                                <a
                                    href="#"
                                    className="text-gray-900 hover:text-black transition-colors"
                                >
                                    <Instagram size={20} />
                                </a>
                                <a
                                    href="#"
                                    className="text-gray-900 hover:text-black transition-colors"
                                >
                                    <Linkedin size={20} />
                                </a>
                                <a
                                    href="#"
                                    className="text-gray-900 hover:text-black transition-colors"
                                >
                                    <Github size={20} />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Copyright Bar */}
                <div className="border-t border-gray-200 w-86 mx-auto">
                    <div className="container mx-auto py-1">
                        <div className="text-center text-gray-900 text-sm">
                            © {currentYear} TechServe Solutions. All Rights
                            Reserved.
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default BottomFooter;
