export default function LoginFooter() {
  return (
    <div className="text-center text-[0.8rem] text-[rgba(255,255,255,0.55)] mt-1">
      NEW TO TECHNOLOGS?{' '}
      <a
        href="/register"
        className="text-teal no-underline font-semibold hover:underline"
      >
        CREATE AN ACCOUNT
      </a>
    </div>
  );
}