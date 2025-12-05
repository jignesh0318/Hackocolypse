import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import './PersonalInfo.css';

type FormState = {
  fullName: string;
  primaryPhone: string;
  secondaryPhone: string;
  bloodGroup: string;
  allergies: string;
  medications: string;
  medicalNotes: string;
  homeAddress: string;
  city: string;
  state: string;
  postalCode: string;
  landmark: string;
  emergencyContact1: string;
  emergencyContact1Phone: string;
  emergencyContact1Relation: string;
  emergencyContact2: string;
  emergencyContact2Phone: string;
  emergencyContact2Relation: string;
  whatsappNumber: string;
  preferredHospital: string;
  liveLocationSharing: boolean;
  safeWord: string;
};

interface PersonalInfoProps {
  onComplete: () => void;
  onLogout: () => void;
}

const defaultState: FormState = {
  fullName: '',
  primaryPhone: '',
  secondaryPhone: '',
  bloodGroup: '',
  allergies: '',
  medications: '',
  medicalNotes: '',
  homeAddress: '',
  city: '',
  state: '',
  postalCode: '',
  landmark: '',
  emergencyContact1: '',
  emergencyContact1Phone: '',
  emergencyContact1Relation: '',
  emergencyContact2: '',
  emergencyContact2Phone: '',
  emergencyContact2Relation: '',
  whatsappNumber: '',
  preferredHospital: '',
  liveLocationSharing: true,
  safeWord: '',
};

