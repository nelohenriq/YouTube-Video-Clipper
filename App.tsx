import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Header } from './components/Header';
import { VideoPlayer } from './components/VideoPlayer';
import { LoadIcon } from './components/icons/LoadIcon';
import { SetTimeIcon } from './components/icons/SetTimeIcon';
import { ResetIcon } from './components/icons/ResetIcon';
import { ScissorsIcon } from './components/icons/ScissorsIcon';
import { CopyIcon } from './components/icons/CopyIcon';
import { TwitterIcon } from './components/icons/TwitterIcon';
import { FacebookIcon } from './components/icons/FacebookIcon';
import { RedditIcon } from './components/icons/RedditIcon';
import { WhatsAppIcon } from './components/icons/WhatsAppIcon';
import { MailIcon } from './components/icons/MailIcon';
import { DownloadIcon } from './components/icons/DownloadIcon';
import { CloseIcon } from './components/icons/CloseIcon';
import { PencilIcon } from './components/icons/PencilIcon';
import { CheckIcon } from './components/icons/CheckIcon';
import { TikTokIcon } from './components/icons/TikTokIcon';
import { extractYouTubeVideoId } from './utils/youtube';
import { formatTime, parseTime, formatTimeForCli } from './utils/time';
import type { PlayerControls } from './types';

type Theme = 'light' | 'dark';

