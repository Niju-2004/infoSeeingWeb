'use client';

import React, { useState } from 'react';
import { 
  Play, 
  CheckCircle2, 
  Circle, 
  Clock, 
  ExternalLink, 
  Plus, 
  Search, 
  Video, 
  X, 
  Edit3, 
  Sparkles,
  Trash2
} from 'lucide-react';
import { YouTubeVideo, VideoTimestamp } from '@/types';

interface YouTubeHubProps {
  videos: YouTubeVideo[];
  onAddVideo: (video: YouTubeVideo) => void;
  onUpdateVideo: (video: YouTubeVideo) => void;
  onDeleteVideo: (id: string) => void;
  isStealth: boolean;
}

export const YouTubeHub: React.FC<YouTubeHubProps> = ({
  videos,
  onAddVideo,
  onUpdateVideo,
  onDeleteVideo,
  isStealth,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeVideo, setActiveVideo] = useState<YouTubeVideo | null>(null);
  const [currentTimestampSeconds, setCurrentTimestampSeconds] = useState<number | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Add form state
  const [newUrl, setNewUrl] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newChannel, setNewChannel] = useState('');
  const [newCategory, setNewCategory] = useState('Dynamic Programming');
  const [newDescription, setNewDescription] = useState('');

  // Extract all categories
  const categories = React.useMemo(() => {
    const set = new Set<string>();
    videos.forEach(v => set.add(v.category));
    return ['All', ...Array.from(set)];
  }, [videos]);

  const filteredVideos = videos.filter(v => {
    const matchesSearch =
      v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.channel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.description && v.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (v.notes && v.notes.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCat = selectedCategory === 'All' || v.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const extractVideoId = (url: string): string | null => {
    const match = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i);
    return match ? match[1] : null;
  };

  const handleCreateVideo = (e: React.FormEvent) => {
    e.preventDefault();
    const videoId = extractVideoId(newUrl);
    if (!videoId) {
      alert('Please enter a valid YouTube URL (e.g. https://www.youtube.com/watch?v=...)');
      return;
    }

    const video: YouTubeVideo = {
      id: `yt-custom-${Date.now()}`,
      videoId,
      title: newTitle.trim() || `YouTube Lecture (${videoId})`,
      channel: newChannel.trim() || 'Tech Educator',
      category: newCategory,
      url: newUrl.trim(),
      description: newDescription.trim(),
      timestamps: [],
      notes: '',
      completed: false,
      addedAt: new Date().toISOString().split('T')[0],
    };

    onAddVideo(video);
    setNewUrl('');
    setNewTitle('');
    setNewChannel('');
    setNewDescription('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header and Filter Controls */}
      <div className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={isStealth ? "Search architecture briefings..." : "Search video lectures, channels, notes..."}
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-zinc-800/80 border border-zinc-700 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>{isStealth ? 'Add Architecture Talk' : 'Add YouTube Video'}</span>
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex gap-1.5 overflow-x-auto pt-1 pb-0.5 scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-md text-xs whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-zinc-200 text-zinc-900 font-medium'
                  : 'bg-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/80'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Videos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        {filteredVideos.map(video => (
          <div
            key={video.id}
            className="flex flex-col justify-between p-5 rounded-xl border border-zinc-800/80 bg-zinc-900/50 hover:border-zinc-700 hover:bg-zinc-900/80 transition-all group"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <div className="p-2 rounded-lg bg-red-500/10 text-rose-400 border border-rose-500/20">
                    <Video className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-medium text-zinc-300">{video.channel}</span>
                    <span className="block text-[10px] text-zinc-500">Added: {video.addedAt}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                    {video.category}
                  </span>

                  <button
                    onClick={() => onUpdateVideo({ ...video, completed: !video.completed })}
                    className="text-zinc-500 hover:text-emerald-400 transition-colors"
                    title="Toggle watched status"
                  >
                    {video.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Circle className="w-5 h-5 text-zinc-600 hover:text-zinc-400" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-zinc-100 text-sm group-hover:text-blue-400 transition-colors line-clamp-2">
                  {video.title}
                </h4>
                {video.description && (
                  <p className="mt-1 text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                    {video.description}
                  </p>
                )}
              </div>

              {/* Timestamps Preview */}
              {video.timestamps.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500">
                    Key Timestamps:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {video.timestamps.slice(0, 3).map(ts => (
                      <button
                        key={ts.id}
                        onClick={() => {
                          setActiveVideo(video);
                          setCurrentTimestampSeconds(ts.seconds);
                        }}
                        className="flex items-center space-x-1 px-2 py-0.5 rounded bg-zinc-800/90 text-zinc-300 hover:bg-blue-900/40 hover:text-blue-200 border border-zinc-700 text-[11px] transition-colors"
                      >
                        <Clock className="w-3 h-3 text-blue-400" />
                        <span className="font-mono">{ts.displayTime}</span>
                        <span className="truncate max-w-[120px]">{ts.label}</span>
                      </button>
                    ))}
                    {video.timestamps.length > 3 && (
                      <span className="text-[10px] text-zinc-500 self-center">
                        +{video.timestamps.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {video.notes && (
                <div className="p-2 rounded bg-zinc-950/60 border border-zinc-800/60 text-[11px] text-zinc-400 italic line-clamp-2">
                  &ldquo;{video.notes}&rdquo;
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-zinc-800/60 flex items-center justify-between">
              <span className={`text-[11px] font-medium ${video.completed ? 'text-emerald-400' : 'text-zinc-500'}`}>
                {video.completed ? '✓ Completed' : 'Pending Study'}
              </span>

              <div className="flex items-center space-x-2">
                {video.id.startsWith('yt-custom') && (
                  <button
                    onClick={() => onDeleteVideo(video.id)}
                    className="p-1.5 text-zinc-500 hover:text-rose-400 transition-colors"
                    title="Remove video"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}

                <a
                  href={video.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
                  title="Open in YouTube (External)"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  onClick={() => {
                    setActiveVideo(video);
                    setCurrentTimestampSeconds(null);
                  }}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-medium transition-colors"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Watch Distraction-Free</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Video Player Modal with Timestamped Notes */}
      {activeVideo && (
        <div className="fixed inset-0 z-50 flex flex-col bg-zinc-950/95 backdrop-blur-md">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-800 bg-zinc-900">
            <div className="flex items-center space-x-3">
              <div className="p-1.5 rounded bg-rose-500/20 text-rose-400">
                <Video className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-zinc-100 truncate max-w-md">
                  {isStealth ? 'Engineering Talk: ' : ''}{activeVideo.title}
                </h3>
                <span className="text-[10px] text-zinc-400 font-mono">
                  Channel: {activeVideo.channel} • Privacy-Enhanced Embed (youtube-nocookie)
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => {
                  const updated = { ...activeVideo, completed: !activeVideo.completed };
                  setActiveVideo(updated);
                  onUpdateVideo(updated);
                }}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                  activeVideo.completed
                    ? 'bg-emerald-600 text-white border-emerald-500'
                    : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{activeVideo.completed ? 'Completed' : 'Mark Complete'}</span>
              </button>

              <button
                onClick={() => {
                  setActiveVideo(null);
                  setCurrentTimestampSeconds(null);
                }}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Player & Notes Layout */}
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            {/* Left: YouTube Iframe Embed */}
            <div className="flex-1 bg-black flex items-center justify-center p-2">
              <div className="w-full h-full max-h-[85vh] aspect-video">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${activeVideo.videoId}?rel=0&modestbranding=1${
                    currentTimestampSeconds ? `&start=${currentTimestampSeconds}&autoplay=1` : ''
                  }`}
                  title={activeVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full rounded-lg border border-zinc-800"
                />
              </div>
            </div>

            {/* Right: Notes & Timestamps */}
            <div className="w-full lg:w-96 flex flex-col border-t lg:border-t-0 lg:border-l border-zinc-800 bg-zinc-900/90 p-4 space-y-4 overflow-y-auto">
              {/* Timestamps Section */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-zinc-200 flex items-center space-x-1.5">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <span>Topic Timestamps</span>
                </h4>
                
                {activeVideo.timestamps.length === 0 ? (
                  <p className="text-xs text-zinc-500 italic">No timestamps defined for this video.</p>
                ) : (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {activeVideo.timestamps.map(ts => (
                      <button
                        key={ts.id}
                        onClick={() => setCurrentTimestampSeconds(ts.seconds)}
                        className={`w-full flex items-center justify-between p-2 rounded-lg border text-left text-xs transition-colors ${
                          currentTimestampSeconds === ts.seconds
                            ? 'bg-blue-600/20 border-blue-500/50 text-blue-200'
                            : 'bg-zinc-800/60 border-zinc-750 text-zinc-300 hover:bg-zinc-800'
                        }`}
                      >
                        <span className="truncate pr-2">{ts.label}</span>
                        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-zinc-900 text-blue-400">
                          {ts.displayTime}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Lecture Notes */}
              <div className="flex-1 flex flex-col space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-zinc-200 flex items-center space-x-1.5">
                    <Edit3 className="w-4 h-4 text-emerald-400" />
                    <span>Lecture Notes & Key Takeaways</span>
                  </h4>
                  <span className="text-[10px] text-zinc-500 font-mono">Auto-saved</span>
                </div>

                <textarea
                  value={activeVideo.notes || ''}
                  onChange={e => {
                    const updated = { ...activeVideo, notes: e.target.value };
                    setActiveVideo(updated);
                    onUpdateVideo(updated);
                  }}
                  placeholder="Record algorithms, formulas, or system design insights discussed in this lecture..."
                  className="flex-1 min-h-[140px] w-full p-3 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-blue-500 resize-none font-mono leading-relaxed"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Video Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-base font-semibold text-zinc-100">
                {isStealth ? 'Register Architecture Recording' : 'Add YouTube Study Video'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-zinc-500 hover:text-zinc-300 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateVideo} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  YouTube URL *
                </label>
                <input
                  type="url"
                  required
                  value={newUrl}
                  onChange={e => setNewUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=... or youtu.be/..."
                  className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-sm text-zinc-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g. Graph Algorithms Masterclass"
                  className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-sm text-zinc-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Channel Name</label>
                  <input
                    type="text"
                    value={newChannel}
                    onChange={e => setNewChannel(e.target.value)}
                    placeholder="e.g. NeetCode"
                    className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-xs text-zinc-200 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Category</label>
                  <input
                    type="text"
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value)}
                    placeholder="e.g. Dynamic Programming"
                    className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-xs text-zinc-200 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={e => setNewDescription(e.target.value)}
                  placeholder="Key concepts or topics covered..."
                  className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-xs text-zinc-200 focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 text-xs hover:bg-zinc-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium"
                >
                  Save Video
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

