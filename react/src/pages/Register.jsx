import Background from '../components/shared/Background';
import RegisterLeftPanel from '../components/register/RegisterLeftPanel';
import Toast from '../components/shared/Toast';
import RegisterFields from '../components/register/RegisterFields';
import RegisterSubmitButton from '../components/register/RegisterSubmitButton';
import { useRegister } from '../assets/js/useRegister';

export default function Register() {
  const {
    username, setUsername,
    email, setEmail,                 // <-- added
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

      <div className="relative z-[2] flex items-center justify-center min-h-screen p-6">
        <div
          className="grid grid-cols-2 w-full max-w-[1412px] overflow-hidden rounded-[22px] border border-[rgba(26,188,156,0.18)] backdrop-blur-[28px] shadow-[0_32px_80px_rgba(0,0,0,0.65),0_0_0_1px_rgba(26,188,156,0.06)_inset]"
          style={{
            height: 'min(858px, 90vh)',
            background: 'rgba(10,22,44,0.85)',
            animation: 'fadeUp 0.7s cubic-bezier(.22,.68,0,1.2) both',
          }}
        >
          <RegisterLeftPanel logoSrc="/images/Logo.png" />

          <div className="flex flex-col justify-center overflow-y-auto px-[clamp(28px,4vw,50px)] py-[clamp(32px,6vh,60px)]">
            <div className="text-[clamp(1.4rem,2.5vw,2rem)] font-bold mb-[5px] text-white">
              Create an Account
            </div>
            <div className="text-[0.87rem] text-[rgba(255,255,255,0.55)] mb-[clamp(18px,3vh,28px)]">
              Fill in your details to get started with TechnoLogs.
            </div>

            <form className="flex flex-col gap-[18px]" onSubmit={handleSubmit} noValidate autoComplete="off">
              <RegisterFields
                username={username} setUsername={setUsername}
                email={email} setEmail={setEmail}           // <-- added
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