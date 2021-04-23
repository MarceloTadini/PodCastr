import { useRef, useEffect, useState } from 'react';
import { usePlayer } from '../../contexts/PlayerContext';
import styles from './styles.module.scss';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import { convertDurationToTimeString } from '../utils/convertDurationToTimeString';

export function Player(){
    const audioRef = useRef<HTMLAudioElement>(null);
    const [progress, setProgress] = useState(0);


    const {episodeList, 
           currentEpisodeIndex,
           isPlaying,
           isLooping,
           isShuffling,
           toggleShuffle,
           togglePlay,
           toggleLoop,
           setPlayingState,
           hasNext,
           hasPrevious,
           clearPlayerState,
           playNext,
           playPreviou
        } = usePlayer() ;

    useEffect(() => {
        if(!audioRef.current){
            return;
        }

        if(isPlaying){
            audioRef.current.play();
        }else {
            audioRef.current.pause();
        }
            
    }, [isPlaying]);

    function setupProgressListener(){
        audioRef.current.currentTime = 0;

        audioRef.current.addEventListener('timeupdate', () =>{
            setProgress(Math.floor(audioRef.current.currentTime));
        });
    }

    function handleSeek(amount: number){
        audioRef.current.currentTime = amount;
        setProgress(amount);
    }

    function handleEpisodeEnded(){
        if(hasNext){
            playNext();
        } else{
            clearPlayerState();
        }
    }

    const episode = episodeList[currentEpisodeIndex]

    return(
        <div className={styles.playerContainer}>
            <header>
                <img src="/playing.svg" alt="Tocando agora"/>
                <strong>Tocando agora</strong>
            </header>

            { episode ? (
                <div className={styles.currentEpisode}>
                    <img src={episode.thumbnail} alt=""/>
                    <strong>{episode.title}</strong>
                    <span>{episode.members}</span>
                </div>
            ) : (
                <div className={styles.emptyPlayer}>
                    <strong>Selecione um podcast para ouvir</strong>
                </div>
            ) }

                <footer className={!episode ? styles.empty : ''}>
                    <div className={styles.progress}>
                    <span>{convertDurationToTimeString(progress)}</span>
                        <div className={styles.slider}>
                            { episode ? (
                                <Slider
                                    trackStyle={{backgroundColor: '#04d561'}}
                                    railStyle={{backgroundColor: '#9f75ff'}}
                                    handleStyle={{borderColor: '#04d561', borderWidth: 4}}
                                    max={episode.duration}
                                    value={progress}
                                    onChange={handleSeek}
                                />
                            ) : (
                                <div className={styles.emptySlider}/>
                            ) }
                        </div>
                        
                        <span>{convertDurationToTimeString(episode?.duration ?? 0)}</span>
                    </div>

                    {episode && (
                        <audio
                            src={episode.url}
                            ref={audioRef}
                            autoPlay
                            onPlay={() => setPlayingState(true)}
                            onPause={() => setPlayingState(false)}
                            loop={isLooping}
                            onLoadedMetadata={setupProgressListener}
                            onEnded={handleEpisodeEnded}
                        />
                        
                    )}

                    <div className={styles.buttons}>
                        <button type="button" onClick={toggleShuffle} disabled={!episode || episodeList.length === 1} className={isShuffling ? styles.isActive : ''}>
                            <img src="/shuffle.svg" alt="Embaralhar"/>
                        </button>
                        <button type="button" onClick={playPreviou} disabled={!episode || !hasPrevious}>
                            <img src="/play-previous.svg" alt="Tocar anterior"/>
                        </button>
                        <button 
                            type="button" 
                            disabled={!episode} 
                            className={styles.playButton}
                            onClick={togglePlay}
                        >
                            {isPlaying 
                            ? <img src="/pause.svg" alt="Parar"/>
                            : <img src="/play.svg" alt="Tocar"/>    
                        }
                        </button>
                        <button type="button" onClick={playNext} disabled={!episode || !hasNext}>
                            <img src="/play-next.svg" alt="Tocar próxima"/>
                        </button>
                        <button type="button" onClick={toggleLoop} className={isLooping ? styles.isActive : ''} disabled={!episode}>
                            <img src="/repeat.svg" alt="Repetir"/>
                        </button>
                    </div>
                </footer>
            
        </div>
    );
}