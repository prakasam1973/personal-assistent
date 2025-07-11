import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";

const defaultProfile = {
  profilePic: "",
  linkedin: "",
  instagram: "",
  facebook: "",
  liveUrl: "",
};

const AboutMe: React.FC = () => {
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem("userProfile");
    return saved ? JSON.parse(saved) : defaultProfile;
  });
  const [preview, setPreview] = useState(profile.profilePic);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPreview(ev.target?.result as string);
        setProfile((prev: any) => ({ ...prev, profilePic: ev.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    localStorage.setItem("userProfile", JSON.stringify({ ...profile, profilePic: preview }));
    alert("Profile saved!");
  };

  return (
    <div className="flex flex-col items-center min-h-[80vh] py-12 bg-gray-100 font-[Segoe UI]">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">About Me</h2>
            <p className="text-sm text-gray-500 mt-1">Professional Profile & Contact</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="relative w-20 h-20">
              <img
                src={preview || "https://ui-avatars.com/api/?name=Prakasam+Sellappan"}
                alt="Profile"
                className="w-20 h-20 rounded-full object-cover border-2 border-blue-200 shadow"
              />
              <Button
                type="button"
                className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-1 shadow hover:bg-blue-700"
                onClick={() => fileInputRef.current?.click()}
                style={{ fontSize: 12, minWidth: 0, minHeight: 0, width: 28, height: 28 }}
              >
                <span role="img" aria-label="Upload">📷</span>
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </div>
          </div>
        </div>
        {/* Editable Profile Fields */}
        <div className="px-8 py-6 flex flex-col md:flex-row gap-8">
          <div className="flex-1 space-y-4">
            <div>
              <label className="block font-semibold mb-1 text-gray-700" htmlFor="linkedin">
                LinkedIn
              </label>
              <input
                id="linkedin"
                name="linkedin"
                type="url"
                placeholder="https://linkedin.com/in/yourprofile"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-200 transition bg-gray-50"
                value={profile.linkedin}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="block font-semibold mb-1 text-gray-700" htmlFor="instagram">
                Instagram
              </label>
              <input
                id="instagram"
                name="instagram"
                type="url"
                placeholder="https://instagram.com/yourprofile"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-pink-200 transition bg-gray-50"
                value={profile.instagram}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="block font-semibold mb-1 text-gray-700" htmlFor="facebook">
                Facebook
              </label>
              <input
                id="facebook"
                name="facebook"
                type="url"
                placeholder="https://facebook.com/yourprofile"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-200 transition bg-gray-50"
                value={profile.facebook}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="block font-semibold mb-1 text-gray-700" htmlFor="liveUrl">
                Application Live URL
              </label>
              <input
                id="liveUrl"
                name="liveUrl"
                type="url"
                placeholder="https://your-app-url.com"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-200 transition bg-gray-50"
                value={profile.liveUrl || ""}
                onChange={handleInputChange}
              />
            </div>
            <div className="flex gap-4">
              <Button className="bg-blue-600 text-white flex-1 shadow hover:bg-blue-700 transition" onClick={handleSave}>
                Save Profile
              </Button>
            </div>
          </div>
          {/* Contact & Social */}
          <div className="flex-1 flex flex-col items-center justify-center space-y-4">
            <h3 className="text-lg font-bold text-gray-800">Contact</h3>
            <div className="flex flex-col items-center gap-2">
              {profile.linkedin && (
                <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline flex items-center gap-1">
                  <span role="img" aria-label="LinkedIn">🔗</span> LinkedIn
                </a>
              )}
              {profile.instagram && (
                <a href={profile.instagram} target="_blank" rel="noopener noreferrer" className="text-pink-600 hover:underline flex items-center gap-1">
                  <span role="img" aria-label="Instagram">📸</span> Instagram
                </a>
              )}
              {profile.facebook && (
                <a href={profile.facebook} target="_blank" rel="noopener noreferrer" className="text-blue-800 hover:underline flex items-center gap-1">
                  <span role="img" aria-label="Facebook">📘</span> Facebook
                </a>
              )}
              {profile.liveUrl && (
                <a href={profile.liveUrl} target="_blank" rel="noopener noreferrer" className="text-green-700 hover:underline flex items-center gap-1">
                  <span role="img" aria-label="Live URL">🌐</span> Application Live URL
                </a>
              )}
            </div>
          </div>
        </div>
        <hr className="border-t border-gray-200 my-0" />
        {/* Static About Me info */}
        <div className="px-8 py-8">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Prakasam Sellappan</h3>
          <p className="text-blue-700 font-medium mb-4">Engineering Leader</p>
          <div className="text-gray-700 text-base leading-relaxed space-y-4">
            <p>
              Seasoned Engineering Leader with Extensive Experience in J2EE/.NET Enterprise Cloud Software Development and ISO/CMMi3 Quality Processes. Recognized Agile Scrum Expert with Proficiency in Managing Cross-Cultural Teams and Fostering Strong Organizational Cultures. Successfully Oversaw More Than 10 Simultaneous Product Developments, generating Over $100M in Annual Revenue. Demonstrated Expertise in Recruitment, Training, and Mentoring to Establish High-Performance Teams. Additionally, Actively Engaged in Corporate Social Responsibility, Ensuring Meaningful Impact on Communities and Environmental Sustainability. Trusted Advisor to Business Leadership on All CSR Matters.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutMe;