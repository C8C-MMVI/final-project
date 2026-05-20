import '../assets/css/auth.css';
import Toast from '../components/shared/Toast';
import RegisterLeftPanel from '../components/register/RegisterLeftPanel';
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
    termsAccepted, setTermsAccepted,       // ← new
    showPassword, togglePassword,
    showConfirmPassword, toggleConfirmPassword,
    strength, errors, loading,
    handleSubmit, toast,
  } = useRegister();

  return (
    <>
      <div className="login-page">
        <div className="login-container">
          <RegisterLeftPanel logoSrc="/images/Logo.png" />

          <div className="login-right">
            <div className="login-welcome">Create an Account</div>
            <div className="login-welcome-sub">Fill in your details to get started with TechnoLogs.</div>

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
                termsAccepted={termsAccepted} setTermsAccepted={setTermsAccepted}   // ← new
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