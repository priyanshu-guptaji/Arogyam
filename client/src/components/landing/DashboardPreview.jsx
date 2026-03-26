export function DashboardPreview() {
  return (
    <div className="relative">
      <div className="bg-white rounded-2xl shadow-2xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
        <div className="bg-slate-900 px-4 py-3 flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="bg-slate-800 rounded px-3 py-1 text-xs text-slate-400">arogyam.health</div>
          </div>
        </div>

        <div className="p-4 bg-slate-50">
          <div className="flex gap-4 mb-4">
            <div className="w-52 bg-white rounded-lg p-3 border border-slate-200">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                  <span className="text-sm">❤️</span>
                </div>
                <span className="text-xs text-slate-500">Heart Rate</span>
              </div>
              <div className="text-2xl font-bold text-slate-900">78 <span className="text-sm font-normal text-slate-400">bpm</span></div>
            </div>

            <div className="w-52 bg-white rounded-lg p-3 border border-slate-200">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                  <span className="text-sm">💨</span>
                </div>
                <span className="text-xs text-slate-500">Oxygen</span>
              </div>
              <div className="text-2xl font-bold text-slate-900">97 <span className="text-sm font-normal text-slate-400">%</span></div>
            </div>

            <div className="w-52 bg-white rounded-lg p-3 border border-slate-200">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                  <span className="text-sm">🩸</span>
                </div>
                <span className="text-xs text-slate-500">Blood Pressure</span>
              </div>
              <div className="text-2xl font-bold text-slate-900">120/80</div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 border border-slate-200 mb-4">
            <div className="text-xs font-semibold text-slate-700 mb-2">Weekly Health Trends</div>
            <div className="flex items-end gap-1 h-16">
              {[40, 65, 45, 80, 55, 70, 60].map((h, i) => (
                <div key={i} className="flex-1 bg-blue-500 rounded-t" style={{ height: `${h}%` }} />
              ))}
            </div>
            <div className="flex justify-between mt-1 text-[10px] text-slate-400">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Sun</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-lg p-3 border border-slate-200">
              <div className="text-xs font-semibold text-slate-700 mb-2">Recent Alerts</div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-yellow-500" />
                  <span className="text-xs text-slate-600">Margaret T. - Elevated BP</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-xs text-slate-600">Robert J. - Normal</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-red-100/50 rounded-lg p-3 border border-red-200">
              <div className="text-xs font-semibold text-red-700 mb-2">Emergency</div>
              <button className="w-full py-2 px-3 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 transition-colors">
                SOS Button
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-blue-600 rounded-full opacity-10 blur-2xl" />
      <div className="absolute -top-4 -left-4 w-32 h-32 bg-slate-200 rounded-full opacity-50 blur-3xl" />
    </div>
  );
}
