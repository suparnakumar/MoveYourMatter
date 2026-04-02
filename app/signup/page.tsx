import SignupForm from "./_components/SignupForm";

export default function Signup() {
  return (
    <section className="min-h-[80vh] flex items-center justify-center py-20 px-6">
      <div className="w-full max-w-md">
        <SignupForm />
      </div>
    </section>
  );
}
