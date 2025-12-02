import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme, useAppData, Flashcard } from '../App';
import { Layers, Plus, RotateCcw, Check, X, Star, Brain, Trash2 } from 'lucide-react';

const Flashcards: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { flashcards, addFlashcard, updateFlashcard, deleteFlashcard } = useAppData();
  const [currentCard, setCurrentCard] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [newCard, setNewCard] = useState({
    front: '',
    back: '',
    category: '',
    difficulty: 1
  });

  const categories = ['all', ...Array.from(new Set(flashcards.map(card => card.category)))];
  const filteredCards = selectedCategory === 'all' 
    ? flashcards 
    : flashcards.filter(card => card.category === selectedCategory);

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentCard((prev) => (prev + 1) % filteredCards.length);
  };

  const handlePrevious = () => {
    setIsFlipped(false);
    setCurrentCard((prev) => (prev - 1 + filteredCards.length) % filteredCards.length);
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleCorrect = () => {
    if (filteredCards[currentCard]) {
      updateFlashcard(filteredCards[currentCard].id, {
        mastered: true,
        lastReviewed: new Date().toISOString()
      });
      handleNext();
    }
  };

  const handleIncorrect = () => {
    if (filteredCards[currentCard]) {
      updateFlashcard(filteredCards[currentCard].id, {
        mastered: false,
        lastReviewed: new Date().toISOString()
      });
      handleNext();
    }
  };

  const handleCreateCard = () => {
    if (newCard.front.trim() && newCard.back.trim() && newCard.category.trim()) {
      addFlashcard({
        front: newCard.front,
        back: newCard.back,
        category: newCard.category,
        difficulty: newCard.difficulty,
        mastered: false
      });
      setNewCard({ front: '', back: '', category: '', difficulty: 1 });
      setShowCreateForm(false);
    }
  };

  const handleDeleteCard = (cardId: number) => {
    deleteFlashcard(cardId);
    if (currentCard >= filteredCards.length - 1) {
      setCurrentCard(Math.max(0, filteredCards.length - 2));
    }
  };

  const getDifficultyColor = (difficulty: number) => {
    switch (difficulty) {
      case 1: return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 2: return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      case 3: return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getDifficultyText = (difficulty: number) => {
    switch (difficulty) {
      case 1: return 'Easy';
      case 2: return 'Medium';
      case 3: return 'Hard';
      default: return 'Unknown';
    }
  };

  const masteredCount = filteredCards.filter(card => card.mastered).length;
  const studyStreak = 7; // This would be calculated based on actual usage

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Smart Flashcards
          </h1>
          <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Master concepts with spaced repetition learning
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className={`px-4 py-2 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
            <div className="flex items-center space-x-2">
              <Brain className="w-4 h-4 text-purple-600" />
              <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {filteredCards.length} cards
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
          className="lg:col-span-3"
        >
          {filteredCards.length > 0 ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Card {currentCard + 1} of {filteredCards.length}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(filteredCards[currentCard]?.difficulty || 1)}`}>
                    {getDifficultyText(filteredCards[currentCard]?.difficulty || 1)}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    isDarkMode ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-700'
                  }`}>
                    {filteredCards[currentCard]?.category}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <select
                    value={selectedCategory}
                    onChange={(e) => {
                      setSelectedCategory(e.target.value);
                      setCurrentCard(0);
                      setIsFlipped(false);
                    }}
                    className={`px-3 py-2 rounded-lg text-sm transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 ${
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
                  <button
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-colors ${
                      isDarkMode 
                        ? 'bg-purple-900/30 text-purple-400 hover:bg-purple-900/50' 
                        : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                    <span className="font-medium">Add Card</span>
                  </button>
                </div>
              </div>

              <motion.div
                className="relative h-96 mx-auto max-w-3xl"
                style={{ perspective: 1000 }}
              >
                <motion.div
                  className="absolute inset-0 w-full h-full cursor-pointer"
                  onClick={handleFlip}
                  animate={{ rotateY: isFlipped ? 180 : 0 }}
                  transition={{ duration: 0.6 }}
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  {/* Front of card */}
                  <div
                    className={`absolute inset-0 w-full h-full rounded-2xl border flex items-center justify-center p-8 transition-all duration-300 ${
                      isDarkMode 
                        ? 'bg-gray-900 border-gray-800' 
                        : 'bg-white border-gray-200'
                    }`}
                    style={{ backfaceVisibility: 'hidden' }}
                  >
                    <div className="text-center">
                      <h3 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {filteredCards[currentCard]?.front}
                      </h3>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Click to reveal answer
                      </p>
                    </div>
                  </div>

                  {/* Back of card */}
                  <div
                    className={`absolute inset-0 w-full h-full rounded-2xl border flex items-center justify-center p-8 transition-all duration-300 ${
                      isDarkMode 
                        ? 'bg-gradient-to-br from-purple-900/50 to-indigo-900/50 border-purple-700/50' 
                        : 'bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200'
                    }`}
                    style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                  >
                    <div className="text-center">
                      <p className={`text-lg leading-relaxed ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                        {filteredCards[currentCard]?.back}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>

              <div className="flex items-center justify-center space-x-8">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handlePrevious}
                  disabled={filteredCards.length <= 1}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-colors disabled:opacity-50 ${
                    isDarkMode 
                      ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  <RotateCcw className="w-4 h-4" />
                  <span className="font-medium">Previous</span>
                </motion.button>

                <div className="flex space-x-4">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleIncorrect}
                    className="p-4 bg-red-100 hover:bg-red-200 text-red-600 rounded-full transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleCorrect}
                    className="p-4 bg-emerald-100 hover:bg-emerald-200 text-emerald-600 rounded-full transition-colors"
                  >
                    <Check className="w-6 h-6" />
                  </motion.button>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleNext}
                  disabled={filteredCards.length <= 1}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-colors disabled:opacity-50 ${
                    isDarkMode 
                      ? 'bg-purple-900/30 hover:bg-purple-900/50 text-purple-400' 
                      : 'bg-purple-100 hover:bg-purple-200 text-purple-700'
                  }`}
                >
                  <span className="font-medium">Next</span>
                  <RotateCcw className="w-4 h-4 rotate-180" />
                </motion.button>
              </div>

              {filteredCards[currentCard] && (
                <div className="flex justify-center">
                  <button
                    onClick={() => handleDeleteCard(filteredCards[currentCard].id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                      isDarkMode 
                        ? 'text-red-400 hover:bg-red-900/20' 
                        : 'text-red-600 hover:bg-red-50'
                    }`}
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="text-sm">Delete Card</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className={`rounded-2xl p-12 border text-center transition-all duration-300 ${
              isDarkMode 
                ? 'bg-gray-900 border-gray-800' 
                : 'bg-white border-gray-200'
            }`}>
              <Layers className={`w-16 h-16 mx-auto mb-6 ${
                isDarkMode ? 'text-gray-600' : 'text-gray-400'
              }`} />
              <h3 className={`text-xl font-semibold mb-3 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                No flashcards yet
              </h3>
              <p className={`mb-6 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                Create your first flashcard to start learning
              </p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all font-medium"
              >
                Create Flashcard
              </button>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-6"
        >
          <div className={`rounded-2xl p-6 border transition-all duration-300 ${
            isDarkMode 
              ? 'bg-gray-900 border-gray-800' 
              : 'bg-white border-gray-200'
          }`}>
            <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Study Progress
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Mastered</span>
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                    {masteredCount}/{filteredCards.length}
                  </span>
                </div>
                <div className={`w-full rounded-full h-2 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}>
                  <div 
                    className="bg-emerald-500 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${filteredCards.length > 0 ? (masteredCount / filteredCards.length) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>In Progress</span>
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                    {filteredCards.length - masteredCount}/{filteredCards.length}
                  </span>
                </div>
                <div className={`w-full rounded-full h-2 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}>
                  <div 
                    className="bg-amber-500 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${filteredCards.length > 0 ? ((filteredCards.length - masteredCount) / filteredCards.length) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div className={`rounded-2xl p-6 border transition-all duration-300 ${
            isDarkMode 
              ? 'bg-gray-900 border-gray-800' 
              : 'bg-white border-gray-200'
          }`}>
            <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Categories
            </h3>
            <div className="space-y-3">
              {categories.filter(cat => cat !== 'all').map((category) => {
                const categoryCards = flashcards.filter(card => card.category === category);
                return (
                  <div 
                    key={category} 
                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedCategory === category
                        ? isDarkMode ? 'bg-purple-900/30' : 'bg-purple-100'
                        : isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => {
                      setSelectedCategory(category);
                      setCurrentCard(0);
                      setIsFlipped(false);
                    }}
                  >
                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>{category}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {categoryCards.length}
                    </span>
                  </div>
                );
              })}
              {categories.length === 1 && (
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  No categories yet. Create flashcards to see them here.
                </p>
              )}
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 text-white">
            <div className="flex items-center space-x-3 mb-4">
              <Star className="w-5 h-5" />
              <h3 className="text-lg font-semibold">Study Streak</h3>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">{studyStreak} Days</div>
              <p className="text-sm opacity-90">Keep it up! 🔥</p>
            </div>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`rounded-2xl p-6 border transition-all duration-300 ${
              isDarkMode 
                ? 'bg-gray-900 border-gray-800' 
                : 'bg-white border-gray-200'
            }`}
          >
            <h3 className={`text-lg font-semibold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Create New Flashcard
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Front (Question)
                </label>
                <textarea
                  value={newCard.front}
                  onChange={(e) => setNewCard(prev => ({ ...prev, front: e.target.value }))}
                  placeholder="Enter your question..."
                  className={`w-full h-32 p-4 rounded-xl resize-none transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    isDarkMode 
                      ? 'bg-gray-800 border border-gray-700 text-white placeholder-gray-400' 
                      : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Back (Answer)
                </label>
                <textarea
                  value={newCard.back}
                  onChange={(e) => setNewCard(prev => ({ ...prev, back: e.target.value }))}
                  placeholder="Enter the answer..."
                  className={`w-full h-32 p-4 rounded-xl resize-none transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    isDarkMode 
                      ? 'bg-gray-800 border border-gray-700 text-white placeholder-gray-400' 
                      : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Category
                </label>
                <input
                  type="text"
                  value={newCard.category}
                  onChange={(e) => setNewCard(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="e.g., Biology, Math, History"
                  className={`w-full p-3 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    isDarkMode 
                      ? 'bg-gray-800 border border-gray-700 text-white placeholder-gray-400' 
                      : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Difficulty
                </label>
                <select 
                  value={newCard.difficulty}
                  onChange={(e) => setNewCard(prev => ({ ...prev, difficulty: parseInt(e.target.value) }))}
                  className={`w-full p-3 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    isDarkMode 
                      ? 'bg-gray-800 border border-gray-700 text-white' 
                      : 'bg-gray-50 border border-gray-200 text-gray-900'
                  }`}
                >
                  <option value="1">Easy</option>
                  <option value="2">Medium</option>
                  <option value="3">Hard</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-4 mt-8">
              <button
                onClick={() => setShowCreateForm(false)}
                className={`px-6 py-3 rounded-xl transition-colors ${
                  isDarkMode 
                    ? 'text-gray-400 hover:text-white' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Cancel
              </button>
              <button 
                onClick={handleCreateCard}
                disabled={!newCard.front.trim() || !newCard.back.trim() || !newCard.category.trim()}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Card
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Flashcards;