const App: React.FC = () => {
  const [url, setUrl] = useState<string>('');
  const [videoId, setVideoId] = useState<string | null>(null);
  const [clipStart, setClipStart] = useState<number | null>(null);
  const [clipEnd, setClipEnd] = useState<number | null>(null);
  const [startTimeInput, setStartTimeInput] = useState<string>('--:--');
  const [endTimeInput, setEndTimeInput] = useState<string>('--:--');
  const [isEditingStart, setIsEditingStart] = useState<boolean>(false);
  const [isEditingEnd, setIsEditingEnd] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [copyButtonText, setCopyButtonText] = useState<string>('Copy');
  const [copyCommandButtonText, setCopyCommandButtonText] = useState<string>('Copy');
  const [theme, setTheme] = useState<Theme>('dark');
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState<boolean>(false);
  
  const playerRef = useRef<PlayerControls>(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    const userPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
      setTheme(savedTheme);
    } else if (userPrefersDark) {
      setTheme('dark');
    } else {
      setTheme('light');
    }
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  useEffect(() => {
    setStartTimeInput(formatTime(clipStart));
  }, [clipStart]);

  useEffect(() => {
    setEndTimeInput(formatTime(clipEnd));
  }, [clipEnd]);

  const toggleTheme = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const handleLoadVideo = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setError(null);
    setVideoId(null);
    setClipStart(null);
    setClipEnd(null);
    setShowPreview(false);

    if (!url) {
      setError('Please enter a YouTube video URL.');
      return;
    }

    const extractedVideoId = extractYouTubeVideoId(url);
    if (!extractedVideoId) {
      setError('Invalid YouTube URL. Please check and try again.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setVideoId(extractedVideoId);
      setIsLoading(false);
    }, 500);
  }, [url]);

  const handleSetStart = useCallback(async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const currentTime = await playerRef.current?.getCurrentTime();
    if (currentTime !== undefined) {
      playerRef.current?.pauseVideo();
      setClipStart(currentTime);
      if (clipEnd !== null && currentTime >= clipEnd) {
        setClipEnd(null); 
      }
    }
  }, [clipEnd]);

  const handleSetEnd = useCallback(async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const currentTime = await playerRef.current?.getCurrentTime();
    if (currentTime !== undefined) {
      playerRef.current?.pauseVideo();
      setClipEnd(currentTime);
    }
  }, []);
  
  const handleTimeInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'start' | 'end'
  ) => {
    const value = e.target.value;
    if (/^[\d:]*$/.test(value)) {
      if (type === 'start') {
        setStartTimeInput(value);
      } else {
        setEndTimeInput(value);
      }
    }
  };

  const handleTimeInputBlur = (type: 'start' | 'end') => {
    const value = type === 'start' ? startTimeInput : endTimeInput;
    const timeInSeconds = parseTime(value);

    if (type === 'start') {
      if (timeInSeconds !== null) {
        setClipStart(timeInSeconds);
         if (clipEnd !== null && timeInSeconds >= clipEnd) {
           setClipEnd(null);
         }
      } else {
        setStartTimeInput(formatTime(clipStart));
      }
    } else { // 'end'
      if (timeInSeconds !== null) {
        setClipEnd(timeInSeconds);
      } else {
        setEndTimeInput(formatTime(clipEnd));
      }
    }
  };

  const handleGenerateClip = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (clipStart !== null && clipEnd !== null && clipStart < clipEnd) {
      setShowPreview(true);
      setCopyButtonText('Copy');
      setCopyCommandButtonText('Copy');
    }
  }, [clipStart, clipEnd]);

  const handleReset = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setUrl('');
    setVideoId(null);
    setClipStart(null);
    setClipEnd(null);
    setError(null);
    setIsLoading(false);
    setShowPreview(false);
  }, []);
  
  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link).then(() => {
      setCopyButtonText('Copied!');
      setTimeout(() => setCopyButtonText('Copy'), 2000);
    });
  };

  const handleCopyCommand = (command: string) => {
    navigator.clipboard.writeText(command).then(() => {
      setCopyCommandButtonText('Copied!');
      setTimeout(() => setCopyCommandButtonText('Copy'), 2000);
    });
  };

  const canGenerate = clipStart !== null && clipEnd !== null && clipStart < clipEnd;
  const clipDuration = canGenerate ? clipEnd - clipStart : 0;
  const shareLink = canGenerate ? `https://www.youtube.com/watch?v=${videoId}&start=${Math.floor(clipStart)}&end=${Math.floor(clipEnd)}` : '';
  const shareText = "Check out this video clip I made!";

  const formattedStartTimeForCli = formatTimeForCli(clipStart);
  const formattedEndTimeForCli = formatTimeForCli(clipEnd);
  const videoUrlForCli = `https://www.youtube.com/watch?v=${videoId}`;
  const ytdlpCommand = `yt-dlp --download-sections "*${formattedStartTimeForCli}-${formattedEndTimeForCli}" "${videoUrlForCli}"`;


  return (
    <div className="min-h-screen text-gray-800 dark:text-gray-100 flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl mx-auto">
        <Header theme={theme} toggleTheme={toggleTheme}/>

        <main className="mt-8">
          <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-2xl border border-gray-300 dark:border-gray-700 transition-colors duration-300">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-grow">
                <label htmlFor="youtube-url" className="sr-only">
                  YouTube Video URL
                </label>
                <input
                  type="url"
                  id="youtube-url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Paste a YouTube video URL to begin..."
                  className="w-full bg-gray-200 dark:bg-gray-900 border border-gray-400 dark:border-gray-600 rounded-md py-3 px-4 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-colors duration-300"
                  disabled={!!videoId}
                />
              </div>
              {!videoId ? (
                <button
                  onClick={handleLoadVideo}
                  disabled={isLoading || !url}
                  className="flex items-center justify-center bg-brand-blue hover:bg-brand-blue-light text-white font-bold py-3 px-4 rounded-md transition-all duration-300 ease-in-out transform hover:scale-105 disabled:bg-gray-500 disabled:cursor-not-allowed"
                >
                  <LoadIcon className="w-5 h-5 mr-2" />
                  {isLoading ? 'Loading...' : 'Load Video'}
                </button>
              ) : (
                 <button
                  onClick={handleReset}
                  className="flex items-center justify-center bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-md transition-all duration-300 ease-in-out transform hover:scale-105"
                >
                  <ResetIcon className="w-5 h-5 mr-2" />
                  Reset
                </button>
              )}
            </div>
            {error && <p className="mt-4 text-red-600 dark:text-red-400 text-center transition-colors duration-300">{error}</p>}
          </div>

          <div className="mt-8">
            {isLoading && (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-brand-blue"></div>
              </div>
            )}
            
            {videoId && (
              <>
                <div className="bg-black dark:bg-gray-900 rounded-2xl overflow-hidden shadow-2xl border border-gray-300 dark:border-gray-700 transition-colors duration-300">
                  <VideoPlayer videoId={videoId} ref={playerRef} theme={theme} />
                </div>
                
                <div className="mt-6 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl shadow-2xl border border-gray-300 dark:border-gray-700 transition-colors duration-300">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
                        <div className="flex flex-col items-center">
                            <button onClick={handleSetStart} disabled={showPreview} className="flex items-center justify-center w-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-bold py-3 px-4 rounded-md transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
                                <SetTimeIcon className="w-5 h-5 mr-2" />
                                Set Start
                            </button>
                            <div className="mt-2 flex items-center justify-center gap-2" style={{minHeight: '44px'}}>
                                {!isEditingStart ? (
                                    <>
                                        <p className="w-32 text-center text-2xl font-mono tracking-wider text-green-600 dark:text-green-400">{formatTime(clipStart)}</p>
                                        <button onClick={() => !showPreview && setIsEditingStart(true)} className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed" disabled={showPreview} aria-label="Edit start time">
                                            <PencilIcon className="w-5 h-5" />
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <input type="text" value={startTimeInput} onChange={(e) => handleTimeInputChange(e, 'start')} onBlur={() => { handleTimeInputBlur('start'); setIsEditingStart(false); }} onKeyDown={(e) => { if (e.key === 'Enter') { handleTimeInputBlur('start'); setIsEditingStart(false); } else if (e.key === 'Escape') { setStartTimeInput(formatTime(clipStart)); setIsEditingStart(false); }}} placeholder="00:00" className="w-32 text-center bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md py-1 px-2 text-2xl font-mono tracking-wider text-green-600 dark:text-green-400 focus:ring-2 focus:ring-brand-blue" autoFocus />
                                        <button onClick={() => { handleTimeInputBlur('start'); setIsEditingStart(false); }} className="p-1 rounded-full text-green-500 hover:bg-green-100 dark:hover:bg-green-900/50" aria-label="Save start time">
                                            <CheckIcon className="w-6 h-6" />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col items-center">
                            <button onClick={handleGenerateClip} disabled={!canGenerate || showPreview} className="flex items-center justify-center w-full bg-brand-blue hover:bg-brand-blue-light text-white font-bold py-3 px-4 rounded-md transition-colors duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed disabled:opacity-50">
                                <ScissorsIcon className="w-5 h-5 mr-2" />
                                Generate Clip
                            </button>
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
                                {canGenerate ? `Duration: ${Math.round(clipEnd! - clipStart!)}s` : 'Set start & end'}
                            </p>
                        </div>
                        
                        <div className="flex flex-col items-center">
                            <button onClick={handleSetEnd} disabled={showPreview} className="flex items-center justify-center w-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-bold py-3 px-4 rounded-md transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
                                <SetTimeIcon className="w-5 h-5 mr-2" />
                                Set End
                            </button>
                            <div className="mt-2 flex items-center justify-center gap-2" style={{minHeight: '44px'}}>
                                {!isEditingEnd ? (
                                    <>
                                        <p className="w-32 text-center text-2xl font-mono tracking-wider text-red-600 dark:text-red-400">{formatTime(clipEnd)}</p>
                                        <button onClick={() => !showPreview && setIsEditingEnd(true)} className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed" disabled={showPreview} aria-label="Edit end time">
                                            <PencilIcon className="w-5 h-5" />
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <input type="text" value={endTimeInput} onChange={(e) => handleTimeInputChange(e, 'end')} onBlur={() => { handleTimeInputBlur('end'); setIsEditingEnd(false); }} onKeyDown={(e) => { if (e.key === 'Enter') { handleTimeInputBlur('end'); setIsEditingEnd(false); } else if (e.key === 'Escape') { setEndTimeInput(formatTime(clipEnd)); setIsEditingEnd(false); }}} placeholder="00:00" className="w-32 text-center bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md py-1 px-2 text-2xl font-mono tracking-wider text-red-600 dark:text-red-400 focus:ring-2 focus:ring-brand-blue" autoFocus />
                                        <button onClick={() => { handleTimeInputBlur('end'); setIsEditingEnd(false); }} className="p-1 rounded-full text-green-500 hover:bg-green-100 dark:hover:bg-green-900/50" aria-label="Save end time">
                                            <CheckIcon className="w-6 h-6" />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                     {clipStart !== null && clipEnd !== null && !canGenerate && (
                         <p className="mt-4 text-yellow-500 dark:text-yellow-400 text-center text-sm transition-colors duration-300">End time must be after start time.</p>
                     )}
                </div>
              </>
            )}

            {showPreview && canGenerate && videoId && (
                <div className="mt-10 animate-fade-in">
                    <div className="flex flex-col sm:flex-row justify-center items-center text-center mb-4 gap-2 sm:gap-4">
                        <h3 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-blue-500 dark:from-green-400 dark:to-blue-400">
                            Your Clip
                        </h3>
                        <span className="font-mono text-lg text-gray-500 dark:text-gray-400 bg-gray-200/50 dark:bg-gray-800/50 px-3 py-1 rounded-md border border-gray-300 dark:border-gray-700 transition-colors duration-300">
                           {formatTime(clipDuration)}
                        </span>
                    </div>
                    <div className="bg-black dark:bg-gray-900 rounded-2xl overflow-hidden shadow-2xl border border-gray-300 dark:border-gray-700 transition-colors duration-300">
                        <VideoPlayer 
                            videoId={videoId} 
                            start={clipStart!}
                            end={clipEnd!}
                            theme={theme}
                        />
                    </div>
                    <div className="mt-6 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl shadow-2xl border border-gray-300 dark:border-gray-700 transition-colors duration-300">
                        <h4 className="text-lg font-semibold text-center text-gray-700 dark:text-gray-200 transition-colors duration-300">Share Your Clip</h4>
                        <div className="mt-4 flex flex-col sm:flex-row gap-2">
                            <input type="text" readOnly value={shareLink} className="flex-grow bg-gray-200 dark:bg-gray-900 border border-gray-400 dark:border-gray-600 rounded-md py-2 px-3 text-gray-600 dark:text-gray-300 focus:outline-none transition-colors duration-300"/>
                            <button onClick={(e) => { e.preventDefault(); handleCopyLink(shareLink); }} className="flex items-center justify-center bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-bold py-2 px-4 rounded-md transition-colors duration-300">
                                <CopyIcon className="w-5 h-5 mr-2" />
                                {copyButtonText}
                            </button>
                        </div>
                         <div className="mt-4 flex justify-center items-center gap-4">
                            <button onClick={(e) => { e.preventDefault(); setIsDownloadModalOpen(true); }} aria-label="Download clip" className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-300">
                                <DownloadIcon className="w-6 h-6" />
                            </button>
                            <button onClick={(e) => { e.preventDefault(); setIsDownloadModalOpen(true); }} aria-label="Share on TikTok" className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-300">
                                <TikTokIcon className="w-6 h-6"/>
                            </button>
                            <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareLink)}&text=${encodeURIComponent(shareText)}`} target="_blank" rel="noopener noreferrer" aria-label="Share on X" className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-300"><TwitterIcon className="w-6 h-6"/></a>
                            <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareLink)}`} target="_blank" rel="noopener noreferrer" aria-label="Share on Facebook" className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-300"><FacebookIcon className="w-6 h-6"/></a>
                            <a href={`https://www.reddit.com/submit?url=${encodeURIComponent(shareLink)}&title=${encodeURIComponent(shareText)}`} target="_blank" rel="noopener noreferrer" aria-label="Share on Reddit" className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-300"><RedditIcon className="w-6 h-6"/></a>
                            <a href={`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + shareLink)}`} target="_blank" rel="noopener noreferrer" aria-label="Share on WhatsApp" className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-300"><WhatsAppIcon className="w-6 h-6"/></a>
                             <a href={`mailto:?subject=${encodeURIComponent(shareText)}&body=${encodeURIComponent('I thought you might like this clip: ' + shareLink)}`} aria-label="Share by Email" className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-300"><MailIcon className="w-6 h-6"/></a>
                        </div>
                    </div>
                </div>
            )}
            
            {!isLoading && !videoId && (
                <div className="text-center mt-8 py-16 px-6 bg-gray-200/30 dark:bg-gray-800/30 rounded-2xl border-2 border-dashed border-gray-400 dark:border-gray-700 transition-colors duration-300">
                    <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 transition-colors duration-300">Load a video to start clipping</h3>
                    <p className="mt-2 text-gray-500">Paste a YouTube URL above and click "Load Video".</p>
                </div>
            )}
          </div>
        </main>
      </div>

      {isDownloadModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setIsDownloadModalOpen(false)}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 sm:p-8 w-11/12 max-w-2xl m-4 border border-gray-300 dark:border-gray-700 transition-colors duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">How to Download Your Clip</h3>
              <button 
                onClick={(e) => { e.preventDefault(); setIsDownloadModalOpen(false); }} 
                className="p-2 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-gray-400 transition-colors duration-300"
                aria-label="Close download instructions"
              >
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4 text-gray-600 dark:text-gray-300 transition-colors duration-300">
              <p>
                Direct video downloads are not possible from this tool. However, you can use the clip link with a third-party YouTube downloader service or a command-line tool.
              </p>
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
                  <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-200">Option 1: Use the Clip Link</h4>
                  <ol className="list-decimal list-inside space-y-2 pl-2 mt-2">
                    <li>Copy the unique link for your clip below.</li>
                    <li>Visit a YouTube downloader website and paste the link.</li>
                    <li>Follow their instructions to download the video segment.</li>
                  </ol>
                  <div className="mt-4 flex flex-col sm:flex-row gap-2">
                      <input type="text" readOnly value={shareLink} className="flex-grow bg-gray-200 dark:bg-gray-900 border border-gray-400 dark:border-gray-600 rounded-md py-2 px-3 text-gray-600 dark:text-gray-300 focus:outline-none transition-colors duration-300"/>
                      <button onClick={(e) => { e.preventDefault(); handleCopyLink(shareLink); }} className="flex items-center justify-center bg-brand-blue hover:bg-brand-blue-light text-white font-bold py-2 px-4 rounded-md transition-colors duration-300">
                          <CopyIcon className="w-5 h-5 mr-2" />
                          {copyButtonText}
                      </button>
                  </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
                <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-200">Option 2: Command Line (yt-dlp)</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    For advanced users, use the <a href="https://github.com/yt-dlp/yt-dlp" target="_blank" rel="noopener noreferrer" className="text-brand-blue hover:underline">yt-dlp</a> tool. Paste this command into your terminal:
                </p>
                <div className="mt-4 flex flex-col sm:flex-row gap-2">
                    <input 
                        type="text" 
                        readOnly 
                        value={ytdlpCommand} 
                        className="flex-grow bg-gray-200 dark:bg-gray-900 border border-gray-400 dark:border-gray-600 rounded-md py-2 px-3 text-gray-600 dark:text-gray-300 focus:outline-none font-mono text-sm"
                    />
                    <button 
                        onClick={(e) => { e.preventDefault(); handleCopyCommand(ytdlpCommand); }}
                        className="flex items-center justify-center bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-bold py-2 px-4 rounded-md transition-colors duration-300"
                    >
                        <CopyIcon className="w-5 h-5 mr-2" />
                        {copyCommandButtonText}
                    </button>
                </div>
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400 pt-4 transition-colors duration-300">
                <strong>Disclaimer:</strong> Please be cautious when using third-party download services. Ensure you have the rights to download and use the content.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;