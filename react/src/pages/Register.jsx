import '../assets/css/login.css';
import Background from '../components/shared/Background';
import RegisterLeftPanel from '../components/register/RegisterLeftPanel';
import Toast from '../components/shared/Toast';
import RegisterFields from '../components/register/RegisterFields';
import RegisterSubmitButton from '../components/register/RegisterSubmitButton';
import { useRegister } from '../assets/js/useRegister';

export default function Register() {
  const {
    username, setUsername,
    email, setEmail,
    phone, setPhone,
    password, setPassword,
    confirmPassword, setConfirmPassword,
    showPassword, togglePassword,
    showConfirmPassword, toggleConfirmPassword,
    strength,
    errors,
    loading,
    handleSubmit,
    toast,
  } = useRegister();

  return (
    <>
      <Background />

      <div className="login-page">
        <div className="login-container">
          <RegisterLeftPanel logoSrc="/images/Logo.png" />

          <div className="login-right">
            <div style={{ fontSize: 'clamp(1.4rem, 2.5vw, 2rem)', fontWeight: '700', marginBottom: '5px', color: 'white' }}>
              Create an Account
            </div>
            <div style={{ fontSize: '0.87rem', color: 'rgba(255,255,255,0.55)', marginBottom: 'clamp(18px,3vh,28px)' }}>
              Fill in your details to get started with TechnoLogs.
            </div>

            <form className="login-form" onSubmit={handleSubmit} noValidate autoComplete="off">
              <RegisterFields
                username={username} setUsername={setUsername}
                email={email} setEmail={setEmail}
                phone={phone} setPhone={setPhone}
                password={password} setPassword={setPassword}
                confirmPassword={confirmPassword} setConfirmPassword={setConfirmPassword}
                showPassword={showPassword} togglePassword={togglePassword}
                showConfirmPassword={showConfirmPassword} toggleConfirmPassword={toggleConfirmPassword}
                strength={strength}
                errors={errors}
              />
              <RegisterSubmitButton loading={loading} />
            </form>
          </div>
        </div>
      </div>

      <Toast toast={toast} />
    </>
  );
}