import { Volume2, VolumeX, ChevronsDownUp } from 'lucide-react';
import { Button } from './ui/button';

import { useSound } from 'use-sound';
import { usePreferences } from '../store/usePreferences';

const PreferencesTab = () => {
    // const useTheme = 'light';
    const { soundEnabled, setSoundEnabled } = usePreferences();
    const [playSoundOn] = useSound('sounds/sound-on.mp3', { volume: 0.4 });
    const [playSoundOff] = useSound('sounds/sound-off.mp3', { volume: 0.4 });

    return (
        <div>
            <Button
                size={'null'}
                onClick={() => {
                    setSoundEnabled(!soundEnabled);
                    soundEnabled ? playSoundOff() : playSoundOn();
                }}
            >
                {soundEnabled ? (
                    <Volume2 className="text-muted-foreground" />
                ) : (
                    <VolumeX className="text-muted-foreground" />
                )}
            </Button>
        </div>
    );
};

export default PreferencesTab;
