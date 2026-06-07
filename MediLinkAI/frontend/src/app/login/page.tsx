"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Shield,
  Activity,
  UserCheck,
  Lock,
  Mail,
  Loader2,
  Calendar,
  Smartphone,
  MapPin,
  FileText,
  DollarSign
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form states
  const [role, setRole] = useState("Patient"); // Patient, Doctor, Admin, Receptionist, Pharmacist
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  // Role-specific states
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("Male");
  const [bloodGroup, setBloodGroup] = useState("O+");
  const [contactNo, setContactNo] = useState("");
  const [address, setAddress] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");

  const [specialization, setSpecialization] = useState("");
  const [licenseNo, setLicenseNo] = useState("");
  const [consultationFee, setConsultationFee] = useState("");
  const [availability, setAvailability] = useState("Mon-Fri 9:00 AM - 5:00 PM");

  const [department, setDepartment] = useState("General");
  const [shift, setShift] = useState("Morning");

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5009";

  const handleDemoFill = (selectedRole: string) => {
    setRole(selectedRole);
    if (selectedRole === "Admin") {
      setEmail("admin@medilink.com");
      setPassword("Admin@123");
    } else if (selectedRole === "Doctor") {
      setEmail("doctor@medilink.com");
      setPassword("Doctor@123");
    } else if (selectedRole === "Receptionist") {
      setEmail("receptionist@medilink.com");
      setPassword("Reception@123");
    } else if (selectedRole === "Patient") {
      setEmail("patient@medilink.com");
      setPassword("Patient@123");
    } else if (selectedRole === "Pharmacist") {
      setEmail("pharmacist@medilink.com");
      setPassword("Pharmacy@123");
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      const payload = isLogin
        ? { email, password }
        : {
            email,
            password,
            role,
            name,
            age: age ? parseInt(age) : null,
            gender,
            bloodGroup,
            contactNo,
            address,
            emergencyContact,
            specialization,
            licenseNo,
            consultationFee: consultationFee ? parseFloat(consultationFee) : null,
            availability,
            department,
            shift
          };

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong. Please check your inputs.");
      }

      if (isLogin) {
        // Store auth state
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role);
        localStorage.setItem("email", data.email);
        localStorage.setItem("displayName", data.displayName);

        setSuccess(`Welcome back, ${data.displayName}! Redirecting...`);
        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
      } else {
        setSuccess("Registration successful! Switching to login...");
        setTimeout(() => {
          setIsLogin(true);
          setLoading(false);
        }, 1500);
      }
    } catch (err: any) {
      setError(err.message || "Failed to connect to the backend server.");
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#0a0f1d] overflow-hidden px-4 font-sans text-white">
      {/* Decorative Neon Blurs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[30%] right-[15%] w-[300px] h-[300px] bg-purple-600/15 rounded-full blur-[100px] pointer-events-none" />

      {/* Background Mesh/Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f29370a_1px,transparent_1px),linear-gradient(to_bottom,#1f29370a_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20 pointer-events-none" />

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 gap-8 my-8 z-10">
        
        {/* Left Panel: Branding / Info (4 cols) */}
        <div className="md:col-span-5 flex flex-col justify-between p-6 bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/20">
                <Activity className="h-7 w-7 text-white animate-pulse" />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                  MediLink AI
                </span>
                <span className="block text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
                  Intelligent Ecosystem
                </span>
              </div>
            </div>

            <h2 className="text-2xl font-bold leading-tight mb-4">
              Connecting Patients, Doctors & Pharmacies instantly.
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed mb-6">
              Access the hospital management dashboard, prescribe medicines with smart AI guidance, track records, and stay synced dynamically.
            </p>
          </div>

          {/* Quick Demo Fill Accounts */}
          <div className="border-t border-slate-800/80 pt-6">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-3">
              Quick Demo Login:
            </span>
            <div className="flex flex-wrap gap-2">
              {["Patient", "Doctor", "Receptionist", "Pharmacist", "Admin"].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => handleDemoFill(item)}
                  className="px-3 py-1.5 bg-slate-800/60 hover:bg-blue-600/20 hover:text-blue-300 border border-slate-700/60 rounded-xl text-xs font-medium transition duration-200"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel: Form (7 cols) */}
        <div className="md:col-span-7 bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-8 shadow-2xl flex flex-col justify-center">
          {/* Form Tabs */}
          <div className="flex bg-slate-950/80 p-1 rounded-2xl mb-8 border border-slate-800">
            <button
              onClick={() => {
                setIsLogin(true);
                setError("");
                setSuccess("");
              }}
              className={`flex-1 py-3 text-center rounded-xl text-sm font-semibold transition duration-200 ${
                isLogin
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/10"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setIsLogin(false);
                setError("");
                setSuccess("");
              }}
              className={`flex-1 py-3 text-center rounded-xl text-sm font-semibold transition duration-200 ${
                !isLogin
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/10"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Register Portal
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-6">
            
            {/* Success & Error Banners */}
            {error && (
              <div className="bg-red-500/15 border border-red-500/30 text-red-200 text-xs px-4 py-3 rounded-2xl">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 text-xs px-4 py-3 rounded-2xl">
                {success}
              </div>
            )}

            {/* Registration Role Selection */}
            {!isLogin && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Assign Portal Access Profile
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {["Patient", "Doctor", "Receptionist", "Pharmacist", "Admin"].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setRole(item)}
                      className={`py-2 px-3 rounded-xl border text-xs font-semibold transition duration-200 ${
                        role === item
                          ? "bg-emerald-600/20 text-emerald-300 border-emerald-500"
                          : "bg-slate-950/40 text-slate-400 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Common Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {!isLogin && (
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="Dr. Sarah Connor"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-slate-950/40 border border-slate-800 hover:border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 rounded-2xl text-sm transition outline-none text-white placeholder-slate-500"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="name@medilink.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-950/40 border border-slate-800 hover:border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 rounded-2xl text-sm transition outline-none text-white placeholder-slate-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-950/40 border border-slate-800 hover:border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 rounded-2xl text-sm transition outline-none text-white placeholder-slate-500"
                  />
                </div>
              </div>
            </div>

            {/* Role-Specific Registration Fields */}
            {!isLogin && role === "Patient" && (
              <div className="p-4 bg-slate-950/30 border border-slate-800/80 rounded-2xl space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Age</label>
                    <input
                      type="number"
                      placeholder="28"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 focus:border-blue-500 rounded-xl text-xs transition outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Gender</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 focus:border-blue-500 rounded-xl text-xs transition outline-none text-slate-300"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Blood Group</label>
                    <input
                      type="text"
                      placeholder="O+"
                      value={bloodGroup}
                      onChange={(e) => setBloodGroup(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 focus:border-blue-500 rounded-xl text-xs transition outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Contact Number</label>
                    <input
                      type="text"
                      placeholder="+92 300 1234567"
                      value={contactNo}
                      onChange={(e) => setContactNo(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 focus:border-blue-500 rounded-xl text-xs transition outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Emergency Contact</label>
                    <input
                      type="text"
                      placeholder="Father / Spouse No"
                      value={emergencyContact}
                      onChange={(e) => setEmergencyContact(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 focus:border-blue-500 rounded-xl text-xs transition outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Residential Address</label>
                  <input
                    type="text"
                    placeholder="Street, City, Country"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 focus:border-blue-500 rounded-xl text-xs transition outline-none"
                  />
                </div>
              </div>
            )}

            {!isLogin && role === "Doctor" && (
              <div className="p-4 bg-slate-950/30 border border-slate-800/80 rounded-2xl space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Specialization</label>
                    <input
                      type="text"
                      placeholder="Cardiologist / General Physician"
                      value={specialization}
                      onChange={(e) => setSpecialization(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 focus:border-blue-500 rounded-xl text-xs transition outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Medical License Number</label>
                    <input
                      type="text"
                      placeholder="PMDC-12345-D"
                      value={licenseNo}
                      onChange={(e) => setLicenseNo(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 focus:border-blue-500 rounded-xl text-xs transition outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Consultation Fee (PKR)</label>
                    <input
                      type="number"
                      placeholder="1500"
                      value={consultationFee}
                      onChange={(e) => setConsultationFee(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 focus:border-blue-500 rounded-xl text-xs transition outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Availability Schedule</label>
                    <input
                      type="text"
                      placeholder="Mon-Fri 9:00 AM - 5:00 PM"
                      value={availability}
                      onChange={(e) => setAvailability(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 focus:border-blue-500 rounded-xl text-xs transition outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {!isLogin && (role === "Admin" || role === "Receptionist" || role === "Pharmacist") && (
              <div className="p-4 bg-slate-950/30 border border-slate-800/80 rounded-2xl grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Assigned Department</label>
                  <input
                    type="text"
                    placeholder="General / ER / Pharmacy"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 focus:border-blue-500 rounded-xl text-xs transition outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Work Shift</label>
                  <select
                    value={shift}
                    onChange={(e) => setShift(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 focus:border-blue-500 rounded-xl text-xs transition outline-none text-slate-300"
                  >
                    <option value="Morning">Morning</option>
                    <option value="Evening">Evening</option>
                    <option value="Night">Night</option>
                  </select>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 active:scale-[0.99] transition duration-150 flex items-center justify-center gap-2 text-sm select-none disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing portal request...
                </>
              ) : isLogin ? (
                "Access Portal Dashboard"
              ) : (
                "Register Hospital Profile"
              )}
            </button>

          </form>
        </div>

      </div>
    </div>
  );
}
