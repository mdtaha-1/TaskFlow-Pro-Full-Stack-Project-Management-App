import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme, useAppData, Note } from '../App';
import { BookOpen, Plus, Search, Filter, Edit3, Star, Calendar, Brain, Sparkles, Tag, FileText, Save, Trash2 } from 'lucide-react';

const Notes: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { notes, addNote, updateNote, deleteNote } = useAppData();
  const [selectedNote, setSelectedNote] = useState<Note | null>(notes[0] || null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isEditing, setIsEditing] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingNote, setEditingNote] = useState<Partial<Note>>({});
  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    category: '',
    tags: [] as string[],
    starred: false,
    aiEnhanced: false
  });

  const categories = ['all', ...Array.from(new Set(notes.map(note => note.category)))];

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || note.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCreateNote = () => {
    if (newNote.title.trim() && newNote.content.trim() && newNote.category.trim()) {
      addNote({
        title: newNote.title,
        content: newNote.content,
        category: newNote.category,
        tags: newNote.tags,
        starred: newNote.starred,
        aiEnhanced: newNote.aiEnhanced
      });
      setNewNote({
        title: '',
        content: '',
        category: '',
        tags: [],
        starred: false,
        aiEnhanced: false
      });
      setShowCreateForm(false);
    }
  };

  const handleSaveNote = () => {
    if (selectedNote && editingNote.title?.trim() && editingNote.content?.trim()) {
      updateNote(selectedNote.id, editingNote);
      setSelectedNote({ ...selectedNote, ...editingNote });
      setIsEditing(false);
      setEditingNote({});
    }
  };

  const handleDeleteNote = (noteId: number) => {
    deleteNote(noteId);
    if (selectedNote?.id === noteId) {
      const remainingNotes = notes.filter(note => note.id !== noteId);
      setSelectedNote(remainingNotes[0] || null);
    }
  };

  const handleStarNote = (noteId: number) => {
    const note = notes.find(n => n.id === noteId);
    if (note) {
      updateNote(noteId, { starred: !note.starred });
      if (selectedNote?.id === noteId) {
        setSelectedNote({ ...selectedNote, starred: !note.starred });
      }
    }
  };

  const handleEditNote = () => {
    if (selectedNote) {
      setEditingNote({
        title: selectedNote.title,
        content: selectedNote.content,
        category: selectedNote.category,
        tags: selectedNote.tags
      });
      setIsEditing(true);
    }
  };

  const addTagToNewNote = (tag: string) => {
    if (tag.trim() && !newNote.tags.includes(tag.trim())) {
      setNewNote(prev => ({
        ...prev,
        tags: [...prev.tags, tag.trim()]
      }));
    }
  };

  const removeTagFromNewNote = (tagToRemove: string) => {
    setNewNote(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Smart Notes
          </h1>
          <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Organize and enhance your study notes with AI insights
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className={`px-4 py-2 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-orange-600" />
              <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {notes.length} notes
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-1 space-y-6"
        >
          <div className={`rounded-2xl p-6 border transition-all duration-300 ${
            isDarkMode 
              ? 'bg-gray-900 border-gray-800' 
              : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                My Notes
              </h2>
              <button 
                onClick={() => setShowCreateForm(true)}
                className="p-2 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <Search className={`w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-400'
                }`} />
                <input
                  type="text"
                  placeholder="Search notes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-3 py-3 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    isDarkMode 
                      ? 'bg-gray-800 border border-gray-700 text-white placeholder-gray-400' 
                      : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Filter className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm transition-all focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    isDarkMode 
                      ? 'bg-gray-800 border border-gray-700 text-white' 
                      : 'bg-gray-50 border border-gray-200 text-gray-900'
                  }`}
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className={`rounded-2xl border max-h-96 overflow-y-auto transition-all duration-300 ${
            isDarkMode 
              ? 'bg-gray-900 border-gray-800' 
              : 'bg-white border-gray-200'
          }`}>
            <div className="space-y-1 p-3">
              {filteredNotes.length > 0 ? filteredNotes.map((note, index) => (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => {
                    setSelectedNote(note);
                    setIsEditing(false);
                    setEditingNote({});
                  }}
                  className={`p-4 rounded-xl cursor-pointer transition-all ${
                    selectedNote?.id === note.id
                      ? isDarkMode
                        ? 'bg-orange-900/30 border-l-4 border-orange-500'
                        : 'bg-orange-50 border-l-4 border-orange-500'
                      : isDarkMode
                        ? 'hover:bg-gray-800'
                        : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className={`font-medium text-sm line-clamp-1 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {note.title}
                    </h3>
                    <div className="flex items-center space-x-1">
                      {note.starred && <Star className="w-3 h-3 text-yellow-500 fill-current" />}
                      {note.aiEnhanced && <Sparkles className="w-3 h-3 text-blue-500" />}
                    </div>
                  </div>
                  <p className={`text-xs line-clamp-2 mb-3 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {note.content}
                  </p>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {note.category}
                    </span>
                    <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                      {new Date(note.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {note.tags.slice(0, 2).map(tag => (
                      <span key={tag} className={`text-xs px-2 py-0.5 rounded-full ${
                        isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'
                      }`}>
                        #{tag}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )) : (
                <div className="text-center py-8">
                  <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    No notes found. Create your first note!
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-3"
        >
          {selectedNote ? (
            <div className={`rounded-2xl p-8 border transition-all duration-300 ${
              isDarkMode 
                ? 'bg-gray-900 border-gray-800' 
                : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                  {isEditing ? (
                    <input
                      type="text"
                      value={editingNote.title || ''}
                      onChange={(e) => setEditingNote(prev => ({ ...prev, title: e.target.value }))}
                      className={`text-2xl font-bold bg-transparent border-b-2 border-orange-500 focus:outline-none ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}
                    />
                  ) : (
                    <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {selectedNote.title}
                    </h1>
                  )}
                  {selectedNote.aiEnhanced && (
                    <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium ${
                      isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-800'
                    }`}>
                      <Brain className="w-3 h-3" />
                      <span>AI Enhanced</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-4">
                  <button 
                    onClick={() => handleStarNote(selectedNote.id)}
                    className={`p-2 transition-colors ${
                      selectedNote.starred 
                        ? 'text-yellow-500' 
                        : isDarkMode 
                          ? 'text-gray-400 hover:text-yellow-500' 
                          : 'text-gray-400 hover:text-yellow-500'
                    }`}
                  >
                    <Star className={`w-5 h-5 ${selectedNote.starred ? 'fill-current' : ''}`} />
                  </button>
                  {isEditing ? (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handleSaveNote}
                        className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                      >
                        <Save className="w-4 h-4" />
                        <span>Save</span>
                      </button>
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setEditingNote({});
                        }}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-800'
                        }`}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={handleEditNote}
                      className={`p-2 transition-colors ${
                        isDarkMode 
                          ? 'text-gray-400 hover:text-gray-200' 
                          : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  )}
                  <div className={`flex items-center space-x-2 text-sm ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(selectedNote.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3 mb-8">
                {isEditing ? (
                  <input
                    type="text"
                    value={editingNote.category || ''}
                    onChange={(e) => setEditingNote(prev => ({ ...prev, category: e.target.value }))}
                    placeholder="Category"
                    className={`px-4 py-2 rounded-full text-sm font-medium border ${
                      isDarkMode 
                        ? 'bg-gray-800 border-gray-700 text-orange-400' 
                        : 'bg-orange-100 border-orange-200 text-orange-800'
                    }`}
                  />
                ) : (
                  <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                    isDarkMode 
                      ? 'bg-orange-900/30 text-orange-400' 
                      : 'bg-orange-100 text-orange-800'
                  }`}>
                    {selectedNote.category}
                  </span>
                )}
                {(isEditing ? editingNote.tags || [] : selectedNote.tags).map(tag => (
                  <span key={tag} className={`flex items-center space-x-1 px-3 py-2 rounded-full text-xs ${
                    isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-600'
                  }`}>
                    <Tag className="w-3 h-3" />
                    <span>{tag}</span>
                  </span>
                ))}
              </div>

              <div className="mb-8">
                {isEditing ? (
                  <textarea
                    value={editingNote.content || ''}
                    onChange={(e) => setEditingNote(prev => ({ ...prev, content: e.target.value }))}
                    className={`w-full h-96 p-6 rounded-xl resize-none transition-all focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                      isDarkMode 
                        ? 'bg-gray-800 border border-gray-700 text-white' 
                        : 'bg-gray-50 border border-gray-200 text-gray-900'
                    }`}
                    placeholder="Start writing your notes..."
                  />
                ) : (
                  <div className={`prose prose-lg max-w-none p-6 rounded-xl ${
                    isDarkMode ? 'bg-gray-800 text-gray-200' : 'bg-gray-50 text-gray-800'
                  }`}>
                    <div className="whitespace-pre-wrap">
                      {selectedNote.content}
                    </div>
                  </div>
                )}
              </div>

              <div className={`flex items-center justify-between pt-6 border-t ${
                isDarkMode ? 'border-gray-800' : 'border-gray-200'
              }`}>
                <div className="flex items-center space-x-3">
                  <button className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-colors text-sm font-medium ${
                    isDarkMode 
                      ? 'bg-orange-900/30 text-orange-400 hover:bg-orange-900/50' 
                      : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                  }`}>
                    <Brain className="w-4 h-4" />
                    <span>AI Enhance</span>
                  </button>
                  <button className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-colors text-sm font-medium ${
                    isDarkMode 
                      ? 'bg-blue-900/30 text-blue-400 hover:bg-blue-900/50' 
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  }`}>
                    <FileText className="w-4 h-4" />
                    <span>Summarize</span>
                  </button>
                  <button className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-colors text-sm font-medium ${
                    isDarkMode 
                      ? 'bg-emerald-900/30 text-emerald-400 hover:bg-emerald-900/50' 
                      : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                  }`}>
                    <Sparkles className="w-4 h-4" />
                    <span>Create Flashcards</span>
                  </button>
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleDeleteNote(selectedNote.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-colors text-sm font-medium ${
                      isDarkMode 
                        ? 'text-red-400 hover:bg-red-900/20' 
                        : 'text-red-600 hover:bg-red-50'
                    }`}
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                  <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {selectedNote.content.length.toLocaleString()} characters
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className={`rounded-2xl p-12 border text-center transition-all duration-300 ${
              isDarkMode 
                ? 'bg-gray-900 border-gray-800' 
                : 'bg-white border-gray-200'
            }`}>
              <BookOpen className={`w-16 h-16 mx-auto mb-6 ${
                isDarkMode ? 'text-gray-600' : 'text-gray-400'
              }`} />
              <h3 className={`text-xl font-semibold mb-3 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                No notes yet
              </h3>
              <p className={`mb-6 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                Create your first note to start organizing your thoughts
              </p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl hover:from-orange-700 hover:to-red-700 transition-all font-medium"
              >
                Create Note
              </button>
            </div>
          )}
        </motion.div>
      </div>

      {showCreateForm && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl p-6 border transition-all duration-300 ${
            isDarkMode 
              ? 'bg-gray-900 border-gray-800' 
              : 'bg-white border-gray-200'
          }`}
        >
          <h3 className={`text-lg font-semibold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Create New Note
          </h3>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Title
                </label>
                <input
                  type="text"
                  value={newNote.title}
                  onChange={(e) => setNewNote(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter note title..."
                  className={`w-full p-3 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    isDarkMode 
                      ? 'bg-gray-800 border border-gray-700 text-white placeholder-gray-400' 
                      : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Category
                </label>
                <input
                  type="text"
                  value={newNote.category}
                  onChange={(e) => setNewNote(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="e.g., Biology, Math, History"
                  className={`w-full p-3 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    isDarkMode 
                      ? 'bg-gray-800 border border-gray-700 text-white placeholder-gray-400' 
                      : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Content
              </label>
              <textarea
                value={newNote.content}
                onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Start writing your note..."
                className={`w-full h-64 p-4 rounded-xl resize-none transition-all focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                  isDarkMode 
                    ? 'bg-gray-800 border border-gray-700 text-white placeholder-gray-400' 
                    : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Tags (press Enter to add)
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {newNote.tags.map(tag => (
                  <span 
                    key={tag}
                    className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm ${
                      isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    <span>#{tag}</span>
                    <button
                      onClick={() => removeTagFromNewNote(tag)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                placeholder="Add tags..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    addTagToNewNote(e.currentTarget.value);
                    e.currentTarget.value = '';
                  }
                }}
                className={`w-full p-3 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                  isDarkMode 
                    ? 'bg-gray-800 border border-gray-700 text-white placeholder-gray-400' 
                    : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-4 mt-8">
            <button
              onClick={() => set ShowCreateForm(false)}
              className={`px-6 py-3 rounded-xl transition-colors ${
                isDarkMode 
                  ? 'text-gray-400 hover:text-white' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Cancel
            </button>
            <button 
              onClick={handleCreateNote}
              disabled={!newNote.title.trim() || !newNote.content.trim() || !newNote.category.trim()}
              className="px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl hover:from-orange-700 hover:to-red-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Note
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Notes;