import { Link } from 'react-router-dom';
import { MousePointer2, Calendar, FileText, Activity } from 'lucide-react';

export default function LandingPage() {

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center justify-center p-2 bg-primary-50 rounded-full mb-6">
              <Activity className="h-12 w-12 text-primary" />
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 mb-6 leading-tight">
              Visualize Your Pain.
              <span className="block text-primary mt-2">Empower Your Doctor.</span>
            </h1>
            <p className="text-xl text-slate-600 mb-10 leading-relaxed">
              Track your symptoms with precision, visualize patterns over time, and provide your healthcare team with the detailed information they need for better diagnosis and treatment.
            </p>
            <Link
              to="/signup"
              className="inline-block bg-primary hover:bg-primary-600 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Start Tracking
            </Link>
          </div>
        </div>
      </section>

      <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">How It Works</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Three simple steps to better communication with your healthcare provider
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            <div className="group bg-slate-50 rounded-2xl p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-slate-200">
              <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <MousePointer2 className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-2xl font-semibold text-slate-900 mb-4">1. Click 3D Model</h3>
              <p className="text-slate-600 leading-relaxed">
                Pinpoint the exact location of your pain or discomfort using our interactive 3D body model. No more struggling to describe where it hurts.
              </p>
            </div>

            <div className="group bg-slate-50 rounded-2xl p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-slate-200">
              <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Calendar className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-2xl font-semibold text-slate-900 mb-4">2. Log Daily Updates</h3>
              <p className="text-slate-600 leading-relaxed">
                Record your symptoms, pain levels, and relevant notes each day. Build a comprehensive timeline that reveals patterns and triggers.
              </p>
            </div>

            <div className="group bg-slate-50 rounded-2xl p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-slate-200">
              <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <FileText className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-2xl font-semibold text-slate-900 mb-4">3. Generate Report</h3>
              <p className="text-slate-600 leading-relaxed">
                Create detailed, professional reports to share with your doctor. Give them the complete picture they need for accurate diagnosis.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="team" className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 to-slate-100 mt-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-8">Our Team</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Dedicated to improving patient-doctor communication through technology
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="flex justify-center gap-8 mb-8">
              {[
                {
                  name: 'Dr. Sarah Chen',
                  role: 'Medical Director',
                  image: 'https://images.pexels.com/photos/5327585/pexels-photo-5327585.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop'
                },
                {
                  name: 'Michael Rodriguez',
                  role: 'Lead Developer',
                  image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop'
                },
                {
                  name: 'Emily Watson',
                  role: 'UX Designer',
                  image: 'https://images.pexels.com/photos/3756679/pexels-photo-3756679.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop'
                },
              ].map((member) => (
                <div
                  key={member.name}
                  className="bg-slate-50 rounded-lg p-5 text-center w-44 border border-slate-200"
                >
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-24 h-24 rounded-full mx-auto mb-3 object-cover"
                  />
                  <h3 className="text-base font-semibold text-slate-900 mb-1">{member.name}</h3>
                  <p className="text-sm text-slate-600">{member.role}</p>
                </div>
              ))}
            </div>

            <div className="flex justify-center gap-8">
              {[
                {
                  name: 'James Park',
                  role: 'Data Scientist',
                  image: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop'
                },
                {
                  name: 'Lisa Anderson',
                  role: 'Product Manager',
                  image: 'https://images.pexels.com/photos/3760263/pexels-photo-3760263.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop'
                },
              ].map((member) => (
                <div
                  key={member.name}
                  className="bg-slate-50 rounded-lg p-5 text-center w-44 border border-slate-200"
                >
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-24 h-24 rounded-full mx-auto mb-3 object-cover"
                  />
                  <h3 className="text-base font-semibold text-slate-900 mb-1">{member.name}</h3>
                  <p className="text-sm text-slate-600">{member.role}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8 border-t border-slate-800 mt-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
            <div>
              <h3 className="text-lg font-semibold mb-4">SymptomTracker</h3>
              <p className="text-sm text-slate-400">Track your health, empower your care</p>
              <p className="text-sm text-slate-400 mt-4">
                <span className="block font-medium text-white mb-1">Contact</span>
                support@symptomtracker.com
              </p>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
                <li><Link to="/signup" className="hover:text-white transition-colors">Sign Up</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Login</Link></li>
                <li><a href="#about" className="hover:text-white transition-colors">About</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-4">Features</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">3D Body Model</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pain Tracking</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Report Generation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Data Analytics</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-10 mt-2 text-center text-slate-400 text-sm">
            <p>© Copyright 2026 | SymptomTracker | All Rights Reserved</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
