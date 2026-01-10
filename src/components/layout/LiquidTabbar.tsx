import React from 'react';
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { motion, LayoutGroup } from "framer-motion";

interface LiquidTabbarProps {
    activeTab: string;
    onTabChange: (value: string) => void;
}

export const LiquidTabbar = ({ activeTab, onTabChange }: LiquidTabbarProps) => {
    return (
        <div className="fixed bottom-6 left-0 right-0 z-50 pointer-events-none lg:hidden flex justify-center items-end px-5 gap-3">
            {/* Main Menu Group - Pill Shape */}
            <div className="pointer-events-auto bg-black/60 backdrop-blur-xl rounded-full px-3 py-2 shadow-2xl border border-white/10 ring-1 ring-black/5 flex-1 max-w-sm h-20 flex items-center">
                <TabsList className="flex items-center justify-between bg-transparent p-0 text-white/50 w-full h-full gap-2 relative">
                    <LayoutGroup>
                        {[
                            { id: "home", label: "당첨정보", icon: "fa-trophy" },
                            { id: "generate", label: "번호 추천", icon: "fa-wand-magic-sparkles" },
                            { id: "bookmarks", label: "보관함", icon: "fa-bookmark" }
                        ].map((tab) => (
                            <TabsTrigger
                                key={tab.id}
                                value={tab.id}
                                onClick={() => onTabChange(tab.id)}
                                className="group flex-col gap-1 bg-transparent data-[state=active]:text-black data-[state=active]:shadow-sm p-1 rounded-full h-16 flex-1 flex items-center justify-center relative z-10 transition-colors duration-300"
                            >
                                {activeTab === tab.id && (
                                    <motion.div
                                        layoutId="active-pill"
                                        className="absolute inset-0 bg-white rounded-full -z-10 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                                        transition={{
                                            type: "spring",
                                            stiffness: 300,
                                            damping: 30
                                        }}
                                    />
                                )}
                                <i className={`fa-solid ${tab.icon} text-xl mb-0.5 transition-transform duration-300 ${activeTab === tab.id ? 'scale-110' : ''}`}></i>
                                <span className="text-[10px] font-bold leading-none">{tab.label}</span>
                            </TabsTrigger>
                        ))}
                    </LayoutGroup>
                </TabsList>
            </div>

            {/* Search Button - Circle Shape (Separate) */}
            <div className="pointer-events-auto">
                <button
                    className="w-16 h-16 bg-black/60 backdrop-blur-xl rounded-full shadow-2xl border border-white/10 ring-1 ring-black/5 flex items-center justify-center text-white/50 hover:text-white hover:bg-black/70 transition-all active:scale-95"
                    onClick={() => console.log('Search clicked')}
                    aria-label="검색"
                >
                    <i className="fa-solid fa-magnifying-glass text-2xl"></i>
                </button>
            </div>
        </div>
    );
};
