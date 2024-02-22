import React, { useState, useEffect, useRef } from 'react';
import '../Styles/AudioPlayer.css';

const AudioPlayer = () => {
  const [playlist, setPlaylist] = useState(() => {
    const storedPlaylist = JSON.parse(localStorage.getItem('playlist'));
    return storedPlaylist || [];
  });
  const [currentTrackIndex, setCurrentTrackIndex] = useState(null);
  const [currentTime, setCurrentTime] = useState(0); 
  const [isPlaying, setIsPlaying] = useState(false); 
  const audioRef = useRef(null);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const audioFile = {
          name: file.name,
          type: file.type,
          dataUrl: event.target.result 
        };
        setPlaylist(prevPlaylist => [...prevPlaylist, { name: file.name, audioFile }]);
      };
      reader.readAsDataURL(file); 
    });
  };

  const playTrack = (index) => {
    setCurrentTrackIndex(index);
    setIsPlaying(true);
    console.log("Playing Track:",index);
  };

  const handleEnded = () => {
    if (currentTrackIndex !== null && currentTrackIndex < playlist.length - 1) {
      setCurrentTrackIndex(currentTrackIndex + 1);
    } else {
      setCurrentTrackIndex(0); 
    }
  };

  const playPrevious = () => {
    if (currentTrackIndex !== null && currentTrackIndex > 0) {
      setCurrentTrackIndex(currentTrackIndex - 1);
    }
  };


  const playNext = () => {
    if (currentTrackIndex !== null && currentTrackIndex < playlist.length - 1) {
      setCurrentTrackIndex(currentTrackIndex + 1);
    }
  };

  useEffect(() => {
    const storedCurrentTrackIndex = localStorage.getItem('currentTrackIndex');
    const storedCurrentTime = parseFloat(localStorage.getItem('currentTime'));
    const storedIsPlaying = localStorage.getItem('isPlaying') === 'true';
  
    if (storedCurrentTrackIndex !== null && !isNaN(storedCurrentTrackIndex)) {
      setCurrentTrackIndex(parseInt(storedCurrentTrackIndex));
    }
  
    if (!isNaN(storedCurrentTime)) {
      setCurrentTime(storedCurrentTime);
    }
  
    setIsPlaying(storedIsPlaying);
  }, []);
  
  

  useEffect(() => {
    localStorage.setItem('playlist', JSON.stringify(playlist.map(item => ({ name: item.name }))));
  }, [playlist]);

  useEffect(() => {
    if (currentTrackIndex !== null && audioRef.current && isPlaying) {
      const audioElement = audioRef.current;
      audioElement.currentTime = currentTime; 
      audioElement.src = playlist[currentTrackIndex]?.audioFile?.dataUrl; 
      audioElement.play()
        .then(() => console.log("Audio Playback started Successfully."))
        .catch(error => console.error('Playback Error:', error));
    }
  }, [currentTrackIndex, currentTime, isPlaying]);
  

  useEffect(() => {
    const audioElement = audioRef.current;
    if (audioElement) {
      const updateTime = () => {
        setCurrentTime(audioElement.currentTime);
      };
      audioElement.addEventListener('timeupdate', updateTime);

      return () => {
        audioElement.removeEventListener('timeupdate', updateTime);
      };
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('currentTrackIndex', currentTrackIndex);
    localStorage.setItem('currentTime', currentTime.toString());
  }, [currentTrackIndex, currentTime]);

  return (
    <div className="audio-player">
      <h1>Audio Player</h1>
      <input type="file" accept="audio/*" onChange={handleFileChange} multiple />
      <div className="playlist">
        {playlist.map((track, index) => (
          <div key={index} className={index === currentTrackIndex ? 'track playing' : 'track'}>
            <p>{track.name}</p>
            <button onClick={() => playTrack(index)}>Play</button>
          </div>
        ))}
      </div>
      <div className="controls">
        <button onClick={playPrevious} disabled={currentTrackIndex === null || currentTrackIndex === 0}>
          Previous
        </button>
        <button onClick={playNext} disabled={currentTrackIndex === null || currentTrackIndex === playlist.length - 1}>
          Next
        </button>
      </div>
      {currentTrackIndex !== null && (
        <audio ref={audioRef} src={currentTrackIndex !== null && playlist[currentTrackIndex]?.audioFile?.dataUrl} onEnded={handleEnded} controls />
      )}
    </div>
  );
};

export default AudioPlayer;