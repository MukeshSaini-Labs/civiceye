const fs = require('fs');
let code = fs.readFileSync('app/report/ReportClient.tsx', 'utf-8');

// 1. Add useAuth import
code = code.replace(
  "import { useRouter } from 'next/navigation';",
  "import { useRouter } from 'next/navigation';\nimport { useAuth } from '@/context/AuthContext';"
);

// 2. Add useAuth hook and auth protection
const hookCode = `
  const router = useRouter();
  const { user, loading } = useAuth();
  
  // Start at step 2 automatically
  const [step, setStep] = useState(2); 
`;
code = code.replace(
  "  const router = useRouter();\n  const [step, setStep] = useState(1);",
  hookCode
);

// 3. Remove Step 1 UI completely
const step1Start = code.indexOf('{/* ─── STEP 1: IDENTITY ─── */}');
const step2Start = code.indexOf('{/* ─── STEP 2: GPS LOCATION ─── */}');
if (step1Start !== -1 && step2Start !== -1) {
  code = code.substring(0, step1Start) + code.substring(step2Start);
}

// 4. Update StepIndicator total and current
code = code.replace('<StepIndicator current={step} total={4} />', '<StepIndicator current={step - 1} total={3} />');

// 5. Fix payload in handleSubmit
const oldPayload = `      const payload = {
        imageBase64: hazardImageBase64,
        reporterName,
        reporterEmail,
        reporterPhone,
        reporterImageBase64,
        latitude: location.lat,
        longitude: location.lng,`;
        
const newPayload = `      const payload = {
        imageBase64: hazardImageBase64,
        reporterName: user?.displayName || 'Anonymous Hero',
        reporterEmail: user?.email || '',
        reporterUid: user?.uid || '',
        reporterPhone: '',
        reporterImageBase64: '',
        latitude: location.lat,
        longitude: location.lng,`;
        
code = code.replace(oldPayload, newPayload);

// 6. Fix early return in component if loading
const returnStatement = 'return (';
const returnReplacement = `
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <Loader2 className="w-10 h-10 text-teal-500 animate-spin" />
      </div>
    );
  }

  if (!user) {
    if (!embedded) {
      router.push('/login');
      return null;
    }
    return (
      <div className="bg-[#0a0f1c]/80 border border-white/[0.08] rounded-[2.5rem] p-12 text-center shadow-2xl flex flex-col items-center justify-center min-h-[500px]">
        <Lock className="w-16 h-16 text-teal-500/50 mb-6" />
        <h2 className="text-3xl font-black text-white mb-4">Authentication Required</h2>
        <p className="text-slate-400 mb-8 max-w-md">You must sign in to the CivicEye Command Center before deploying AI hazard analysis.</p>
        <button onClick={() => router.push('/login')} className="bg-teal-500 hover:bg-teal-400 text-[#020408] font-bold py-3 px-8 rounded-xl transition-all">
          Secure Sign In
        </button>
      </div>
    );
  }

  return (`;
  
code = code.replace(returnStatement, returnReplacement);

fs.writeFileSync('app/report/ReportClient.tsx', code);
console.log('SUCCESS');
