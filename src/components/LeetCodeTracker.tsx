'use client';

import React, { useState, useMemo } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  AlertCircle, 
  ExternalLink, 
  Plus, 
  Search, 
  Filter, 
  ChevronDown, 
  ChevronUp, 
  Code2, 
  Sparkles, 
  Trash2,
  Edit3
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { LeetCodeProblem, Difficulty, ProblemStatus } from '@/types';

interface LeetCodeTrackerProps {
  problems: LeetCodeProblem[];
  onUpdateProblem: (updated: LeetCodeProblem) => void;
  onAddProblem: (problem: LeetCodeProblem) => void;
  onDeleteProblem: (id: string) => void;
  isStealth: boolean;
}

export const LeetCodeTracker: React.FC<LeetCodeTrackerProps> = ({
  problems,
  onUpdateProblem,
  onAddProblem,
  onDeleteProblem,
  isStealth,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [expandedProblemId, setExpandedProblemId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // New problem form state
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newDifficulty, setNewDifficulty] = useState<Difficulty>('Medium');
  const [newCategory, setNewCategory] = useState('Arrays & Hashing');
  const [newPattern, setNewPattern] = useState('');
  const [newNotes, setNewNotes] = useState('');

  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    problems.forEach(p => set.add(p.category));
    return ['All', ...Array.from(set)];
  }, [problems]);

  // Filtered problems
  const filteredProblems = useMemo(() => {
    return problems.filter(p => {
      const matchesSearch = 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.pattern.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.notes && p.notes.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
      const matchesDiff = selectedDifficulty === 'All' || p.difficulty === selectedDifficulty;
      const matchesStat = selectedStatus === 'All' || p.status === selectedStatus;

      return matchesSearch && matchesCat && matchesDiff && matchesStat;
    });
  }, [problems, searchQuery, selectedCategory, selectedDifficulty, selectedStatus]);

  // Statistics
  const stats = useMemo(() => {
    const total = problems.length;
    const solved = problems.filter(p => p.status === 'solved').length;
    const inProgress = problems.filter(p => p.status === 'in_progress').length;
    const review = problems.filter(p => p.status === 'review').length;
    const easyCount = problems.filter(p => p.difficulty === 'Easy' && p.status === 'solved').length;
    const medCount = problems.filter(p => p.difficulty === 'Medium' && p.status === 'solved').length;
    const hardCount = problems.filter(p => p.difficulty === 'Hard' && p.status === 'solved').length;

    return { total, solved, inProgress, review, easyCount, medCount, hardCount };
  }, [problems]);

  const handleStatusChange = (problem: LeetCodeProblem, nextStatus: ProblemStatus) => {
    if (nextStatus === 'solved' && problem.status !== 'solved') {
      try {
        confetti({
          particleCount: 75,
          spread: 60,
          origin: { y: 0.7 },
        });
      } catch {
        // Safe fallback if canvas not available
      }
    }
    onUpdateProblem({
      ...problem,
      status: nextStatus,
      lastReviewed: new Date().toISOString().split('T')[0],
    });
  };

  const handleCreateProblem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const slug = newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const cleanUrl = newUrl.trim() || `https://leetcode.com/problems/${slug}/`;

    const newProb: LeetCodeProblem = {
      id: `lc-custom-${Date.now()}`,
      title: newTitle.trim(),
      slug,
      url: cleanUrl,
      difficulty: newDifficulty,
      category: newCategory,
      pattern: newPattern.trim() || 'General Algorithm',
      status: 'todo',
      notes: newNotes.trim(),
      lastReviewed: new Date().toISOString().split('T')[0],
    };

    onAddProblem(newProb);
    setNewTitle('');
    setNewUrl('');
    setNewPattern('');
    setNewNotes('');
    setShowAddModal(false);
  };

  const difficultyColor = (diff: Difficulty) => {
    switch (diff) {
      case 'Easy':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'Medium':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'Hard':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
    }
  };

  const statusBadge = (status: ProblemStatus) => {
    switch (status) {
      case 'solved':
        return {
          icon: CheckCircle2,
          label: isStealth ? 'Validated' : 'Solved',
          color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
        };
      case 'in_progress':
        return {
          icon: Clock,
          label: isStealth ? 'In Review' : 'In Progress',
          color: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
        };
      case 'review':
        return {
          icon: AlertCircle,
          label: isStealth ? 'Needs Optimization' : 'Review Needed',
          color: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
        };
      case 'todo':
      default:
        return {
          icon: Circle,
          label: isStealth ? 'Pending' : 'To Do',
          color: 'text-zinc-400 border-zinc-700 bg-zinc-800/40',
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Metrics Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">
              {isStealth ? 'Total Algorithm Modules' : 'Total Problems'}
            </span>
            <span className="text-xs text-zinc-500 font-mono">100% Target</span>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-zinc-100">{stats.total}</span>
            <span className="text-xs text-emerald-400 font-medium">
              {Math.round((stats.solved / (stats.total || 1)) * 100)}% complete
            </span>
          </div>
          <div className="mt-3 w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
              style={{ width: `${(stats.solved / (stats.total || 1)) * 100}%` }}
            />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-400">
              {isStealth ? 'Verified & Completed' : 'Solved'}
            </span>
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-emerald-400">{stats.solved}</span>
            <span className="text-xs text-zinc-400">/ {stats.total}</span>
          </div>
          <div className="mt-2 text-[11px] text-zinc-500 flex space-x-2">
            <span>Easy: {stats.easyCount}</span>
            <span>•</span>
            <span>Med: {stats.medCount}</span>
            <span>•</span>
            <span>Hard: {stats.hardCount}</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-blue-400">
              {isStealth ? 'Active Implementation' : 'In Progress'}
            </span>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-blue-400">{stats.inProgress}</span>
            <span className="text-xs text-zinc-400">currently working</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-amber-400">
              {isStealth ? 'Requires Review' : 'Spaced Repetition'}
            </span>
            <AlertCircle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-amber-400">{stats.review}</span>
            <span className="text-xs text-zinc-400">needs review</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={isStealth ? "Search algorithm specifications..." : "Search problems, patterns, or notes..."}
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-zinc-800/80 border border-zinc-700 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            <select
              value={selectedDifficulty}
              onChange={e => setSelectedDifficulty(e.target.value)}
              className="px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-xs text-zinc-300 focus:outline-none focus:border-blue-500"
            >
              <option value="All">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>

            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-xs text-zinc-300 focus:outline-none focus:border-blue-500"
            >
              <option value="All">All Statuses</option>
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="solved">Solved</option>
              <option value="review">Needs Review</option>
            </select>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>{isStealth ? 'Add Spec' : 'Add Problem'}</span>
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

      {/* Problem List */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 overflow-hidden">
        {filteredProblems.length === 0 ? (
          <div className="text-center py-12 text-zinc-500 text-sm">
            No problems match your current search/filter criteria.
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/60">
            {filteredProblems.map(problem => {
              const isExpanded = expandedProblemId === problem.id;
              const badge = statusBadge(problem.status);
              const BadgeIcon = badge.icon;

              return (
                <div key={problem.id} className="transition-colors hover:bg-zinc-800/30">
                  <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                    {/* Left: Status Toggle & Title */}
                    <div className="flex items-start space-x-3">
                      <button
                        onClick={() => {
                          const next: ProblemStatus = 
                            problem.status === 'solved' ? 'todo' : 'solved';
                          handleStatusChange(problem, next);
                        }}
                        className="mt-0.5 text-zinc-400 hover:text-emerald-400 transition-colors"
                        title="Click to toggle Solved status"
                      >
                        {problem.status === 'solved' ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <Circle className="w-5 h-5 text-zinc-600 hover:text-zinc-400" />
                        )}
                      </button>

                      <div>
                        <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                          <a
                            href={problem.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-zinc-100 hover:text-blue-400 transition-colors flex items-center space-x-1.5"
                          >
                            <span>{problem.title}</span>
                            <ExternalLink className="w-3.5 h-3.5 text-zinc-500 hover:text-blue-400" />
                          </a>

                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${difficultyColor(problem.difficulty)}`}>
                            {problem.difficulty}
                          </span>

                          <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                            {problem.category}
                          </span>

                          <span className="text-[10px] px-2 py-0.5 rounded bg-blue-950/40 text-blue-300 border border-blue-800/40">
                            {problem.pattern}
                          </span>
                        </div>

                        {/* Subtitle with complexity */}
                        <div className="mt-1 flex items-center space-x-3 text-xs text-zinc-400">
                          {problem.timeComplexity && (
                            <span className="font-mono">Time: {problem.timeComplexity}</span>
                          )}
                          {problem.spaceComplexity && (
                            <span className="font-mono">Space: {problem.spaceComplexity}</span>
                          )}
                          {problem.notes && (
                            <span className="truncate max-w-xs text-zinc-500 italic">
                              &ldquo;{problem.notes}&rdquo;
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Status Selector & Actions */}
                    <div className="flex items-center space-x-2 self-end md:self-center">
                      <select
                        value={problem.status}
                        onChange={e => handleStatusChange(problem, e.target.value as ProblemStatus)}
                        className={`text-xs px-2.5 py-1 rounded-md border font-medium bg-zinc-900 focus:outline-none ${badge.color}`}
                      >
                        <option value="todo">To Do</option>
                        <option value="in_progress">In Progress</option>
                        <option value="solved">Solved</option>
                        <option value="review">Needs Review</option>
                      </select>

                      <button
                        onClick={() => setExpandedProblemId(isExpanded ? null : problem.id)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
                        title="View notes and solution template"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>

                      {problem.id.startsWith('lc-custom') && (
                        <button
                          onClick={() => onDeleteProblem(problem.id)}
                          className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 transition-colors"
                          title="Delete custom problem"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expanded Notes & Code Section */}
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-1 bg-zinc-950/40 border-t border-zinc-800/60 space-y-3">
                      <div>
                        <label className="text-xs font-medium text-zinc-400 flex items-center space-x-1 mb-1">
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Key Intuition & Edge Cases:</span>
                        </label>
                        <textarea
                          rows={2}
                          value={problem.notes || ''}
                          onChange={e => onUpdateProblem({ ...problem, notes: e.target.value })}
                          placeholder="Note down edge cases (empty array, single element, negative numbers, overflow)..."
                          className="w-full text-xs p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-blue-500 font-mono"
                        />
                      </div>

                      {problem.codeSnippet && (
                        <div>
                          <label className="text-xs font-medium text-zinc-400 flex items-center space-x-1 mb-1">
                            <Code2 className="w-3.5 h-3.5" />
                            <span>Optimal Implementation Template:</span>
                          </label>
                          <pre className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-mono text-emerald-300 overflow-x-auto whitespace-pre">
                            {problem.codeSnippet}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Custom Problem Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-base font-semibold text-zinc-100">
                {isStealth ? 'Register New Architecture Spec' : 'Add New LeetCode Problem'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-zinc-500 hover:text-zinc-300 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProblem} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  Problem Title *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g. Trapping Rain Water"
                  className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-sm text-zinc-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  LeetCode URL (Optional)
                </label>
                <input
                  type="url"
                  value={newUrl}
                  onChange={e => setNewUrl(e.target.value)}
                  placeholder="https://leetcode.com/problems/..."
                  className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-sm text-zinc-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Difficulty</label>
                  <select
                    value={newDifficulty}
                    onChange={e => setNewDifficulty(e.target.value as Difficulty)}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-xs text-zinc-200 focus:outline-none"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Category</label>
                  <input
                    type="text"
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value)}
                    placeholder="e.g. Two Pointers"
                    className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-xs text-zinc-200 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  Algorithmic Pattern
                </label>
                <input
                  type="text"
                  value={newPattern}
                  onChange={e => setNewPattern(e.target.value)}
                  placeholder="e.g. Monotonic Stack, Two Pointers"
                  className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-xs text-zinc-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  Key Intuition / Notes
                </label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={e => setNewNotes(e.target.value)}
                  placeholder="Summarize edge cases, optimal complexity..."
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
                  Save Problem
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

