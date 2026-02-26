import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Results from "./pages/Results";
import HelpCenters from "./pages/HelpCenters";
import ProcessingScreen from "./pages/ProcessingScreen";
import BottomNavbar from "./components/BottomNavbar";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/processing" element={<ProcessingScreen />} />
          <Route path="/results" element={<Results />} />
          <Route path="/help-centers" element={<HelpCenters />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <BottomNavbar />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
