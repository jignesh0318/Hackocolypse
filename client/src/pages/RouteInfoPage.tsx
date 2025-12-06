import Header from '../components/Header';
import RouteInfo from '../components/RouteInfo';
import './RouteInfoPage.css';

interface RouteInfoPageProps {
  onLogout: () => void;
}

const RouteInfoPage = ({ onLogout }: RouteInfoPageProps) => {
  return (
    <div className="route-info-page">
      <Header onLogout={onLogout} />
      <div className="route-info-wrapper">
        <RouteInfo />
      </div>
    </div>
  );
};

export default RouteInfoPage;
