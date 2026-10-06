import { getFaqItems } from '../lib/faq'

function FAQ() {
  return (
    <section className="bg-brandTint">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:py-16">
        <h2 className="mb-6 text-2xl font-bold text-ink sm:mb-8 sm:text-3xl">
          Tree Service Questions, Answered
        </h2>
        <div className="rounded-lg border border-brand/20 bg-white px-4 sm:px-6">
          {getFaqItems().map((item) => (
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
