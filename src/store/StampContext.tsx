import React, { createContext, useState, useContext } from 'react';

interface StampContextType {
    sequenceNumber: number;
    incrementSequence: () => void;
    setSequence: (val: number) => void;
    isAutoIncrement: boolean;
    setIsAutoIncrement: (val: boolean) => void;
}

const StampContext = createContext<StampContextType | undefined>(undefined);

export const StampProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [sequenceNumber, setSequenceNumber] = useState(1001);
    const [isAutoIncrement, setIsAutoIncrement] = useState(true);

    const incrementSequence = () => {
        if (isAutoIncrement) setSequenceNumber(prev => prev + 1);
    };

    return (
        <StampContext.Provider value={{
            sequenceNumber,
            incrementSequence,
            setSequence: setSequenceNumber,
            isAutoIncrement,
            setIsAutoIncrement
        }}>
            {children}
        </StampContext.Provider>
    );
};

export const useStampSettings = () => {
    const context = useContext(StampContext);
    if (!context) throw new Error('useStampSettings must be used within StampProvider');
    return context;
};