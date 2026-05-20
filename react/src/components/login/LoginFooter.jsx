export default function LoginFooter() {
  return (
    <div className="text-center text-[0.8rem] text-[rgba(13,31,26,0.45)] mt-1">
      New to TechnoLogs?{' '}
      <a href="/register" className="text-[#1abc9c] no-underline font-semibold hover:underline">
        Create an account
      </a>
    </div>
  );
}