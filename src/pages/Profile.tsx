import React from "react";

const Profile: React.FC = () => (
  <div className="flex flex-col items-center min-h-[60vh] py-10 bg-gradient-to-br from-blue-600 via-cyan-400 to-pink-300">
    <div className="w-full max-w-md sm:max-w-lg bg-white/90 rounded-2xl shadow-2xl p-8 border border-border flex flex-col items-center justify-center">
      <h2 className="text-2xl font-bold text-blue-900 mb-4">My Profile</h2>
      <p className="text-lg text-gray-700 text-center">
        Profile fields have been moved to the <span className="font-semibold text-blue-700">About Me</span> screen.
      </p>
    </div>
  </div>
);

export default Profile;