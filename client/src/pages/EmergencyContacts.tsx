import { useState } from 'react';
import Header from '../components/Header';
import './EmergencyContacts.css';

interface Contact {
  id: number;
  name: string;
  phone: string;
  relationship: string;
  type: 'family' | 'friend' | 'authority';
}

interface EmergencyContactsProps {
  onLogout: () => void;
}

const EmergencyContacts = ({ onLogout }: EmergencyContactsProps) => {
  const [contacts, setContacts] = useState<Contact[]>([
    { id: 1, name: 'Mom', phone: '+91 98765 43210', relationship: 'Parent', type: 'family' },
    { id: 2, name: 'Dad', phone: '+91 98765 43211', relationship: 'Parent', type: 'family' },
    { id: 3, name: 'Sister', phone: '+91 98765 43212', relationship: 'Sibling', type: 'family' },
    { id: 4, name: 'Best Friend', phone: '+91 98765 43213', relationship: 'Close Friend', type: 'friend' },
    { id: 5, name: 'Police Helpline', phone: '100', relationship: 'Emergency', type: 'authority' },
    { id: 6, name: 'Women Helpline', phone: '1091', relationship: 'Support', type: 'authority' },
  ]);

  const [filterType, setFilterType] = useState<'all' | 'family' | 'friend' | 'authority'>('all');

  const filteredContacts = filterType === 'all' 
    ? contacts 
    : contacts.filter(c => c.type === filterType);

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone.replace(/\s/g, '')}`;
  };

  const handleSMS = (phone: string) => {
    window.location.href = `sms:${phone.replace(/\s/g, '')}`;
  };

  return (
    <div className="emergency-contacts-page">
      <Header onLogout={onLogout} />
      
      <div className="contacts-container">
        <div className="contacts-header">
          <h1>📞 Emergency Contacts</h1>
          <p>Quick access to your trusted contacts</p>
        </div>

        <div className="contact-filters">
          <button
            className={`filter-btn ${filterType === 'all' ? 'active' : ''}`}
            onClick={() => setFilterType('all')}
          >
            All ({contacts.length})
          </button>
          <button
            className={`filter-btn ${filterType === 'family' ? 'active' : ''}`}
            onClick={() => setFilterType('family')}
          >
            👨‍👩‍👧 Family ({contacts.filter(c => c.type === 'family').length})
          </button>
          <button
            className={`filter-btn ${filterType === 'friend' ? 'active' : ''}`}
            onClick={() => setFilterType('friend')}
          >
            👥 Friends ({contacts.filter(c => c.type === 'friend').length})
          </button>
          <button
            className={`filter-btn ${filterType === 'authority' ? 'active' : ''}`}
            onClick={() => setFilterType('authority')}
          >
            🚨 Authority ({contacts.filter(c => c.type === 'authority').length})
          </button>
        </div>

        <div className="contacts-list">
          {filteredContacts.length === 0 ? (
            <div className="no-contacts">
              <p>No contacts in this category</p>
            </div>
          ) : (
            filteredContacts.map(contact => (
              <div key={contact.id} className={`contact-card ${contact.type}`}>
                <div className="contact-info">
                  <h3>{contact.name}</h3>
                  <p className="relationship">{contact.relationship}</p>
                  <p className="phone">{contact.phone}</p>
                </div>
                <div className="contact-actions">
                  <button 
                    className="action-call"
                    onClick={() => handleCall(contact.phone)}
                    title="Call"
                  >
                    📞 Call
                  </button>
                  <button 
                    className="action-sms"
                    onClick={() => handleSMS(contact.phone)}
                    title="Send SMS"
                  >
                    💬 SMS
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="contacts-info">
          <p>💡 Tip: You can add more contacts in your Safety Profile</p>
        </div>
      </div>
    </div>
  );
};

export default EmergencyContacts;