const PersonalInfo = ({ onComplete, onLogout }: PersonalInfoProps) => {
  const [form, setForm] = useState<FormState>(defaultState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem('profileInfo');
    if (saved) {
      try {
        setForm({ ...defaultState, ...JSON.parse(saved) });
      } catch {
        setForm(defaultState);
      }
    }
  }, []);

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!form.fullName.trim()) nextErrors.fullName = 'Required';
    if (!form.primaryPhone.trim()) nextErrors.primaryPhone = 'Required';
    if (!form.emergencyContact1.trim()) nextErrors.emergencyContact1 = 'Required';
    if (!form.emergencyContact1Phone.trim()) nextErrors.emergencyContact1Phone = 'Required';
    return nextErrors;
  };

  const handleChange = (key: keyof FormState, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    localStorage.setItem('profileInfo', JSON.stringify(form));
    localStorage.setItem('profileComplete', 'true');
    onComplete();
    navigate('/');
  };

  return (
    <div className="profile-page">
      <Header onLogout={onLogout} />
      <div className="profile-container">
        <div className="profile-header">
          <div>
            <p className="eyebrow">Step 2 · Safety Profile</p>
            <h1>Emergency & Safety Details</h1>
            <p className="subtitle">We only use this to keep you safer and to reach your trusted contacts during an emergency.</p>
          </div>
          <button className="save-btn" onClick={handleSubmit}>
            Save & Continue
          </button>
        </div>

        <form className="profile-form" onSubmit={handleSubmit}>
          <section>
            <div className="section-title">
              <h2>Personal & Medical</h2>
              <p>Basics we need to assist responders faster.</p>
            </div>
            <div className="grid two">
              <div className="field">
                <label>Full Name *</label>
                <input
                  type="text"
                  value={form.fullName}
                  onChange={(e) => handleChange('fullName', e.target.value)}
                  placeholder="Priya Sharma"
                />
                {errors.fullName && <span className="error">{errors.fullName}</span>}
              </div>
              <div className="field">
                <label>Primary Phone *</label>
                <input
                  type="tel"
                  value={form.primaryPhone}
                  onChange={(e) => handleChange('primaryPhone', e.target.value)}
                  placeholder="+91 98765 43210"
                />
                {errors.primaryPhone && <span className="error">{errors.primaryPhone}</span>}
              </div>
              <div className="field">
                <label>Secondary Phone</label>
                <input
                  type="tel"
                  value={form.secondaryPhone}
                  onChange={(e) => handleChange('secondaryPhone', e.target.value)}
                  placeholder="Parent / Guardian"
                />
              </div>
              <div className="field">
                <label>WhatsApp Number</label>
                <input
                  type="tel"
                  value={form.whatsappNumber}
                  onChange={(e) => handleChange('whatsappNumber', e.target.value)}
                  placeholder="For quick updates"
                />
              </div>
              <div className="field">
                <label>Blood Group</label>
                <input
                  type="text"
                  value={form.bloodGroup}
                  onChange={(e) => handleChange('bloodGroup', e.target.value)}
                  placeholder="B+"
                />
              </div>
              <div className="field">
                <label>Preferred Hospital / Clinic</label>
                <input
                  type="text"
                  value={form.preferredHospital}
                  onChange={(e) => handleChange('preferredHospital', e.target.value)}
                  placeholder="Nearest trusted facility"
                />
              </div>
              <div className="field full">
                <label>Allergies</label>
                <textarea
                  value={form.allergies}
                  onChange={(e) => handleChange('allergies', e.target.value)}
                  placeholder="Peanuts, shellfish, medicines…"
                />
              </div>
              <div className="field full">
                <label>Medications / Medical Notes</label>
                <textarea
                  value={form.medications}
                  onChange={(e) => handleChange('medications', e.target.value)}
                  placeholder="Current medication, conditions, or other notes for responders"
                />
              </div>
              <div className="field full">
                <label>Any Additional Instructions</label>
                <textarea
                  value={form.medicalNotes}
                  onChange={(e) => handleChange('medicalNotes', e.target.value)}
                  placeholder="Share any additional safety instructions or details"
                />
              </div>
            </div>
          </section>

          <section>
            <div className="section-title">
              <h2>Emergency Contacts</h2>
              <p>We notify them first during SOS.</p>
            </div>
            <div className="grid two">
              <div className="field">
                <label>Primary Contact Name *</label>
                <input
                  type="text"
                  value={form.emergencyContact1}
                  onChange={(e) => handleChange('emergencyContact1', e.target.value)}
                  placeholder="Mom / Dad / Close Friend"
                />
                {errors.emergencyContact1 && <span className="error">{errors.emergencyContact1}</span>}
              </div>
              <div className="field">
                <label>Primary Contact Phone *</label>
                <input
                  type="tel"
                  value={form.emergencyContact1Phone}
                  onChange={(e) => handleChange('emergencyContact1Phone', e.target.value)}
                  placeholder="+91 98xxxxxxx"
                />
                {errors.emergencyContact1Phone && <span className="error">{errors.emergencyContact1Phone}</span>}
              </div>
              <div className="field">
                <label>Relation</label>
                <input
                  type="text"
                  value={form.emergencyContact1Relation}
                  onChange={(e) => handleChange('emergencyContact1Relation', e.target.value)}
                  placeholder="Mother"
                />
              </div>

              <div className="field">
                <label>Secondary Contact Name</label>
                <input
                  type="text"
                  value={form.emergencyContact2}
                  onChange={(e) => handleChange('emergencyContact2', e.target.value)}
                  placeholder="Friend / Mentor"
                />
              </div>
              <div className="field">
                <label>Secondary Contact Phone</label>
                <input
                  type="tel"
                  value={form.emergencyContact2Phone}
                  onChange={(e) => handleChange('emergencyContact2Phone', e.target.value)}
                  placeholder="+91 98xxxxxxx"
                />
              </div>
              <div className="field">
                <label>Relation</label>
                <input
                  type="text"
                  value={form.emergencyContact2Relation}
                  onChange={(e) => handleChange('emergencyContact2Relation', e.target.value)}
                  placeholder="Friend"
                />
              </div>
            </div>
          </section>

          <section>
            <div className="section-title">
              <h2>Home & Safe Places</h2>
              <p>Where you spend most of your time.</p>
            </div>
            <div className="grid two">
              <div className="field full">
                <label>Home Address</label>
                <textarea
                  value={form.homeAddress}
                  onChange={(e) => handleChange('homeAddress', e.target.value)}
                  placeholder="House number, street, area"
                />
              </div>
              <div className="field">
                <label>City</label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  placeholder="New Delhi"
                />
              </div>
              <div className="field">
                <label>State</label>
                <input
                  type="text"
                  value={form.state}
                  onChange={(e) => handleChange('state', e.target.value)}
                  placeholder="Delhi"
                />
              </div>
              <div className="field">
                <label>Postal Code</label>
                <input
                  type="text"
                  value={form.postalCode}
                  onChange={(e) => handleChange('postalCode', e.target.value)}
                  placeholder="110001"
                />
              </div>
              <div className="field">
                <label>Nearby Landmark</label>
                <input
                  type="text"
                  value={form.landmark}
                  onChange={(e) => handleChange('landmark', e.target.value)}
                  placeholder="Opposite metro station"
                />
              </div>
            </div>
          </section>

          <section>
            <div className="section-title">
              <h2>Safety Preferences</h2>
              <p>How should we help you during alerts?</p>
            </div>
            <div className="grid two">
              <div className="field toggle">
                <label>Live Location Sharing</label>
                <div className="toggle-row">
                  <input
                    type="checkbox"
                    checked={form.liveLocationSharing}
                    onChange={(e) => handleChange('liveLocationSharing', e.target.checked)}
                    title="Share location with trusted contacts during SOS"
                  />
                  <span>Share location with trusted contacts during SOS</span>
                </div>
              </div>
              <div className="field">
                <label>Safe Word / SOS Phrase</label>
                <input
                  type="text"
                  value={form.safeWord}
                  onChange={(e) => handleChange('safeWord', e.target.value)}
                  placeholder="E.g., 'purple umbrella'"
                />
              </div>
            </div>
          </section>

          <div className="form-actions">
            <button type="button" className="secondary" onClick={() => navigate('/')}>Skip for now</button>
            <button type="submit" className="primary">Save & Continue</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PersonalInfo;
