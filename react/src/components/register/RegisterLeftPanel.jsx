import TechnoLogsLogo from '../shared/TechnoLogsLogo';

export default function RegisterLeftPanel() {
  return (
    <div className="login-left">
      <TechnoLogsLogo size="lg" className="login-logo-component" />
      <div className="login-logo-subtitle">Management System</div>
      <p className="login-tagline">
        Join Our{' '}
        <span>Community.</span>
      </p>
      <p className="login-desc">
        Create your account to track device repairs, view service
        history, and stay updated on your repair status in real-time.
      </p>
    </div>
  );
}