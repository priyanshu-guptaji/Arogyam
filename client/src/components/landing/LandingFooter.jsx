import { Link } from 'react-router-dom';

export function LandingFooter() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">E</span>
              </div>
              <span className="text-xl font-bold text-white">ElderCare</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
              Making elder care monitoring simpler, safer, and more accessible for everyone involved.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Platform</h4>
            <ul className="space-y-3">
              <li>
                <a href="#features" className="text-sm hover:text-white transition-colors">Features</a>
              </li>
              <li>
                <a href="#how-it-works" className="text-sm hover:text-white transition-colors">How It Works</a>
              </li>
              <li>
                <a href="#roles" className="text-sm hover:text-white transition-colors">For Who</a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-sm hover:text-white transition-colors">About Us</a>
              </li>
              <li>
                <a href="#" className="text-sm hover:text-white transition-colors">Contact</a>
              </li>
              <li>
                <a href="#" className="text-sm hover:text-white transition-colors">Privacy Policy</a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Account</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/login" className="text-sm hover:text-white transition-colors">Sign In</Link>
              </li>
              <li>
                <Link to="/register" className="text-sm hover:text-white transition-colors">Register</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} ElderCare Monitor. All rights reserved.
          </p>
          <p className="text-sm text-slate-500">
            Made with care for families everywhere
          </p>
        </div>
      </div>
    </footer>
  );
}
