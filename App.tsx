import React, { useState, useEffect } from 'react';
import { PlusCircle, Calendar, Clock, Search, Tag, Trash2, Bell } from 'lucide-react';
import { format } from 'date-fns';

interface Note {
  id: string;
  title: string;
  content: string;
  reminder?: Date;
  tags: string[];
  createdAt: Date;
}

function App() {
  const [notes, setNotes] = useState<Note[]>(() => {
    const savedNotes = localStorage.getItem('notes');
    return savedNotes ? JSON.parse(savedNotes) : [];
  });
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [reminder, setReminder] = useState('');
  const [tag, setTag] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    localStorage.setItem('notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    if (Notification.permission !== 'granted') {
      Notification.requestPermission();
    }

    const checkReminders = setInterval(() => {
      notes.forEach(note => {
        if (note.reminder && new Date(note.reminder) <= new Date()) {
          new Notification('Note Reminder', {
            body: `Reminder for note: ${note.title}`,
            icon: '/vite.svg'
          });
          // Remove the reminder after it's triggered
          const updatedNotes = notes.map(n => 
            n.id === note.id ? { ...n, reminder: undefined } : n
          );
          setNotes(updatedNotes);
        }
      });
    }, 60000);

    return () => clearInterval(checkReminders);
  }, [notes]);

  const addNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const newNote: Note = {
      id: crypto.randomUUID(),
      title,
      content,
      reminder: reminder ? new Date(reminder) : undefined,
      tags,
      createdAt: new Date()
    };

    setNotes(prev => [newNote, ...prev]);
    setTitle('');
    setContent('');
    setReminder('');
    setTags([]);
    setShowForm(false);
  };

  const deleteNote = (id: string) => {
    setNotes(prev => prev.filter(note => note.id !== id));
  };

  const addTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tag.trim()) {
      e.preventDefault();
      if (!tags.includes(tag.trim())) {
        setTags(prev => [...prev, tag.trim()]);
      }
      setTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(t => t !== tagToRemove));
  };

  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-indigo-900">Noteworthy</h1>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => setShowForm(!showForm)}
          className="mb-6 inline-flex items-center px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <PlusCircle className="w-5 h-5 mr-2" />
          New Note
        </button>

        {showForm && (
          <form onSubmit={addNote} className="mb-8 bg-white rounded-lg shadow-md p-6">
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <textarea
                placeholder="Content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="datetime-local"
                      value={reminder}
                      onChange={(e) => setReminder(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="relative">
                    <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Add tags (press Enter)"
                      value={tag}
                      onChange={(e) => setTag(e.target.value)}
                      onKeyDown={addTag}
                      className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-800"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-2 text-indigo-600 hover:text-indigo-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <button
                type="submit"
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Save Note
              </button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotes.map(note => (
            <article key={note.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{note.title}</h3>
                <button
                  onClick={() => deleteNote(note.id)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
              <p className="text-gray-600 mb-4 whitespace-pre-wrap">{note.content}</p>
              {note.reminder && (
                <div className="flex items-center text-sm text-indigo-600 mb-3">
                  <Bell className="w-4 h-4 mr-2" />
                  <span>Reminder: {format(new Date(note.reminder), 'PPp')}</span>
                </div>
              )}
              {note.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {note.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-2 py-1 text-xs rounded-full bg-indigo-100 text-indigo-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <div className="text-xs text-gray-400">
                Created: {format(new Date(note.createdAt), 'PPp')}
              </div>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}

export default App;