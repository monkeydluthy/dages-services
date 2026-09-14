import siteConfig from '../config/siteConfig.json'

function formatList(items) {
  if (items.length === 0) return ''
  if (items.length === 1) return items[0]
  if (items.length === 2) return `${items[0]} and ${items[1]}`
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`
}

const questions = [
  {
    id: 'estimates',
    question: 'Do you offer free estimates?',
    answer:
      'Yes. Tell us the job and Joseph will quote it. No charge to come look.',
  },
  {
    id: 'licensed',
    question: 'Are you licensed and insured?',
    answer: 'Yes. Licensed and insured — family-run out of Plant City.',
  },
  {
    id: 'storm',
    question: 'How fast can you get here for storm damage?',
    answer:
      'Call or send the form. Storm and hazardous jobs go first — Joseph usually calls back within minutes.',
  },
  {
    id: 'stump',
    question: 'Do you handle stump grinding and hauling debris?',
    answer: 'Yes. Stump grinding is on the list, and we haul what we cut.',
  },
  {
    id: 'areas',
    question: 'What areas do you serve?',
    answer: `Yes. ${formatList(siteConfig.counties)} counties — including ${formatList(siteConfig.cities)}.`,
  },
]

function FAQ() {
  return (
    <section className="bg-brandTint">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:py-16">
        <h2 className="mb-6 text-2xl font-bold text-ink sm:mb-8 sm:text-3xl">
          Common questions
        </h2>
        <div className="rounded-lg border border-brand/20 bg-white px-4 sm:px-6">
          {questions.map((item) => (
            <details
              key={item.id}
              className="group border-b border-brand/20 last:border-b-0"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-left text-base font-semibold text-ink [&::-webkit-details-marker]:hidden">
                {item.question}
                <svg
                  className="h-5 w-5 shrink-0 text-brand transition-transform group-open:rotate-180"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M6 9l6 6 6-6"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </summary>
              <p className="pb-4 text-sm text-ink/70">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}

export default FAQ
