import siteConfig from '../config/siteConfig.json' with { type: 'json' }

function formatList(items) {
  if (items.length === 0) return ''
  if (items.length === 1) return items[0]
  if (items.length === 2) return `${items[0]} and ${items[1]}`
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`
}

export function getFaqItems() {
  return [
    {
      id: 'estimates',
      question: 'Do you offer free estimates?',
      answer: "Yes. Tell us the job and we'll quote it. No charge to come look.",
    },
    {
      id: 'licensed',
      question: 'Are you licensed and insured?',
      answer: 'Yes. Licensed and insured — family-run out of Plant City.',
    },
    {
      id: 'storm',
      question: 'How fast can you get here for storm damage?',
      answer: `Call or send the form. Storm and hazardous jobs go first — we follow up ${siteConfig.callbackPromise}.`,
    },
    {
      id: 'stump',
      question: 'Do you handle stump grinding and hauling debris?',
      answer: 'Yes. Stump grinding is on the list, and we haul what we cut.',
    },
    {
      id: 'areas',
      question: 'What areas do you serve?',
      answer: `${formatList(siteConfig.counties)} counties — including ${formatList(siteConfig.cities)}.`,
    },
    {
      id: 'power-lines',
      question: 'Do you handle trees near power lines or my house?',
      answer:
        'Yes. Hazardous removals — leaning, split, or close to lines or structures — are something we handle carefully, not something we avoid.',
    },
    {
      id: 'crane',
      question: 'What if a tree is too big or too tight to drop normally?',
      answer:
        "That's what the crane is for. When there's no safe way to bring a tree down piece by piece, we bring in a crane instead of risking it.",
    },
    {
      id: 'haul-debris',
      question: 'Will you haul away all the debris, or do I need to deal with it?',
      answer: "We haul what we cut. You're not left with a yard full of branches.",
    },
    {
      id: 'grind-stump',
      question: 'Can you grind a stump low enough to replant or put in a patio?',
      answer:
        "Yes — stumps are ground below grade, not just cut off at the top, so the area's actually usable again.",
    },
    {
      id: 'lot-clearing',
      question: 'Do you clear whole lots, not just single trees?',
      answer: 'Yes, lot clearing is one of our regular jobs, not a special request.',
    },
    {
      id: 'year-round',
      question: 'Do you only work after storms, or year-round?',
      answer:
        'Storm and hazardous jobs get priority when they come in, but trimming, removals, and stump grinding happen year-round.',
    },
  ]
}

export function faqPageJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: getFaqItems().map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }
}
