import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import MomNotesList from "./pages/MomNotesList";
import Profile from "./pages/Profile";
import AboutMe from "./pages/AboutMe";
import CSRPage from "./pages/CSRPage";
import AttendancePage from "./pages/AttendancePage";
import AIAgent from "./pages/AIAgent";
import Dashboard from "./pages/Dashboard";
import Notepad from "./pages/Notepad";
import ExcelUploadPage from "./pages/ExcelUploadPage";

const queryClient = new QueryClient();
import { Link } from "react-router-dom";

// Modern app header for consistent branding and navigation
const AppHeader = () => (
  <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-border shadow-sm">
    <div className="max-w-5xl mx-auto flex items-center justify-between px-6 py-3">
      <div />
      <nav className="flex gap-4">
        <Link to="/" className="hover:text-blue-600 font-medium transition">Home</Link>
        <Link to="/dashboard" className="hover:text-blue-600 font-medium transition">Dashboard</Link>
        <Link to="/about" className="hover:text-blue-600 font-medium transition">About Me</Link>
      </nav>
    </div>
  </header>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppHeader />
        <main className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-indigo-100">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/mom" element={<MomNotesList />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/about" element={<AboutMe />} />
            <Route path="/csr-events" element={<CSRPage />} />
            <Route path="/attendance" element={<AttendancePage />} />
            <Route path="/ai-agent" element={null} />
            <Route path="/dashboard" element={<Dashboard />}>
              <Route path="notepad" element={<Notepad />} />
              <Route path="excel-upload" element={<ExcelUploadPage />} />
            </Route>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
