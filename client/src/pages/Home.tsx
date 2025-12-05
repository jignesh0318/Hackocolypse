import './Home.css';
import Header from '../components/Header';
import Map from '../components/Map';
import ZoneList from '../components/ZoneList';

interface HomeProps {
  onLogout: () => void;
}

const Home = ({ onLogout }: HomeProps) => (
  <div className="home-page">
    <Header onLogout={onLogout} />

    <main className="home-content">
      <section className="hero">
        <h1 className="hero-title">AI System for Identifying Unsafe Zones</h1>
        <p className="hero-subtitle">
          Live safety scores, color-coded map, and community reports for women & students.
        </p>
      </section>

      <section className="map-section">
        <h2>Live Safety Map</h2>
        <div className="map-wrapper">
          <Map />
        </div>
      </section>

      <section className="zones-section">
        <h2>Reported Zones</h2>
        <ZoneList />
      </section>
    </main>
  </div>
);

export default Home;