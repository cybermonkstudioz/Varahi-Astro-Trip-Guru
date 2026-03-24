import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const AdminLayout = () => {
  return (
    <div className="flex h-screen overflow-hidden font-sans text-white bg-[#0B1221] print:bg-white print:text-black print:overflow-visible print:h-auto">
      {/* Subtle luxury background elements */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] print:hidden"></div>
      
      {/* Sidebar is fixed width */}
      <div className="print:hidden h-full flex shrink-0">
        <Sidebar />
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative z-10 w-full min-w-0 print:h-auto print:block">
        {/* Top Header */}
        <header className="h-20 shrink-0 bg-[#0B1221]/95 backdrop-blur border-b border-white/5 px-10 flex justify-between items-center z-20 print:hidden">
          <h2 className="text-lg font-medium tracking-wide text-gray-300">Admin Dashboard</h2>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-[#111C35] border border-white/10 flex items-center justify-center text-[#D4AF37] font-semibold text-sm cursor-pointer hover:bg-[#1a2c42] transition-colors">
              SG
            </div>
          </div>
        </header>
        
        {/* Scrollable Main Area */}
        <main className="flex-1 overflow-y-auto p-10 print:overflow-visible print:h-auto print:p-0">
          <div className="max-w-[1600px] mx-auto print:max-w-none">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
