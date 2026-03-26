const roles = [
  {
    icon: '👩‍⚕️',
    title: 'Care Manager',
    description: 'Full control over patient data. Add new residents, record vitals, manage alerts, and oversee the health of everyone in your care.',
    features: ['Add and manage patients', 'Record vital signs', 'Handle all alerts', 'View complete history'],
    borderClass: 'hover:border-blue-300',
    bgClass: 'bg-blue-50',
    textClass: 'text-blue-600',
  },
  {
    icon: '👴',
    title: 'Parent',
    description: 'See your own health data, track trends over time, and have peace of mind knowing emergency help is just a button press away.',
    features: ['Personal health dashboard', 'SOS emergency button', 'Trend charts', 'Medication reminders'],
    borderClass: 'hover:border-amber-300',
    bgClass: 'bg-amber-50',
    textClass: 'text-amber-600',
  },
  {
    icon: '👩',
    title: 'Child',
    description: "Check in on your parent's well-being whenever you want. Stay informed without overwhelming yourself with medical jargon.",
    features: ['Read-only health view', 'Alert notifications', 'Health status badge', 'Weekly summary'],
    borderClass: 'hover:border-green-300',
    bgClass: 'bg-green-50',
    textClass: 'text-green-600',
  },
];

export function RolesSection() {
  return (
    <section id="roles" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Built for Different Needs</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Each role gets exactly the features they need, nothing more.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roles.map((role, index) => (
            <div
              key={index}
              className={`rounded-2xl p-6 border-2 border-slate-100 bg-white hover:shadow-xl transition-all duration-300 ${role.borderClass}`}
            >
              <div className="flex items-center gap-3 mb-5">
                <div className={`w-12 h-12 rounded-xl ${role.bgClass} flex items-center justify-center text-2xl`}>
                  {role.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900">{role.title}</h3>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed mb-5">
                {role.description}
              </p>

              <ul className="space-y-3">
                {role.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-slate-700">
                    <svg className={`w-5 h-5 ${role.textClass} flex-shrink-0`} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
