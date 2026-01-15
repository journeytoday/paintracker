import AnatomyScene from '../components/AnatomyScene';
import PainLogPanel from '../components/PainLogPanel';

export default function Dashboard() {
  return (
    <div className="h-[calc(100vh-4rem)] flex overflow-hidden">
      <div className="flex-1 relative">
        <AnatomyScene />
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4 border border-slate-200">
          <h1 className="text-lg font-bold text-slate-900">Interactive Body Map</h1>
          <p className="text-sm text-slate-600 mt-1">Click on a body part to log symptoms</p>
        </div>
      </div>
      <PainLogPanel />
    </div>
  );
}
