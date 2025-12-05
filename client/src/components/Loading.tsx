import './Loading.css';

const Loading = () => {
  return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p className="loading-text">Loading SafeZone AI...</p>
    </div>
  );
};

export default Loading;