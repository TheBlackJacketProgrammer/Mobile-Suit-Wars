"use client";

type HPBarProps = {
    currentHP: number;
    maxHP: number;
}

export default function HPBar({ currentHP, maxHP }: HPBarProps) {
    const hpPercentage = Math.max(0,((currentHP / maxHP) * 100));
    
    function getHPBarFillStyle() {
        if (hpPercentage > 60) {
            return "#22c55e";
        } 
        else if (hpPercentage >50) {
            return "#f59e0b";
        } 
        else {
            return "#ef4444";
        }
    }

    
    return (
        <>
            <div className="w-full">
                <div className="w-full bg-gray-300 h-5 rounded overflow-hidden">
                    <div className="h-5 transition-all duration-500" style={{ width: `${hpPercentage}%`, backgroundColor: getHPBarFillStyle() }}>
                        {/* <p className="text-sm px-1 text-center">
                        {currentHP} / {maxHP} Armor
                        </p> */}
                    </div>
                    
                </div>
            </div>
        </>
    );
}