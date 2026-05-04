import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Mail, User, ArrowRight } from "lucide-react";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);

  // Animation variants for smooth sliding
  const variants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      {/* Background Decorative Glow */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-orange-500/10 rounded-full blur-[120px]" />

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md bg-zinc-900/50 border border-zinc-800 backdrop-blur-xl p-8 rounded-2xl shadow-2xl"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h1>
          <p className="text-zinc-400 mt-2">
            {isLogin
              ? "Enter your credentials to manage stock"
              : "Register your shop to get started"}
          </p>
        </div>

        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <AnimatePresence mode="wait">
            {!isLogin && (
              <motion.div
                key="name-field"
                variants={variants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="relative"
              >
                <User
                  className="absolute left-3 top-3.5 text-zinc-500"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Full Name"
                  className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-orange-500 transition-colors"
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative">
            <Mail className="absolute left-3 top-3.5 text-zinc-500" size={18} />
            <input
              type="email"
              placeholder="Email Address"
              className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-orange-500 transition-colors"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-3.5 text-zinc-500" size={18} />
            <input
              type="password"
              placeholder="Password"
              className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-orange-500 transition-colors"
            />
          </div>

          <button className="w-full bg-orange-600 hover:bg-orange-500 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 group transition-all">
            {isLogin ? "Sign In" : "Register"}
            <ArrowRight
              size={18}
              className="group-hover:translate-x-1 transition-transform"
            />
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-zinc-400 hover:text-orange-400 text-sm transition-colors"
          >
            {isLogin
              ? "Don't have an account? Sign Up"
              : "Already have an account? Log In"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;

// import React from "react";
// import { motion } from "framer-motion";
// import { Globe, GitBranch, Share2, Link, Camera } from "lucide-react";
// const AuthPage = () => {
//   return (
//     <div className="min-h-screen bg-[#f3f4f6] flex items-center justify-center p-4 md:p-8">
//       {/* Main Container */}
//       <div className="w-full max-w-6xl bg-white rounded-[3rem] overflow-hidden flex flex-col md:flex-row shadow-2xl">
//         {/* Left Side: Visual/Art Section (Hidden on small mobile if needed, or shown first) */}
//         <div className="relative w-full md:w-[45%] h-[400px] md:h-auto overflow-hidden group">
//           <img
//             src="https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=2070&auto=format&fit=crop"
//             alt="Artistic background"
//             className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
//           />
//           {/* Overlay Content */}
//           <div className="absolute inset-0 bg-black/20 p-8 flex flex-col justify-between text-white">
//             <div className="flex justify-between items-center">
//               <span className="text-sm font-medium tracking-widest opacity-80">
//                 Selected Works
//               </span>
//               <div className="flex gap-4">
//                 <button className="text-xs font-semibold hover:underline">
//                   Sign Up
//                 </button>
//                 <button className="px-4 py-1.5 border border-white rounded-full text-xs font-semibold hover:bg-white hover:text-black transition-colors">
//                   Join Us
//                 </button>
//               </div>
//             </div>

//             <div className="flex justify-between items-end">
//               <div className="flex items-center gap-3">
//                 <div className="w-10 h-10 rounded-full bg-blue-400 border-2 border-white overflow-hidden">
//                   <img
//                     src="https://api.dicebear.com/7.x/avataaars/svg?seed=Andrew"
//                     alt="User"
//                   />
//                 </div>
//                 <div>
//                   <p className="text-sm font-bold">Andrew.ui</p>
//                   <p className="text-[10px] opacity-70">UI & Illustration</p>
//                 </div>
//               </div>
//               <div className="flex gap-2">
//                 <button className="w-8 h-8 rounded-full border border-white/50 flex items-center justify-center hover:bg-white/20">
//                   ←
//                 </button>
//                 <button className="w-8 h-8 rounded-full border border-white/50 flex items-center justify-center hover:bg-white/20">
//                   →
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Right Side: Login Form Section */}
//         <div className="w-full md:w-[55%] p-8 md:p-16 flex flex-col justify-center relative">
//           {/* Header elements */}
//           <div className="absolute top-8 left-8 md:left-12 flex justify-between w-[calc(100%-64px)] items-center">
//             <h2 className="text-xl font-black tracking-tighter text-slate-800 uppercase">
//               UISOCIAL
//             </h2>
//             <button className="flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-600">
//               <Globe size={14} /> EN ▾
//             </button>
//           </div>

//           <div className="mt-12 md:mt-0 max-w-sm mx-auto w-full">
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.2 }}
//               className="text-center md:text-left mb-10"
//             >
//               <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-2">
//                 Hi Designer
//               </h1>
//               <p className="text-slate-400 font-medium">Welcome to UISOCIAL</p>
//             </motion.div>

//             <form className="space-y-4">
//               <div className="space-y-1">
//                 <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">
//                   Email
//                 </label>
//                 <input
//                   type="email"
//                   className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
//                 />
//               </div>
//               <div className="space-y-1">
//                 <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">
//                   Password
//                 </label>
//                 <input
//                   type="password"
//                   className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
//                 />
//               </div>
//               <div className="text-right">
//                 <button className="text-[10px] font-bold text-orange-500 hover:underline">
//                   Forgot password ?
//                 </button>
//               </div>

//               <div className="py-4 flex items-center gap-4">
//                 <div className="h-[1px] bg-slate-100 flex-1"></div>
//                 <span className="text-[10px] font-bold text-slate-300">OR</span>
//                 <div className="h-[1px] bg-slate-100 flex-1"></div>
//               </div>

//               <button className="w-full flex items-center justify-center gap-3 py-3 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-colors">
//                 <img
//                   src="https://www.svgrepo.com/show/355037/google.svg"
//                   className="w-5 h-5"
//                   alt="Google"
//                 />
//                 Login with Google
//               </button>

//               <button className="w-full py-4 bg-[#EB4E31] text-white rounded-xl font-bold shadow-lg shadow-orange-200 hover:bg-[#d4432a] transition-all active:scale-[0.98] mt-2">
//                 Login
//               </button>
//             </form>

//             <div className="mt-8 text-center">
//               <p className="text-xs font-bold text-slate-400">
//                 Don't have an account?{" "}
//                 <span className="text-orange-500 cursor-pointer hover:underline">
//                   Sign up
//                 </span>
//               </p>

//               <div className="flex justify-center gap-6 mt-10 text-slate-400">
//                 <GitBranch
//                   size={18}
//                   className="hover:text-slate-900 cursor-pointer transition-colors"
//                 />
//                 <Share2
//                   size={18}
//                   className="hover:text-slate-900 cursor-pointer transition-colors"
//                 />
//                 <Link
//                   size={18}
//                   className="hover:text-slate-900 cursor-pointer transition-colors"
//                 />
//                 <Camera
//                   size={18}
//                   className="hover:text-slate-900 cursor-pointer transition-colors"
//                 />
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AuthPage;
