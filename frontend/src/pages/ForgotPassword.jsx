import { useNavigate } from "react-router-dom"
import { useState } from "react"

function ForgotPassword() {
    const navigate = useNavigate()
    const [role, setRole] = useState("student")
    const [email, setEmail] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const BASE_URL = import.meta.env.VITE_API_URL !== undefined && import.meta.env.VITE_API_URL !== "" ? import.meta.env.VITE_API_URL : (import.meta.env.DEV ? "http://localhost:3000" : "");

    const handleResetPassword = async () => {
        if (!email || !newPassword) {
            setError("Please fill in all fields");
            return;
        }
        if (newPassword !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const res = await fetch(`${BASE_URL}/api/reset-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, role, newPassword })
            });
            const data = await res.json();
            if (res.ok) {
                alert("Password reset successfully!");
                navigate("/login");
            } else {
                setError(data.error || "Reset failed");
            }
        } catch (err) {
            setError("Server error during reset");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen relative overflow-hidden bg-[#262626] font-sans">
            {/* Top Yellow Header Section */}
            <div className="h-[30vh] bg-gradient-to-b from-yellow-300 to-yellow-500 flex items-center justify-center relative shadow-xl border-b-4 border-black/10">
                <img src="/wctm-logo.png" alt="WCTM Logo" className="w-52 h-52 object-contain drop-shadow-2xl" />
            </div>

            <div className="relative z-10 px-8 py-8 flex flex-col items-center">
                <div className="w-full max-w-sm flex flex-col items-center space-y-6 animate-in fade-in zoom-in duration-500">
                    {/* Title Pill */}
                    <div className="bg-cyan-400 text-black px-10 py-3 rounded-full font-black text-lg uppercase mb-2 shadow-lg text-center w-full">
                        Reset Password
                    </div>

                    {/* Role Switcher Pill */}
                    <div className="flex bg-[#1a1a1a] rounded-full p-1 w-full border border-white/5">
                        {["student", "driver", "management"].map((r) => (
                            <button
                                key={r}
                                onClick={() => { setRole(r); setError(""); }}
                                className={`flex-1 py-2 rounded-full text-[10px] font-black uppercase tracking-tighter transition-all ${role === r ? "bg-cyan-400 text-black shadow-md" : "text-white opacity-40 hover:opacity-100"}`}
                            >
                                {r}
                            </button>
                        ))}
                    </div>

                    <input
                        type="email"
                        placeholder="Registered Email ID"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-yellow-400 text-black border-none rounded-[25px] px-8 py-4 outline-none font-black text-xl placeholder:text-black/80 shadow-lg"
                    />

                    <input
                        type="password"
                        placeholder="Enter New Password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full bg-yellow-400 text-black border-none rounded-[25px] px-8 py-4 outline-none font-black text-xl placeholder:text-black/80 shadow-lg"
                    />

                    <input
                        type="password"
                        placeholder="Confirm New Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-yellow-400 text-black border-none rounded-[25px] px-8 py-4 outline-none font-black text-xl placeholder:text-black/80 shadow-lg"
                    />

                    <button
                        onClick={handleResetPassword}
                        disabled={loading}
                        className="w-full bg-cyan-400 hover:bg-cyan-500 text-black py-4 rounded-[22px] font-black text-2xl uppercase tracking-[1px] shadow-xl transition-all active:scale-95 disabled:opacity-50"
                    >
                        {loading ? "..." : "Reset Password"}
                    </button>
                </div>

                {error && <p className="text-red-500 text-sm font-black uppercase text-center border-2 border-red-500/20 py-3 rounded-2xl bg-white/5 mt-6 w-full max-w-sm">{error}</p>}
                
                <button 
                    onClick={() => navigate("/login")}
                    className="w-full text-cyan-400 text-base font-black uppercase hover:underline transition mt-8 bg-black/20 py-3 rounded-full max-w-sm shadow-md"
                >
                    Back to Login Page
                </button>
            </div>
        </div>
    )
}

export default ForgotPassword