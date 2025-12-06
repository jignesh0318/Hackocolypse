import { useState } from 'react';
import Header from '../components/Header';
import './SafetyTips.css';

interface Tip {
  id: number;
  category: 'travel' | 'awareness' | 'digital' | 'emergency';
  title: string;
  description: string;
  icon: string;
}

interface SafetyTipsProps {
  onLogout: () => void;
}

const SafetyTips = ({ onLogout }: SafetyTipsProps) => {
  const [tips] = useState<Tip[]>([
    {
      id: 1,
      category: 'travel',
      title: 'Share Your Route',
      description: 'Always inform a trusted person about your destination and expected arrival time',
      icon: '🗺️'
    },
    {
      id: 2,
      category: 'travel',
      title: 'Use Well-Lit Routes',
      description: 'Avoid dark alleys and isolated areas. Use main roads even if they take longer',
      icon: '💡'
    },
    {
      id: 3,
      category: 'travel',
      title: 'Trust Your Instincts',
      description: 'If something feels off, remove yourself from the situation immediately',
      icon: '🧠'
    },
    {
      id: 4,
      category: 'awareness',
      title: 'Stay Alert',
      description: 'Be aware of your surroundings. Keep headphones at low volume, avoid phone distractions',
      icon: '👁️'
    },
    {
      id: 5,
      category: 'awareness',
      title: 'Travel in Groups',
      description: 'When possible, travel with friends or use buddy system. There\'s safety in numbers',
      icon: '👥'
    },
    {
      id: 6,
      category: 'awareness',
      title: 'Learn Basic Self-Defense',
      description: 'Take a self-defense class to build confidence and learn protective techniques',
      icon: '🥋'
    },
    {
      id: 7,
      category: 'digital',
      title: 'Secure Your Device',
      description: 'Use strong passwords, enable two-factor authentication on important accounts',
      icon: '🔐'
    },
    {
      id: 8,
      category: 'digital',
      title: 'Be Careful with Social Media',
      description: 'Don\'t share real-time location. Avoid posting plans in advance',
      icon: '📱'
    },
    {
      id: 9,
      category: 'digital',
      title: 'Report Harassment',
      description: 'Document and report online harassment. Most platforms have reporting tools',
      icon: '🚫'
    },
    {
      id: 10,
      category: 'emergency',
      title: 'Know Emergency Numbers',
      description: 'Keep emergency numbers memorized: Police (100), Women Helpline (1091)',
      icon: '☎️'
    },
    {
      id: 11,
      category: 'emergency',
      title: 'Stay Calm',
      description: 'In an emergency, take deep breaths. Clear thinking helps you respond better',
      icon: '🧘'
    },
    {
      id: 12,
      category: 'emergency',
      title: 'Seek Help',
      description: 'Don\'t hesitate to contact authorities or trusted people in case of danger',
      icon: '🆘'
    }
  ]);

  const [selectedCategory, setSelectedCategory] = useState<'all' | 'travel' | 'awareness' | 'digital' | 'emergency'>('all');

  const filteredTips = selectedCategory === 'all'
    ? tips
    : tips.filter(t => t.category === selectedCategory);

  const categoryIcons: Record<string, string> = {
    travel: '🚗',
    awareness: '👀',
    digital: '💻',
    emergency: '🆘'
  };

  return (
    <div className="safety-tips-page">
      <Header onLogout={onLogout} />
      
      <div className="tips-container">
        <div className="tips-header">
          <h1>💡 Safety Tips & Guidelines</h1>
          <p>Learn how to stay safe in different situations</p>
        </div>

        <div className="category-filters">
          <button
            className={`category-btn ${selectedCategory === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('all')}
          >
            All Tips ({tips.length})
          </button>
          <button
            className={`category-btn ${selectedCategory === 'travel' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('travel')}
          >
            🚗 Travel ({tips.filter(t => t.category === 'travel').length})
          </button>
          <button
            className={`category-btn ${selectedCategory === 'awareness' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('awareness')}
          >
            👀 Awareness ({tips.filter(t => t.category === 'awareness').length})
          </button>
          <button
            className={`category-btn ${selectedCategory === 'digital' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('digital')}
          >
            💻 Digital ({tips.filter(t => t.category === 'digital').length})
          </button>
          <button
            className={`category-btn ${selectedCategory === 'emergency' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('emergency')}
          >
            🆘 Emergency ({tips.filter(t => t.category === 'emergency').length})
          </button>
        </div>

        <div className="tips-grid">
          {filteredTips.length === 0 ? (
            <div className="no-tips">
              <p>No tips in this category</p>
            </div>
          ) : (
            filteredTips.map(tip => (
              <div key={tip.id} className={`tip-card category-${tip.category}`}>
                <div className="tip-icon">{tip.icon}</div>
                <h3>{tip.title}</h3>
                <p>{tip.description}</p>
                <div className="tip-category">
                  <span>{categoryIcons[tip.category]} {tip.category.charAt(0).toUpperCase() + tip.category.slice(1)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SafetyTips;
