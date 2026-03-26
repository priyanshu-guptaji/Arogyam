const steps = [
  {
    number: '01',
    title: 'Care staff records vitals',
    description: 'Using the dashboard, nurses and caregivers input heart rate, blood pressure, and oxygen readings for each patient.',
  },
  {
    number: '02',
    title: 'System checks for issues',
    description: 'The platform automatically flags any readings that fall outside healthy ranges and creates an alert.',
  },
  {
    number: '03',
    title: 'Alerts get generated',
    description: 'Critical readings trigger immediate notifications to the appropriate care team members.',
  },
  {
    number: '04',
    title: 'Family stays informed',
    description: 'Parents and children get notified through the app and can check health history anytime, from anywhere.',
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">How It Works</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Three simple steps to better health monitoring.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-blue-200 hover:shadow-lg transition-all">
                <div className="text-5xl font-bold text-blue-100 mb-4">{step.number}</div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{step.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2">
                  <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
