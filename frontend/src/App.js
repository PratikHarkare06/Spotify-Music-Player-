import React, { useState, useRef, useEffect, useCallback } from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, useNavigate, useLocation, useParams } from 'react-router-dom';

// Components
import { 
  HomeIcon, 
  MagnifyingGlassIcon, 
  BookOpenIcon,
  HeartIcon,
  PlusIcon,
  ArrowDownIcon,
  PlayIcon,
  PauseIcon,
  BackwardIcon,
  ForwardIcon,
  SpeakerWaveIcon,
  ArrowsRightLeftIcon,
  ArrowPathIcon,
  EllipsisHorizontalIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

// Add axios for API calls
import axios from 'axios';

// API base URL
const API_BASE_URL = 'http://localhost:8000/api';

// Demo audio URLs — SoundHelix (no hotlink restriction)
const DEMO_AUDIO = [
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3',
];

// Main App Component
function App() {
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [liked, setLiked] = useState({});
  const [queueIndex, setQueueIndex] = useState(0);
  const [showNowPlaying, setShowNowPlaying] = useState(false);
  const [contextMenu, setContextMenu] = useState(null); // {x, y, song}
  const audioRef = useRef(new Audio());

  const playSong = useCallback((song, idx, allSongs) => {
    setCurrentSong(song);
    setIsPlaying(true);
    if (idx !== undefined) setQueueIndex(idx);
    const audio = audioRef.current;
    const songIdx = idx !== undefined ? idx : (allSongs || songs).findIndex(s => s.id === song.id);
    audio.src = DEMO_AUDIO[songIdx % DEMO_AUDIO.length];
    audio.play().catch(() => {});
  }, [songs]);

  const handleSongSelect = useCallback((song) => {
    const idx = songs.findIndex(s => s.id === song.id);
    playSong(song, idx >= 0 ? idx : 0, songs);
  }, [songs, playSong]);

  const handleNext = useCallback(() => {
    if (!songs.length) return;
    let nextIdx;
    if (shuffle) {
      nextIdx = Math.floor(Math.random() * songs.length);
    } else {
      nextIdx = (queueIndex + 1) % songs.length;
    }
    playSong(songs[nextIdx], nextIdx, songs);
  }, [songs, queueIndex, shuffle, playSong]);

  const handlePrev = useCallback(() => {
    if (!songs.length) return;
    const audio = audioRef.current;
    if (audio.currentTime > 3) {
      audio.currentTime = 0;
      setCurrentTime(0);
      return;
    }
    const prevIdx = (queueIndex - 1 + songs.length) % songs.length;
    playSong(songs[prevIdx], prevIdx, songs);
  }, [songs, queueIndex, playSong]);

  const handlePlayPause = useCallback(() => {
    const audio = audioRef.current;
    if (!currentSong) return;
    if (isPlaying) { audio.pause(); setIsPlaying(false); }
    else { audio.play().catch(() => {}); setIsPlaying(true); }
  }, [currentSong, isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    audio.volume = isMuted ? 0 : volume;
    const onTime = () => setCurrentTime(audio.currentTime);
    const onLoad = () => setDuration(audio.duration);
    const onEnd = () => {
      if (repeat) {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      } else {
        handleNext();
      }
    };
    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('loadedmetadata', onLoad);
    audio.addEventListener('ended', onEnd);
    return () => {
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('loadedmetadata', onLoad);
      audio.removeEventListener('ended', onEnd);
    };
  }, [volume, isMuted, repeat, handleNext]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === 'INPUT') return;
      if (e.code === 'Space') { e.preventDefault(); handlePlayPause(); }
      if (e.code === 'ArrowRight') { e.preventDefault(); handleNext(); }
      if (e.code === 'ArrowLeft') { e.preventDefault(); handlePrev(); }
      if (e.key === 'm' || e.key === 'M') { setIsMuted(m => !m); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handlePlayPause, handleNext, handlePrev]);

  // Fetch data from backend on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Create more comprehensive mock data
        const mockPlaylists = [
          { id: 1, name: "Liked Songs", description: "Your liked songs", count: 234, image: "https://images.unsplash.com/photo-1554425604-b02b2f5e7f1d?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzl8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMGFsYnVtfGVufDB8fHxibHVlfDE3NTMwMTk5NDR8MA&ixlib=rb-4.1.0&q=85" },
          { id: 2, name: "Chill Vibes", description: "Perfect for relaxation", count: 89, image: "https://images.unsplash.com/photo-1510759704643-849552bf3b66?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzl8MHwxfHNlYXJjaHwyfHxtdXNpYyUyMGFsYnVtfGVufDB8fHxibHVlfDE3NTMwMTk5NDR8MA&ixlib=rb-4.1.0&q=85" },
          { id: 3, name: "Hip Hop Hits", description: "Latest hip hop tracks", count: 156, image: "https://images.unsplash.com/photo-1510759782946-09866453296a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzl8MHwxfHNlYXJjaHwzfHxtdXNpYyUyMGFsYnVtfGVufDB8fHxibHVlfDE3NTMwMTk5NDR8MA&ixlib=rb-4.1.0&q=85" },
          // Replaced Electronic Dance album with Pop Party album
          { id: 4, name: "Pop Party", description: "Best pop songs for partying", count: 187, image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzl8MHwxfHNlYXJjaHw2fHxtdXNpYyUyMGFsYnVtfGVufDB8fHxibHVlfDE3NTMwMTk5NDR8MA&ixlib=rb-4.1.0&q=85" },
          { id: 5, name: "Classic Rock", description: "Rock legends", count: 178, image: "https://images.unsplash.com/photo-1522000719313-5ded740290b5?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDN8MHwxfHNlYXJjaHwzfHx2aW55bCUyMHJlY29yZHN8ZW58MHx8fGJsdWV8MTc1MzAxOTk1NHww&ixlib=rb-4.1.0&q=85" },
          // Additional albums
          { id: 6, name: "Pop Hits", description: "Today's top pop songs", count: 120, image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzl8MHwxfHNlYXJjaHw2fHxtdXNpYyUyMGFsYnVtfGVufDB8fHxibHVlfDE3NTMwMTk5NDR8MA&ixlib=rb-4.1.0&q=85" },
          { id: 7, name: "Workout Mix", description: "High energy tracks for your workout", count: 95, image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzl8MHwxfHNlYXJjaHw3fHxtdXNpYyUyMGFsYnVtfGVufDB8fHxibHVlfDE3NTMwMTk5NDR8MA&ixlib=rb-4.1.0&q=85" },
          { id: 8, name: "Jazz Classics", description: "Timeless jazz standards", count: 142, image: "https://images.unsplash.com/photo-1494232410401-ad00d5433cfa?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzl8MHwxfHNlYXJjaHw4fHxtdXNpYyUyMGFsYnVtfGVufDB8fHxibHVlfDE3NTMwMTk5NDR8MA&ixlib=rb-4.1.0&q=85" },
          { id: 9, name: "Country Roads", description: "Country favorites and new releases", count: 110, image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzl8MHwxfHNlYXJjaHw5fHxtdXNpYyUyMGFsYnVtfGVufDB8fHxibHVlfDE3NTMwMTk5NDR8MA&ixlib=rb-4.1.0&q=85" },
          { id: 10, name: "Indie Mix", description: "Independent artists you should know", count: 87, image: "https://images.unsplash.com/photo-1507838153414-b4b713384a76?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzl8MHwxfHNlYXJjaHwxfHxpbmRpZSUyMG11c2ljfGVufDB8fHxibHVlfDE3NTMwMTk5NDR8MA&ixlib=rb-4.1.0&q=85" }
        ];
        
        const mockSongs = [
          { id: 1, title: "Blinding Lights", artist: "The Weeknd", album: "After Hours", duration: "3:20", image: "https://images.unsplash.com/photo-1554425604-b02b2f5e7f1d?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzl8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMGFsYnVtfGVufDB8fHxibHVlfDE3NTMwMTk5NDR8MA&ixlib=rb-4.1.0&q=85" },
          { id: 2, title: "Good 4 U", artist: "Olivia Rodrigo", album: "SOUR", duration: "2:58", image: "https://images.unsplash.com/photo-1510759704643-849552bf3b66?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzl8MHwxfHNlYXJjaHwyfHxtdXNpYyUyMGFsYnVtfGVufDB8fHxibHVlfDE3NTMwMTk5NDR8MA&ixlib=rb-4.1.0&q=85" },
          { id: 3, title: "Industry Baby", artist: "Lil Nas X ft. Jack Harlow", album: "MONTERO", duration: "3:32", image: "https://images.unsplash.com/photo-1510759782946-09866453296a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzl8MHwxfHNlYXJjaHwzfHxtdXNpYyUyMGFsYnVtfGVufDB8fHxibHVlfDE3NTMwMTk5NDR8MA&ixlib=rb-4.1.0&q=85" },
          // Replaced song with different image
          { id: 4, title: "As It Was", artist: "Harry Styles", album: "Harry's House", duration: "2:47", image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzl8MHwxfHNlYXJjaHw3fHxtdXNpYyUyMGFsYnVtfGVufDB8fHxibHVlfDE3NTMwMTk5NDR8MA&ixlib=rb-4.1.0&q=85" },
          { id: 5, title: "Heat Waves", artist: "Glass Animals", album: "Dreamland", duration: "3:58", image: "https://images.unsplash.com/photo-1522000719313-5ded740290b5?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDN8MHwxfHNlYXJjaHwzfHx2aW55bCUyMHJlY29yZHN8ZW58MHx8fGJsdWV8MTc1MzAxOTk1NHww&ixlib=rb-4.1.0&q=85" },
          // Additional songs
          { id: 6, title: "Save Your Tears", artist: "The Weeknd", album: "After Hours", duration: "3:35", image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzl8MHwxfHNlYXJjaHw2fHxtdXNpYyUyMGFsYnVtfGVufDB8fHxibHVlfDE3NTMwMTk5NDR8MA&ixlib=rb-4.1.0&q=85" },
          { id: 7, title: "Levitating", artist: "Dua Lipa", album: "Future Nostalgia", duration: "3:23", image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzl8MHwxfHNlYXJjaHw3fHxtdXNpYyUyMGFsYnVtfGVufDB8fHxibHVlfDE3NTMwMTk5NDR8MA&ixlib=rb-4.1.0&q=85" },
          { id: 8, title: "Montero", artist: "Lil Nas X", album: "Montero", duration: "2:17", image: "https://images.unsplash.com/photo-1494232410401-ad00d5433cfa?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzl8MHwxfHNlYXJjaHw4fHxtdXNpYyUyMGFsYnVtfGVufDB8fHxibHVlfDE3NTMwMTk5NDR8MA&ixlib=rb-4.1.0&q=85" },
          { id: 9, title: "Peaches", artist: "Justin Bieber", album: "Justice", duration: "3:18", image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzl8MHwxfHNlYXJjaHw5fHxtdXNpYyUyMGFsYnVtfGVufDB8fHxibHVlfDE3NTMwMTk5NDR8MA&ixlib=rb-4.1.0&q=85" },
          { id: 10, title: "Kiss Me More", artist: "Doja Cat ft. SZA", album: "Planet Her", duration: "3:28", image: "https://images.unsplash.com/photo-1507838153414-b4b713384a76?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzl8MHwxfHNlYXJjaHwxfHxpbmRpZSUyMG11c2ljfGVufDB8fHxibHVlfDE3NTMwMTk5NDR8MA&ixlib=rb-4.1.0&q=85" }
        ];
        
        setPlaylists(mockPlaylists);
        setSongs(mockSongs);
        
        // Send a status check to backend
        await axios.post(`${API_BASE_URL}/status`, {
          client_name: "Spotify Clone Frontend"
        });
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        // Use mock data if API fails
        const mockPlaylists = [
          { id: 1, name: "Liked Songs", description: "Your liked songs", count: 234, image: "https://images.unsplash.com/photo-1554425604-b02b2f5e7f1d?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzl8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMGFsYnVtfGVufDB8fHxibHVlfDE3NTMwMTk5NDR8MA&ixlib=rb-4.1.0&q=85" },
          { id: 2, name: "Chill Vibes", description: "Perfect for relaxation", count: 89, image: "https://images.unsplash.com/photo-1510759704643-849552bf3b66?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzl8MHwxfHNlYXJjaHwyfHxtdXNpYyUyMGFsYnVtfGVufDB8fHxibHVlfDE3NTMwMTk5NDR8MA&ixlib=rb-4.1.0&q=85" },
          { id: 3, name: "Hip Hop Hits", description: "Latest hip hop tracks", count: 156, image: "https://images.unsplash.com/photo-1510759782946-09866453296a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzl8MHwxfHNlYXJjaHwzfHxtdXNpYyUyMGFsYnVtfGVufDB8fHxibHVlfDE3NTMwMTk5NDR8MA&ixlib=rb-4.1.0&q=85" },
          // Replaced Electronic Dance album with Pop Party album
          { id: 4, name: "Pop Party", description: "Best pop songs for partying", count: 187, image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzl8MHwxfHNlYXJjaHw2fHxtdXNpYyUyMGFsYnVtfGVufDB8fHxibHVlfDE3NTMwMTk5NDR8MA&ixlib=rb-4.1.0&q=85" },
          { id: 5, name: "Classic Rock", description: "Rock legends", count: 178, image: "https://images.unsplash.com/photo-1522000719313-5ded740290b5?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDN8MHwxfHNlYXJjaHwzfHx2aW55bCUyMHJlY29yZHN8ZW58MHx8fGJsdWV8MTc1MzAxOTk1NHww&ixlib=rb-4.1.0&q=85" },
          // Additional albums
          { id: 6, name: "Pop Hits", description: "Today's top pop songs", count: 120, image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzl8MHwxfHNlYXJjaHw2fHxtdXNpYyUyMGFsYnVtfGVufDB8fHxibHVlfDE3NTMwMTk5NDR8MA&ixlib=rb-4.1.0&q=85" },
          { id: 7, name: "Workout Mix", description: "High energy tracks for your workout", count: 95, image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzl8MHwxfHNlYXJjaHw3fHxtdXNpYyUyMGFsYnVtfGVufDB8fHxibHVlfDE3NTMwMTk5NDR8MA&ixlib=rb-4.1.0&q=85" },
          { id: 8, name: "Jazz Classics", description: "Timeless jazz standards", count: 142, image: "https://images.unsplash.com/photo-1494232410401-ad00d5433cfa?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzl8MHwxfHNlYXJjaHw4fHxtdXNpYyUyMGFsYnVtfGVufDB8fHxibHVlfDE3NTMwMTk5NDR8MA&ixlib=rb-4.1.0&q=85" },
          { id: 9, name: "Country Roads", description: "Country favorites and new releases", count: 110, image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzl8MHwxfHNlYXJjaHw5fHxtdXNpYyUyMGFsYnVtfGVufDB8fHxibHVlfDE3NTMwMTk5NDR8MA&ixlib=rb-4.1.0&q=85" },
          { id: 10, name: "Indie Mix", description: "Independent artists you should know", count: 87, image: "https://images.unsplash.com/photo-1507838153414-b4b713384a76?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzl8MHwxfHNlYXJjaHwxfHxpbmRpZSUyMG11c2ljfGVufDB8fHxibHVlfDE3NTMwMTk5NDR8MA&ixlib=rb-4.1.0&q=85" }
        ];

        const mockSongs = [
          { id: 1, title: "Blinding Lights", artist: "The Weeknd", album: "After Hours", duration: "3:20", image: "https://images.unsplash.com/photo-1554425604-b02b2f5e7f1d?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzl8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMGFsYnVtfGVufDB8fHxibHVlfDE3NTMwMTk5NDR8MA&ixlib=rb-4.1.0&q=85" },
          { id: 2, title: "Good 4 U", artist: "Olivia Rodrigo", album: "SOUR", duration: "2:58", image: "https://images.unsplash.com/photo-1510759704643-849552bf3b66?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzl8MHwxfHNlYXJjaHwyfHxtdXNpYyUyMGFsYnVtfGVufDB8fHxibHVlfDE3NTMwMTk5NDR8MA&ixlib=rb-4.1.0&q=85" },
          { id: 3, title: "Industry Baby", artist: "Lil Nas X ft. Jack Harlow", album: "MONTERO", duration: "3:32", image: "https://images.unsplash.com/photo-1510759782946-09866453296a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzl8MHwxfHNlYXJjaHwzfHxtdXNpYyUyMGFsYnVtfGVufDB8fHxibHVlfDE3NTMwMTk5NDR8MA&ixlib=rb-4.1.0&q=85" },
          // Replaced song with different image
          { id: 4, title: "As It Was", artist: "Harry Styles", album: "Harry's House", duration: "2:47", image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzl8MHwxfHNlYXJjaHw3fHxtdXNpYyUyMGFsYnVtfGVufDB8fHxibHVlfDE3NTMwMTk5NDR8MA&ixlib=rb-4.1.0&q=85" },
          { id: 5, title: "Heat Waves", artist: "Glass Animals", album: "Dreamland", duration: "3:58", image: "https://images.unsplash.com/photo-1522000719313-5ded740290b5?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDN8MHwxfHNlYXJjaHwzfHx2aW55bCUyMHJlY29yZHN8ZW58MHx8fGJsdWV8MTc1MzAxOTk1NHww&ixlib=rb-4.1.0&q=85" },
          // Additional songs
          { id: 6, title: "Save Your Tears", artist: "The Weeknd", album: "After Hours", duration: "3:35", image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzl8MHwxfHNlYXJjaHw2fHxtdXNpYyUyMGFsYnVtfGVufDB8fHxibHVlfDE3NTMwMTk5NDR8MA&ixlib=rb-4.1.0&q=85" },
          { id: 7, title: "Levitating", artist: "Dua Lipa", album: "Future Nostalgia", duration: "3:23", image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzl8MHwxfHNlYXJjaHw3fHxtdXNpYyUyMGFsYnVtfGVufDB8fHxibHVlfDE3NTMwMTk5NDR8MA&ixlib=rb-4.1.0&q=85" },
          { id: 8, title: "Montero", artist: "Lil Nas X", album: "Montero", duration: "2:17", image: "https://images.unsplash.com/photo-1494232410401-ad00d5433cfa?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzl8MHwxfHNlYXJjaHw4fHxtdXNpYyUyMGFsYnVtfGVufDB8fHxibHVlfDE3NTMwMTk5NDR8MA&ixlib=rb-4.1.0&q=85" },
          { id: 9, title: "Peaches", artist: "Justin Bieber", album: "Justice", duration: "3:18", image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzl8MHwxfHNlYXJjaHw5fHxtdXNpYyUyMGFsYnVtfGVufDB8fHxibHVlfDE3NTMwMTk5NDR8MA&ixlib=rb-4.1.0&q=85" },
          { id: 10, title: "Kiss Me More", artist: "Doja Cat ft. SZA", album: "Planet Her", duration: "3:28", image: "https://images.unsplash.com/photo-1507838153414-b4b713384a76?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzl8MHwxfHNlYXJjaHwxfHxpbmRpZSUyMG11c2ljfGVufDB8fHxibHVlfDE3NTMwMTk5NDR8MA&ixlib=rb-4.1.0&q=85" }
        ];
        
        setPlaylists(mockPlaylists);
        setSongs(mockSongs);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-spotify-black">
        <div className="text-spotify-white text-2xl">Loading Spotify Clone...</div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="app-container">
        <div className="flex flex-1 overflow-hidden" onClick={() => setContextMenu(null)}>
          <Sidebar playlists={playlists} currentSong={currentSong} onSongSelect={handleSongSelect} />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Routes>
              <Route path="/" element={<HomePage songs={songs} playlists={playlists} onSongSelect={handleSongSelect} currentSong={currentSong} onContextMenu={(song, e) => { e.preventDefault(); setContextMenu({x: e.clientX, y: e.clientY, song}); }} />} />
              <Route path="/search" element={<SearchPage songs={songs} onSongSelect={handleSongSelect} onContextMenu={(song, e) => { e.preventDefault(); setContextMenu({x: e.clientX, y: e.clientY, song}); }} />} />
              <Route path="/library" element={<LibraryPage playlists={playlists} onSongSelect={handleSongSelect} />} />
              <Route path="/playlist/:id" element={<PlaylistPage playlists={playlists} songs={songs} onSongSelect={handleSongSelect} currentSong={currentSong} liked={liked} onLike={(id) => setLiked(p => ({...p, [id]: !p[id]}))} onContextMenu={(song, e) => { e.preventDefault(); setContextMenu({x: e.clientX, y: e.clientY, song}); }} />} />
            </Routes>
          </div>
          {showNowPlaying && currentSong && (
            <NowPlayingPanel
              currentSong={currentSong}
              songs={songs}
              queueIndex={queueIndex}
              isPlaying={isPlaying}
              liked={liked}
              onLike={(id) => setLiked(p => ({...p, [id]: !p[id]}))}
              onClose={() => setShowNowPlaying(false)}
              onSongSelect={handleSongSelect}
            />
          )}
        </div>
        <Player
          currentSong={currentSong}
          isPlaying={isPlaying}
          onPlayPause={handlePlayPause}
          currentTime={currentTime}
          duration={duration}
          volume={volume}
          isMuted={isMuted}
          shuffle={shuffle}
          repeat={repeat}
          liked={liked}
          showNowPlaying={showNowPlaying}
          onSeek={(t) => { audioRef.current.currentTime = t; setCurrentTime(t); }}
          onVolume={(v) => { setVolume(v); audioRef.current.volume = v; }}
          onMute={() => setIsMuted(m => !m)}
          onShuffle={() => setShuffle(s => !s)}
          onRepeat={() => setRepeat(r => !r)}
          onLike={(id) => setLiked(p => ({...p, [id]: !p[id]}))}
          onNext={handleNext}
          onPrev={handlePrev}
          onToggleNowPlaying={() => setShowNowPlaying(s => !s)}
        />
        {/* Context Menu */}
        {contextMenu && (
          <ContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            song={contextMenu.song}
            liked={liked}
            onLike={(id) => { setLiked(p => ({...p, [id]: !p[id]})); setContextMenu(null); }}
            onPlay={() => { handleSongSelect(contextMenu.song); setContextMenu(null); }}
            onClose={() => setContextMenu(null)}
          />
        )}
        {/* Mobile Mini Player */}
        {currentSong && (
          <MobileMiniPlayer
            currentSong={currentSong}
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={duration}
            onPlayPause={handlePlayPause}
            onToggleNowPlaying={() => setShowNowPlaying(s => !s)}
          />
        )}
        {/* Mobile Bottom Nav */}
        <MobileNav />
      </div>
    </BrowserRouter>
  );
}

// Now Playing Panel Component
function NowPlayingPanel({ currentSong, songs, queueIndex, isPlaying, liked, onLike, onClose, onSongSelect }) {
  const upNext = songs.slice(queueIndex + 1, queueIndex + 6);
  const lyricsPlaceholder = [
    "♪ This is a demo of the lyrics panel",
    "Real lyrics would load from an API",
    "Like Musixmatch or Genius",
    "For now enjoy the music! 🎵",
    "",
    "♪ Navigate through your queue below",
    "Click any upcoming track to play it",
  ];

  return (
    <div className="now-playing-panel">
      <div className="now-playing-header">
        <span className="text-white text-sm font-bold">Now Playing View</span>
        <button onClick={onClose} className="text-spotify-silver hover:text-white transition-colors text-lg leading-none">✕</button>
      </div>

      {/* Large artwork */}
      <div className="now-playing-artwork-wrap">
        <img src={currentSong.image} alt={currentSong.title} className="now-playing-artwork" />
      </div>

      {/* Song info + like */}
      <div className="now-playing-info">
        <div className="min-w-0">
          <div className="text-white font-bold text-base truncate">{currentSong.title}</div>
          <div className="text-spotify-silver text-sm truncate">{currentSong.artist}</div>
        </div>
        <button onClick={() => onLike(currentSong.id)} className="flex-shrink-0">
          <HeartIcon className="w-5 h-5 transition-colors" style={{ color: liked[currentSong.id] ? '#1ed760' : '#b3b3b3', fill: liked[currentSong.id] ? '#1ed760' : 'none' }} />
        </button>
      </div>

      {/* Lyrics */}
      <div className="now-playing-section">
        <div className="now-playing-section-title">Lyrics</div>
        <div className="now-playing-lyrics">
          {lyricsPlaceholder.map((line, i) => (
            <p key={i} className={`text-sm leading-7 ${line ? 'text-white' : 'h-4'}`}>{line}</p>
          ))}
        </div>
      </div>

      {/* Up Next */}
      <div className="now-playing-section mt-4">
        <div className="now-playing-section-title">Up Next</div>
        <div className="space-y-1">
          {upNext.length > 0 ? upNext.map((song) => (
            <div
              key={song.id}
              className="flex items-center gap-3 p-2 rounded-md hover:bg-white hover:bg-opacity-10 cursor-pointer group transition-colors"
              onClick={() => onSongSelect(song)}
            >
              <img src={song.image} alt={song.title} className="w-10 h-10 rounded object-cover flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="text-white text-sm font-medium truncate">{song.title}</div>
                <div className="text-spotify-silver text-xs truncate">{song.artist}</div>
              </div>
              <PlayIcon className="w-4 h-4 text-spotify-silver opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          )) : (
            <p className="text-spotify-silver text-sm">No more songs in queue</p>
          )}
        </div>
      </div>
    </div>
  );
}

// Context Menu Component
function ContextMenu({ x, y, song, liked, onLike, onPlay, onClose }) {
  const menuRef = useRef(null);

  // Adjust position so it never goes off-screen
  const [pos, setPos] = useState({ top: y, left: x });
  useEffect(() => {
    if (!menuRef.current) return;
    const { width, height } = menuRef.current.getBoundingClientRect();
    const vw = window.innerWidth, vh = window.innerHeight;
    setPos({
      top: y + height > vh ? y - height : y,
      left: x + width > vw ? x - width : x,
    });
  }, [x, y]);

  const items = [
    { label: 'Play now', icon: '▶', action: onPlay },
    { label: liked[song.id] ? 'Remove from Liked Songs' : 'Save to Liked Songs', icon: '♡', action: () => onLike(song.id) },
    { label: 'Add to playlist', icon: '+', action: onClose },
    { label: 'Go to album', icon: '◉', action: onClose },
    { label: 'Go to artist', icon: '♪', action: onClose },
    { label: 'Share', icon: '⤴', action: onClose },
  ];

  return (
    <div
      ref={menuRef}
      className="context-menu"
      style={{ top: pos.top, left: pos.left }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Song header */}
      <div className="context-menu-song-header">
        <img src={song.image} alt={song.title} className="w-10 h-10 rounded object-cover flex-shrink-0" />
        <div className="min-w-0">
          <div className="text-white text-sm font-bold truncate">{song.title}</div>
          <div className="text-spotify-silver text-xs truncate">{song.artist}</div>
        </div>
      </div>
      <div className="context-menu-divider" />
      {items.map((item) => (
        <button key={item.label} className="context-menu-item" onClick={item.action}>
          <span className="context-menu-icon">{item.icon}</span>
          {item.label}
        </button>
      ))}
    </div>
  );
}

// Mobile Bottom Navigation
function MobileNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const active = (path) => location.pathname === path;

  return (
    <nav className="mobile-nav">
      <button className={`mobile-nav-item ${active('/') ? 'active' : ''}`} onClick={() => navigate('/')}>
        <HomeIcon />
        <span>Home</span>
      </button>
      <button className={`mobile-nav-item ${active('/search') ? 'active' : ''}`} onClick={() => navigate('/search')}>
        <MagnifyingGlassIcon />
        <span>Search</span>
      </button>
      <button className={`mobile-nav-item ${active('/library') ? 'active' : ''}`} onClick={() => navigate('/library')}>
        <BookOpenIcon />
        <span>Your Library</span>
      </button>
    </nav>
  );
}

// Mobile Mini Player
function MobileMiniPlayer({ currentSong, isPlaying, currentTime, duration, onPlayPause, onToggleNowPlaying }) {
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  return (
    <div className="mobile-mini-player" onClick={onToggleNowPlaying} style={{ position: 'relative' }}>
      <img src={currentSong.image} alt={currentSong.title} className="mobile-mini-player-img" />
      <div className="mobile-mini-player-info">
        <div className="mobile-mini-player-title">{currentSong.title}</div>
        <div className="mobile-mini-player-artist">{currentSong.artist}</div>
      </div>
      <button
        className="mobile-mini-play-btn"
        onClick={(e) => { e.stopPropagation(); onPlayPause(); }}
      >
        {isPlaying
          ? <PauseIcon style={{ width: 28, height: 28 }} />
          : <PlayIcon style={{ width: 28, height: 28 }} />
        }
      </button>
      <div className="mobile-mini-progress">
        <div className="mobile-mini-progress-fill" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}

// Spotify SVG Logo
function SpotifyLogo({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#1ed760">
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.516 17.311c-.215.35-.674.46-1.025.246-2.807-1.715-6.337-2.102-10.498-1.152-.4.091-.8-.158-.891-.557-.091-.4.158-.8.557-.891 4.552-1.04 8.458-.593 11.61 1.33.352.214.46.673.247 1.024zm1.473-3.275c-.269.438-.841.575-1.278.307-3.21-1.973-8.105-2.545-11.903-1.392-.494.149-1.014-.13-1.163-.624-.149-.494.13-1.014.624-1.163 4.338-1.317 9.73-.679 13.41 1.594.439.27.576.841.31 1.278zm.126-3.408C15.6 8.377 9.447 8.158 5.798 9.27c-.594.18-1.224-.155-1.404-.749-.18-.594.155-1.224.749-1.404C9.192 5.86 15.99 6.117 20.11 8.548c.534.317.712 1.006.394 1.54-.317.534-1.006.711-1.539.394l.15-.854z"/>
    </svg>
  );
}

// Format time helper
function fmtTime(s) {
  if (!s || isNaN(s)) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

// Sidebar Component
function Sidebar({ playlists, currentSong }) {
  const navigate = useNavigate();
  const location = useLocation();
  const navItems = [
    { path: '/', icon: HomeIcon, label: 'Home' },
    { path: '/search', icon: MagnifyingGlassIcon, label: 'Search' },
    { path: '/library', icon: BookOpenIcon, label: 'Your Library' },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-logo-container">
        <SpotifyLogo size={32} />
        <span style={{color:'#fff',fontWeight:900,fontSize:'1.3rem',marginLeft:8,letterSpacing:'-0.5px'}}>Spotify</span>
      </div>

      <nav className="px-3 pb-2">
        <ul className="space-y-1">
          {navItems.map(({path, icon: Icon, label}) => {
            const active = location.pathname === path;
            return (
              <li key={path}>
                <button
                  onClick={() => navigate(path)}
                  className={`sidebar-nav-item ${active ? 'sidebar-nav-active' : 'sidebar-nav-inactive'}`}
                >
                  <Icon className="w-6 h-6 flex-shrink-0" />
                  <span>{label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="sidebar-library">
        <div className="sidebar-library-header">
          <div className="flex items-center space-x-2 text-spotify-silver">
            <BookOpenIcon className="w-5 h-5" />
            <span className="text-sm font-bold">Your Library</span>
          </div>
          <button className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white hover:bg-opacity-10 text-spotify-silver hover:text-white transition-colors">
            <PlusIcon className="w-4 h-4" />
          </button>
        </div>
        <div className="sidebar-playlist-list">
          {playlists.map((playlist) => (
            <button
              key={playlist.id}
              onClick={() => navigate(`/playlist/${playlist.id}`)}
              className="sidebar-playlist-item"
            >
              <img src={playlist.image} alt={playlist.name} className="w-10 h-10 rounded object-cover flex-shrink-0" />
              <div className="min-w-0 text-left">
                <div className={`text-sm font-bold truncate ${
                  currentSong && currentSong.playlist === playlist.id ? 'text-spotify-green' : 'text-white'
                }`}>{playlist.name}</div>
                <div className="text-xs text-spotify-silver truncate">Playlist</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Top Bar Component
function TopBar() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const el = document.querySelector('.main-content');
    if (!el) return;
    const handler = () => setScrolled(el.scrollTop > 40);
    el.addEventListener('scroll', handler);
    return () => el.removeEventListener('scroll', handler);
  }, []);

  return (
    <div className={`topbar ${scrolled ? 'topbar-scrolled' : ''}`}>
      <div className="flex items-center space-x-2">
        <button onClick={() => navigate(-1)} className="topbar-nav-btn">
          <ChevronLeftIcon className="w-5 h-5" />
        </button>
        <button onClick={() => navigate(1)} className="topbar-nav-btn">
          <ChevronRightIcon className="w-5 h-5" />
        </button>
      </div>
      <div className="flex items-center space-x-3">
        <button className="topbar-upgrade-btn">UPGRADE</button>
        <div className="topbar-avatar">P</div>
      </div>
    </div>
  );
}

// Player Component
function Player({ currentSong, isPlaying, onPlayPause, currentTime, duration, volume, isMuted, shuffle, repeat, liked, onSeek, onVolume, onMute, onShuffle, onRepeat, onLike, onNext, onPrev, onToggleNowPlaying, showNowPlaying }) {
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const progressRef = useRef(null);
  const volumeRef = useRef(null);
  const isDraggingProgress = useRef(false);
  const isDraggingVolume = useRef(false);

  const getPct = (e, ref) => {
    const rect = ref.current.getBoundingClientRect();
    return Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  };

  // Progress drag
  const onProgressMouseDown = (e) => {
    isDraggingProgress.current = true;
    onSeek(getPct(e, progressRef) * duration);
    const onMove = (me) => { if (isDraggingProgress.current) onSeek(getPct(me, progressRef) * duration); };
    const onUp = (me) => { isDraggingProgress.current = false; onSeek(getPct(me, progressRef) * duration); window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  // Volume drag
  const onVolumeMouseDown = (e) => {
    isDraggingVolume.current = true;
    onVolume(getPct(e, volumeRef));
    const onMove = (me) => { if (isDraggingVolume.current) onVolume(getPct(me, volumeRef)); };
    const onUp = (me) => { isDraggingVolume.current = false; onVolume(getPct(me, volumeRef)); window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  return (
    <div className="player-bar">
      {/* Song Info */}
      <div className="player-left">
        {currentSong ? (
          <>
            <img src={currentSong.image} alt={currentSong.title} className="player-thumb" />
            <div className="player-song-info">
              <div className="player-song-title">{currentSong.title}</div>
              <div className="player-song-artist">{currentSong.artist}</div>
            </div>
            <button onClick={() => onLike(currentSong.id)} className="player-like-btn">
              <HeartIcon className={`w-4 h-4 transition-colors`} style={{ color: liked[currentSong.id] ? '#1ed760' : '#b3b3b3', fill: liked[currentSong.id] ? '#1ed760' : 'none' }} />
            </button>
          </>
        ) : (
          <div className="flex items-center space-x-3">
            <div className="w-14 h-14 bg-spotify-mid rounded"></div>
            <span className="text-spotify-silver text-sm">No song selected</span>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="player-center">
        <div className="player-controls">
          <button onClick={onShuffle} title="Shuffle" className={`player-ctrl-btn ${shuffle ? 'text-spotify-green' : ''}`}>
            <ArrowsRightLeftIcon className="w-4 h-4" />
            {shuffle && <span className="player-ctrl-dot"></span>}
          </button>
          <button onClick={onPrev} title="Previous" className="player-ctrl-btn"><BackwardIcon className="w-5 h-5" /></button>
          <button onClick={onPlayPause} className="player-play-btn">
            {isPlaying ? <PauseIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5 ml-0.5" />}
          </button>
          <button onClick={onNext} title="Next" className="player-ctrl-btn"><ForwardIcon className="w-5 h-5" /></button>
          <button onClick={onRepeat} title="Repeat" className={`player-ctrl-btn ${repeat ? 'text-spotify-green' : ''}`}>
            <ArrowPathIcon className="w-4 h-4" />
            {repeat && <span className="player-ctrl-dot"></span>}
          </button>
        </div>
        <div className="player-progress-row">
          <span className="player-time">{fmtTime(currentTime)}</span>
          <div ref={progressRef} className="player-progress-track" onMouseDown={onProgressMouseDown}>
            <div className="player-progress-fill" style={{width: `${progress}%`}}></div>
          </div>
          <span className="player-time">{fmtTime(duration)}</span>
        </div>
      </div>

      {/* Volume + NowPlaying toggle */}
      <div className="player-right">
        <button onClick={onMute} className="player-ctrl-btn" title={isMuted ? 'Unmute' : 'Mute'}>
          {isMuted || volume === 0
            ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>
            : <SpeakerWaveIcon className="w-4 h-4" />
          }
        </button>
        <div ref={volumeRef} className="player-volume-track" onMouseDown={onVolumeMouseDown}>
          <div className="player-volume-fill" style={{width: `${isMuted ? 0 : volume * 100}%`}}></div>
        </div>
        <button
          onClick={onToggleNowPlaying}
          title="Now Playing view"
          className={`player-ctrl-btn ml-2 ${showNowPlaying ? 'text-spotify-green' : ''}`}
        >
          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
            <path d="M0 1.5A1.5 1.5 0 0 1 1.5 0h6A1.5 1.5 0 0 1 9 1.5v2A1.5 1.5 0 0 1 7.5 5h-6A1.5 1.5 0 0 1 0 3.5v-2zm1.5-.5a.5.5 0 0 0-.5.5v2a.5.5 0 0 0 .5.5h6a.5.5 0 0 0 .5-.5v-2a.5.5 0 0 0-.5-.5h-6zm8 0A1.5 1.5 0 0 1 11 0h4a1.5 1.5 0 0 1 1.5 1.5v9A1.5 1.5 0 0 1 15 12h-4a1.5 1.5 0 0 1-1.5-1.5v-9zm1.5-.5a.5.5 0 0 0-.5.5v9a.5.5 0 0 0 .5.5h4a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5h-4zM0 8a1.5 1.5 0 0 1 1.5-1.5h6A1.5 1.5 0 0 1 9 8v6a1.5 1.5 0 0 1-1.5 1.5h-6A1.5 1.5 0 0 1 0 14V8zm1.5-.5a.5.5 0 0 0-.5.5v6a.5.5 0 0 0 .5.5h6a.5.5 0 0 0 .5-.5V8a.5.5 0 0 0-.5-.5h-6z"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

// Home Page Component
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

// Home Page Component
function HomePage({ songs, playlists, onSongSelect, currentSong, onContextMenu }) {
  const allSongs = songs;

  // Extra dummy "Made for You" cards to pad the grid uniformly
  const DUMMY_MIXES = [
    { id: 101, name: 'Daily Mix 1', description: 'The Weeknd, Dua Lipa and more', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&q=80' },
    { id: 102, name: 'Daily Mix 2', description: 'Harry Styles, Olivia Rodrigo and more', image: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=300&q=80' },
    { id: 103, name: 'Daily Mix 3', description: 'Glass Animals, Lil Nas X and more', image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=300&q=80' },
    { id: 104, name: 'Discover Weekly', description: 'Your weekly mixtape of fresh music', image: 'https://images.unsplash.com/photo-1493676304819-0d7a8d026dcf?w=300&q=80' },
    { id: 105, name: 'Release Radar', description: 'Catch all the latest music from artists you follow', image: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=300&q=80' },
    { id: 106, name: 'On Repeat', description: 'Songs you love right now', image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&q=80' },
    { id: 107, name: 'Repeat Rewind', description: 'Your old favourites', image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300&q=80' },
    { id: 108, name: 'Chill Mix', description: 'Sit back, relax and enjoy', image: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=300&q=80' },
    { id: 109, name: 'Energy Boost', description: 'High energy hits to power your day', image: 'https://images.unsplash.com/photo-1504898770365-14faca6a7320?w=300&q=80' },
    { id: 110, name: 'Focus Flow', description: 'Deep focus for work & study', image: 'https://images.unsplash.com/photo-1527261834078-9b37d35a4a32?w=300&q=80' },
  ];

  const allMadeForYou = [...playlists, ...DUMMY_MIXES];

  return (
    <div className="bg-spotify-black min-h-screen main-content">
      <TopBar />
      <div className="px-8 pb-8">
        <h1 className="text-spotify-white text-3xl font-bold mb-6">{getGreeting()}</h1>

        {/* Recently Played pinned grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-10">
          {allSongs.slice(0, 6).map((song) => (
            <div
              key={song.id}
              className={`pinned-card group ${currentSong?.id === song.id ? 'pinned-card-active' : ''}`}
              onClick={() => onSongSelect(song)}
              onContextMenu={(e) => onContextMenu && onContextMenu(song, e)}
            >
              <img src={song.image} alt={song.title} className="pinned-card-img" />
              <span className="pinned-card-title">{song.title}</span>
              <div className="pinned-card-play">
                <button className="pinned-play-btn"><PlayIcon className="w-5 h-5 ml-0.5" /></button>
              </div>
            </div>
          ))}
        </div>

        {/* Made for You */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-spotify-white text-2xl font-bold">Made for you</h2>
            <button className="text-xs font-bold text-spotify-silver hover:text-white uppercase tracking-button">Show all</button>
          </div>
          <div className="made-for-you-grid">
            {allMadeForYou.map((item) => (
              <div
                key={item.id}
                className="mfy-card group cursor-pointer"
                onClick={() => onSongSelect(allSongs[item.id % allSongs.length])}
                onContextMenu={(e) => e.preventDefault()}
              >
                <div className="mfy-cover-wrap">
                  <img src={item.image} alt={item.name} className="mfy-cover" />
                  <button className="mfy-play-btn"><PlayIcon className="w-5 h-5 ml-0.5" /></button>
                </div>
                <div className="mfy-title">{item.name}</div>
                <div className="mfy-desc">{item.description}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Recently Played */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-spotify-white text-2xl font-bold">Recently played</h2>
            <button className="text-xs font-bold text-spotify-silver hover:text-white uppercase tracking-button">Show all</button>
          </div>
          <div className="recently-played-grid">
            {allSongs.map((song) => (
              <div
                key={song.id}
                className="recently-played-item group cursor-pointer"
                onClick={() => onSongSelect(song)}
                onContextMenu={(e) => onContextMenu && onContextMenu(song, e)}
              >
                <div className="recently-played-cover-container">
                  <img src={song.image} alt={song.title} className="recently-played-cover" />
                  <button className="recently-played-play-button"><PlayIcon className="w-5 h-5 ml-0.5" /></button>
                </div>
                <div className="recently-played-title">{song.title}</div>
                <div className="recently-played-artist">{song.artist}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}


// Search Page Component
function SearchPage({ songs, onSongSelect }) {
  const [searchTerm, setSearchTerm] = useState('');

  const genres = [
    { name: 'Pop', color: '#c13584', image: songs[0]?.image || '' },
    { name: 'Hip-Hop', color: '#e17000', image: songs[1]?.image || '' },
    { name: 'Rock', color: '#ba0f30', image: songs[2]?.image || '' },
    { name: 'Electronic', color: '#0d72ea', image: songs[3]?.image || '' },
    { name: 'Indie', color: '#148a08', image: songs[4]?.image || '' },
    { name: 'Jazz', color: '#7358ff', image: songs[5]?.image || '' },
    { name: 'Country', color: '#b36200', image: songs[6]?.image || '' },
    { name: 'Workout', color: '#e91429', image: songs[7]?.image || '' },
    { name: 'R&B', color: '#477d95', image: songs[0]?.image || '' },
    { name: 'Classical', color: '#1e3264', image: songs[1]?.image || '' },
    { name: 'Latin', color: '#e8115b', image: songs[2]?.image || '' },
    { name: 'Podcasts', color: '#8d67ab', image: songs[3]?.image || '' },
  ];

  const filteredSongs = searchTerm
    ? songs.filter(s =>
        s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.artist.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const topResult = filteredSongs[0];

  return (
    <div className="bg-spotify-black min-h-screen main-content">
      <TopBar />
      <div className="px-8 pb-8">
        <div className="relative mb-8 max-w-sm">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black" />
          <input
            type="text"
            placeholder="What do you want to listen to?"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
            className="w-full bg-white text-black pl-12 pr-4 py-3 rounded-full text-sm font-medium focus:outline-none focus:ring-2 focus:ring-white placeholder-gray-500"
          />
        </div>

        {searchTerm ? (
          <div className="flex gap-8">
            {/* Top Result */}
            {topResult && (
              <div className="flex-shrink-0 w-72">
                <h2 className="text-white text-2xl font-bold mb-4">Top result</h2>
                <div
                  className="bg-spotify-dark hover:bg-spotify-card rounded-lg p-6 cursor-pointer group transition-colors"
                  style={{ boxShadow: '0 8px 8px rgba(0,0,0,0.3)' }}
                  onClick={() => onSongSelect(topResult)}
                >
                  <img src={topResult.image} alt={topResult.title} className="w-24 h-24 rounded shadow-heavy mb-4 object-cover" />
                  <div className="text-white text-3xl font-bold mb-1 truncate">{topResult.title}</div>
                  <div className="text-spotify-silver text-sm">Song • {topResult.artist}</div>
                  <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="pinned-play-btn"><PlayIcon className="w-6 h-6 ml-0.5" /></button>
                  </div>
                </div>
              </div>
            )}
            {/* Songs list */}
            <div className="flex-1 min-w-0">
              <h2 className="text-white text-2xl font-bold mb-4">Songs</h2>
              <div className="space-y-1">
                {filteredSongs.map((song, index) => (
                  <div
                    key={song.id}
                    className="flex items-center p-2 rounded hover:bg-spotify-mid cursor-pointer group"
                    onClick={() => onSongSelect(song)}
                  >
                    <div className="w-8 text-center text-spotify-silver text-sm group-hover:hidden">{index + 1}</div>
                    <button className="w-8 text-center text-white hidden group-hover:flex items-center justify-center">
                      <PlayIcon className="w-4 h-4" />
                    </button>
                    <img src={song.image} alt={song.title} className="w-10 h-10 rounded object-cover mx-3" />
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-medium text-sm truncate">{song.title}</div>
                      <div className="text-spotify-silver text-xs truncate">{song.artist}</div>
                    </div>
                    <span className="text-spotify-silver text-sm mr-4">{song.duration}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <section>
            <h2 className="text-white text-2xl font-bold mb-6">Browse all</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {genres.map((genre) => (
                <div
                  key={genre.name}
                  className="relative p-4 rounded-lg cursor-pointer hover:scale-105 transition-transform overflow-hidden"
                  style={{ backgroundColor: genre.color, height: '180px' }}
                >
                  <div className="text-white text-xl font-bold">{genre.name}</div>
                  <img
                    src={genre.image}
                    alt={genre.name}
                    className="absolute bottom-0 right-0 w-20 h-20 object-cover rounded transform rotate-12 translate-x-2 translate-y-2"
                  />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

// Library Page Component
function LibraryPage({ playlists, onSongSelect }) {
  const [filter, setFilter] = useState('All');
  const [view, setView] = useState('list');
  const navigate = useNavigate();
  const filters = ['All', 'Playlists', 'Albums', 'Artists'];

  return (
    <div className="bg-spotify-black min-h-screen main-content">
      <TopBar />
      <div className="px-8 pb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-2 flex-wrap">
            {filters.map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  filter === f
                    ? 'bg-white text-black'
                    : 'bg-spotify-mid text-white hover:bg-spotify-card'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setView('list')}
              className={`p-2 rounded transition-colors ${view === 'list' ? 'text-white' : 'text-spotify-silver hover:text-white'}`}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><rect x="0" y="1" width="16" height="2"/><rect x="0" y="7" width="16" height="2"/><rect x="0" y="13" width="16" height="2"/></svg>
            </button>
            <button
              onClick={() => setView('grid')}
              className={`p-2 rounded transition-colors ${view === 'grid' ? 'text-white' : 'text-spotify-silver hover:text-white'}`}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><rect x="0" y="0" width="7" height="7"/><rect x="9" y="0" width="7" height="7"/><rect x="0" y="9" width="7" height="7"/><rect x="9" y="9" width="7" height="7"/></svg>
            </button>
          </div>
        </div>

        {view === 'list' ? (
          <div className="space-y-1 mt-4">
            {playlists.map((playlist) => (
              <div
                key={playlist.id}
                className="flex items-center p-2 rounded-md hover:bg-spotify-mid cursor-pointer group transition-colors"
                onClick={() => navigate(`/playlist/${playlist.id}`)}
              >
                <img src={playlist.image} alt={playlist.name} className="w-12 h-12 rounded object-cover mr-3 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-white font-medium text-sm truncate">{playlist.name}</div>
                  <div className="text-spotify-silver text-xs truncate">Playlist • {playlist.count} songs</div>
                </div>
                <EllipsisHorizontalIcon className="w-5 h-5 text-spotify-silver opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
        ) : (
          <div className="album-grid mt-4">
            {playlists.map((playlist) => (
              <div
                key={playlist.id}
                className="album-grid-item group cursor-pointer"
                onClick={() => navigate(`/playlist/${playlist.id}`)}
              >
                <div className="album-cover-container">
                  <img src={playlist.image} alt={playlist.name} className="album-cover" />
                  <button className="album-play-button"><PlayIcon className="w-5 h-5 ml-0.5" /></button>
                </div>
                <div className="album-title">{playlist.name}</div>
                <div className="album-description">Playlist • {playlist.count} songs</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Playlist Page Component
function PlaylistPage({ playlists, songs, onSongSelect, currentSong, liked, onLike }) {
  const { id } = useParams();
  const playlist = playlists.find(p => p.id === parseInt(id)) || playlists[0];
  const gradientColors = ['#1e3264','#774b16','#154934','#4a154b','#7d1010','#0d3b6e'];
  const heroColor = gradientColors[(playlist?.id || 0) % gradientColors.length];

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if (e.code === 'Space' && e.target.tagName !== 'INPUT') {
        e.preventDefault();
        document.querySelector('.player-play-btn')?.click();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  if (!playlist) return null;

  return (
    <div className="min-h-screen main-content" style={{ background: '#121212' }}>
      {/* Hero gradient header */}
      <div style={{ background: `linear-gradient(180deg, ${heroColor} 0%, rgba(18,18,18,0) 100%)` }}>
        <TopBar />
        <div className="px-8 pt-4 pb-8 flex items-end gap-6">
          <img
            src={playlist.image}
            alt={playlist.name}
            className="w-52 h-52 rounded object-cover flex-shrink-0"
            style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}
          />
          <div className="min-w-0">
            <div className="text-white text-xs font-bold uppercase mb-2">Playlist</div>
            <h1 className="text-white font-black mb-4 leading-none" style={{ fontSize: 'clamp(1.5rem, 5vw, 4rem)' }}>
              {playlist.name}
            </h1>
            <p className="text-spotify-silver text-sm mb-3">{playlist.description}</p>
            <div className="flex items-center gap-1 text-sm">
              <span className="text-white font-bold">Spotify</span>
              <span className="text-spotify-silver">• {playlist.count} songs</span>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="px-8 py-6 flex items-center gap-6">
        <button
          className="player-play-btn"
          style={{ width: 56, height: 56 }}
          onClick={() => onSongSelect(songs[0])}
        >
          <PlayIcon className="w-7 h-7 ml-0.5" />
        </button>
        <HeartIcon className="w-8 h-8 text-spotify-silver hover:text-white cursor-pointer transition-colors" />
        <EllipsisHorizontalIcon className="w-8 h-8 text-spotify-silver hover:text-white cursor-pointer transition-colors" />
      </div>

      {/* Table header */}
      <div className="px-8 mb-2">
        <div className="grid grid-cols-12 gap-4 items-center px-4 py-2 border-b border-spotify-border text-xs font-bold text-spotify-silver uppercase tracking-wider">
          <div className="col-span-1">#</div>
          <div className="col-span-5">Title</div>
          <div className="col-span-4">Album</div>
          <div className="col-span-1 flex justify-center">♡</div>
          <div className="col-span-1 flex justify-end">⏱</div>
        </div>
      </div>

      {/* Track list */}
      <div className="px-8 pb-8 space-y-1">
        {songs.map((song, index) => {
          const isActive = currentSong?.id === song.id;
          return (
            <div
              key={song.id}
              className={`grid grid-cols-12 gap-4 items-center px-4 py-2 rounded-md cursor-pointer group transition-colors ${
                isActive ? 'bg-white bg-opacity-10' : 'hover:bg-white hover:bg-opacity-10'
              }`}
              onClick={() => onSongSelect(song)}
            >
              <div className="col-span-1 text-sm">
                <span className={`group-hover:hidden ${isActive ? 'text-spotify-green' : 'text-spotify-silver'}`}>{index + 1}</span>
                <PlayIcon className="w-4 h-4 text-white hidden group-hover:block" />
              </div>
              <div className="col-span-5 flex items-center gap-3 min-w-0">
                <img src={song.image} alt={song.title} className="w-10 h-10 rounded object-cover flex-shrink-0" />
                <div className="min-w-0">
                  <div className={`font-medium text-sm truncate ${isActive ? 'text-spotify-green' : 'text-white'}`}>{song.title}</div>
                  <div className="text-spotify-silver text-xs truncate">{song.artist}</div>
                </div>
              </div>
              <div className="col-span-4 text-spotify-silver text-sm truncate">{song.album}</div>
              <div className="col-span-1 flex justify-center">
                <button
                  onClick={(e) => { e.stopPropagation(); onLike(song.id); }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <HeartIcon
                    className="w-4 h-4"
                    style={{ color: liked[song.id] ? '#1ed760' : '#b3b3b3', fill: liked[song.id] ? '#1ed760' : 'none' }}
                  />
                </button>
              </div>
              <div className="col-span-1 text-spotify-silver text-sm flex justify-end">{song.duration}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default App;
