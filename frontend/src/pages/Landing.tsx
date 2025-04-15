import {
    Award,
    Bell,
    ChevronRight,
    MessageSquare,
    Search,
    Users,
} from 'lucide-react';
import React from 'react';
// ### option2 : src/assets/bg/shadow-tennis-racket-with-ball.jpg

const Landing = () => {
    return (
        <div className="container mx-auto p-4 pt-0">
            <div className="w-full mb-1 min-h-170 bg-stone-200/30 border border-slate-800/40 shadow-lg">
                {/* Hero Section */}
                <div
                    className="relative bg-cover bg-center"
                    style={{
                        backgroundImage:
                            'linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.3)), url("src/assets/bg/shadow-tennis-racket-with-ball_min.jpg")',
                    }}
                >
                    <div className="max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8 flex items-center h-full">
                        <div className="text-gray-100">
                            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-[64px] mb-6">
                                Experience the Thrill
                                <br className="hidden lg:block" />
                                <span className="text-green-500 ">
                                    of Tennis Reimagined
                                </span>
                            </h1>
                            <p className="text-lg text-green-50 md:text-xl max-w-lg mb-8">
                                Join the ultimate tennis community where skill
                                meets strategy, and competition comes alive in
                                the digital court.
                            </p>
                            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                                <button className="bg-green-600 cursor-pointer hover:bg-green-300 hover:text-green-900 hover:animate-pulse text-white font-bold py-3 px-8 rounded-lg shadow-lg transition duration-300">
                                    Join the Game
                                </button>
                                <button className="bg-transparent cursor-pointer hover:bg-green-50 hover:bg-opacity-20 hover:animate-pulse text-green-50 font-bold py-3 px-8 rounded-lg border-2 border-white hover:text-green-900 transition duration-300">
                                    Take a Tour
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Features Section */}
                <div className="py-16 bg-stone-100" id="features">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        {/* <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-12">
                            The Ultimate Tennis Experience
                        </h2> */}

                        <div className="grid md:grid-cols-2 gap-12 items-stretch">
                            <div>
                                <div className="mb-8">
                                    <h3 className="text-2xl font-bold text-teal-950 mb-3">
                                        Feel the Thrill of the Game
                                    </h3>
                                    <p className="text-gray-700 text-lg text-justify text-pretty">
                                        Experience tennis like never before with
                                        our immersive digital platform that
                                        captures the excitement and intensity of
                                        real matches. Our realistic game
                                        mechanics and stunning visuals put you
                                        right on the court, feeling every serve,
                                        volley, and match point as if you were
                                        there in person. Whether you're a casual
                                        player or aspiring pro, TennisMatch
                                        brings the authentic tennis experience
                                        to your fingertips.
                                    </p>
                                </div>

                                <div className="relative h-64 rounded-lg overflow-hidden shadow-lg mb-8">
                                    <img
                                        src="src/assets/bg/alin-gavriliuc-_Ye-KqV3BNA-unsplash_min.jpg"
                                        alt="Tennis match in action"
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                <div className="mb-8">
                                    <h3 className="text-2xl font-bold text-teal-950 mb-3">
                                        Customize Your Perfect Player
                                    </h3>
                                    <p className="text-gray-700 text-lg text-justify text-pretty">
                                        Create your ideal tennis athlete with
                                        our advanced player customization
                                        system. Fine-tune specific abilities by
                                        allocating percentage points across
                                        serve power, backhand precision,
                                        forehand strength, court movement, and
                                        mental focus. Watch your custom player
                                        evolve and improve as you compete and
                                        train, developing a unique play style
                                        that matches your strategic approach to
                                        the game.
                                    </p>
                                </div>
                            </div>

                            <div>
                                <div className="relative h-64 rounded-lg overflow-hidden shadow-lg mb-8">
                                    <img
                                        src="src/assets/bg/shep-mcallister-J1j3cImjmgE-unsplash_min.jpg"
                                        alt="Tennis app features"
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                <div className="mb-8">
                                    <h3 className="text-2xl font-bold text-teal-950 mb-3">
                                        Connect, Chat, and Compete
                                    </h3>
                                    <p className="text-gray-700 text-lg text-justify text-balance">
                                        TennisMatch isn't just a game—it's a
                                        thriving community of tennis enthusiasts
                                        from around the world. Challenge
                                        registered users to friendly matches or
                                        competitive tournaments, chat with
                                        fellow players, and invite your friends
                                        to join the action. Our robust social
                                        features make finding opponents and
                                        building your tennis network easier than
                                        ever, creating lasting connections
                                        through your shared love of the sport.
                                    </p>
                                </div>

                                <div className="bg-green-100 rounded-xl p-6">
                                    <h4 className="text-xl font-bold text-green-950 mb-4">
                                        Advanced Features
                                    </h4>
                                    <ul className="space-y-3">
                                        <li className="flex items-start">
                                            <Bell className="h-5 w-5 text-green-600 mr-2 mt-1" />
                                            <span className="text-gray-700">
                                                Instant message notifications
                                                keep conversations flowing
                                            </span>
                                        </li>
                                        <li className="flex items-start">
                                            <Users className="h-5 w-5 text-green-600 mr-2 mt-1" />
                                            <span className="text-gray-700">
                                                Real-time game request
                                                indicators for quick matchmaking
                                            </span>
                                        </li>
                                        <li className="flex items-start">
                                            <MessageSquare className="h-5 w-5 text-green-600 mr-2 mt-1" />
                                            <span className="text-gray-700">
                                                In-game chat for strategic
                                                planning and friendly banter
                                            </span>
                                        </li>
                                        <li className="flex items-start">
                                            <Award className="h-5 w-5 text-green-600 mr-2 mt-1" />
                                            <span className="text-gray-700">
                                                Global leaderboards with
                                                seasonal rankings and rewards
                                            </span>
                                        </li>
                                        <li className="flex items-start">
                                            <Search className="h-5 w-5 text-green-600 mr-2 mt-1" />
                                            <span className="text-gray-700">
                                                Advanced player matching based
                                                on skill and play style
                                            </span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CTA Section */}
                <div className="bg-green-700 py-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h2 className="text-3xl font-extrabold text-green-50 mb-6">
                            Ready to Step onto the Court?
                        </h2>
                        <p className="text-xl text-green-50 mb-8 max-w-2xl mx-auto">
                            Join thousands of players already experiencing the
                            future of tennis gaming. Your perfect match is
                            waiting.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                            <button className="bg-green-50 text-green-600 hover:bg-green-50 hover:text-green-700 font-bold py-3 px-8 rounded-lg shadow-lg transition duration-300 flex items-center justify-center hover:animate-pulse cursor-pointer">
                                Join the Game{' '}
                                <ChevronRight className="ml-2 h-5 w-5" />
                            </button>
                            <button className="bg-transparent hover:bg-white hover:bg-opacity-20 text-white hover:text-green-700 font-bold py-3 px-8 rounded-lg border-2 border-white transition duration-300 hover:animate-pulse cursor-pointer">
                                Take a Tour
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Landing;
