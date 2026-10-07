import siteConfig from './siteConfig.json' with { type: 'json' }

export const SITE_ORIGIN = 'https://dagesservices.com'

export function cityToSlug(city) {
  return String(city)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function servicePath(slug) {
  return `/services/${slug}`
}

export function areaPath(slug) {
  return `/areas/${slug}`
}

function formatList(items) {
  if (items.length === 0) return ''
  if (items.length === 1) return items[0]
  if (items.length === 2) return `${items[0]} and ${items[1]}`
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`
}

const countyList = formatList(siteConfig.counties)
const cityList = formatList(siteConfig.cities)

export const servicePages = [
  {
    slug: 'tree-removal',
    jobType: 'Tree removal',
    title: 'Tree Removal in Plant City & Tampa Bay | Dages Services',
    metaDescription:
      'Full takedown of trees that are too close, damaged, or in the way. Family-run out of Plant City — same-business-day callback.',
    h1: 'Tree Removal in Plant City & Tampa Bay',
    intro:
      'When a tree is too close to the house, split, or in the way, we take it down carefully and haul what we cut. Tell us the job and we follow up the same business day.',
    sections: [
      {
        heading: 'When a takedown is the right call',
        body: 'Leaning, damaged, or crowding a roof or driveway — those are the trees we remove. If it can be saved with trimming, we say so.',
      },
      {
        heading: 'Tight access and hazards',
        body: "If there isn't a safe way to drop it piece by piece, we bring in a crane. Hazardous work next to lines or structures is something we handle, not something we skip.",
      },
    ],
    faqs: [
      {
        id: 'estimates',
        question: 'Do you offer free estimates?',
        answer: "Yes. Tell us the job and we'll quote it. No charge to come look.",
      },
      {
        id: 'haul',
        question: 'Do you haul the tree away?',
        answer: "We haul what we cut. You're not left with a yard full of branches.",
      },
      {
        id: 'stump',
        question: 'Can you grind the stump too?',
        answer: 'Yes. Stump grinding is on the list, and we grind below grade so the area is usable again.',
      },
    ],
    related: [
      { type: 'service', slug: 'stump-grinding' },
      { type: 'service', slug: 'hazardous-removal' },
      { type: 'area', slug: 'plant-city' },
    ],
  },
  {
    slug: 'tree-trimming',
    jobType: 'Tree trimming',
    title: 'Tree Trimming in Plant City & Tampa Bay | Dages Services',
    metaDescription:
      'Shape and thin trees so they stay healthy and clear of your house. Licensed and insured — based in Plant City.',
    h1: 'Tree Trimming in Plant City & Tampa Bay',
    intro:
      'We shape and thin trees so they stay healthy and off the roof. Storm and hazardous jobs go first, but trimming happens year-round.',
    sections: [
      {
        heading: 'Clear of the house, still a tree',
        body: 'The goal is a tree that can take Tampa Bay weather without hanging over the house. We cut what needs to come off, not the whole canopy for the sake of it.',
      },
      {
        heading: 'Deadwood while we are up there',
        body: 'Dead limbs come out before they fall. If the tree needs more than a trim, we will say so before we start.',
      },
    ],
    faqs: [
      {
        id: 'year-round',
        question: 'Do you only trim after storms?',
        answer:
          'Storm and hazardous jobs get priority when they come in, but trimming happens year-round.',
      },
      {
        id: 'licensed',
        question: 'Are you licensed and insured?',
        answer: 'Yes. Licensed and insured — family-run out of Plant City.',
      },
      {
        id: 'estimates',
        question: 'Do you quote before you cut?',
        answer: "Yes. Tell us the job and we'll quote it. No charge to come look.",
      },
    ],
    related: [
      { type: 'service', slug: 'deadwooding' },
      { type: 'service', slug: 'tree-removal' },
      { type: 'area', slug: 'plant-city' },
    ],
  },
  {
    slug: 'stump-grinding',
    jobType: 'Stump grinding',
    title: 'Stump Grinding in Plant City & Tampa Bay | Dages Services',
    metaDescription:
      'Grind stumps below grade so you can use the yard again. Family-run tree service based in Plant City.',
    h1: 'Stump Grinding in Plant City & Tampa Bay',
    intro:
      'Stumps get ground below grade, not just cut off at the top, so you can replant or put in a patio. We can grind after a removal or come for the stump on its own.',
    sections: [
      {
        heading: 'Below grade, then the yard is usable',
        body: 'We grind low enough that you are not left with a mound in the way of grass, a patio, or a new tree.',
      },
      {
        heading: 'After a removal or as a stand-alone job',
        body: 'If we took the tree down, ask about the stump while we are there. If the tree is already gone, we still come for the grind.',
      },
    ],
    faqs: [
      {
        id: 'grade',
        question: 'Can you grind a stump low enough to replant or put in a patio?',
        answer:
          "Yes — stumps are ground below grade, not just cut off at the top, so the area's actually usable again.",
      },
      {
        id: 'haul',
        question: 'Do you haul debris?',
        answer: 'Yes. Stump grinding is on the list, and we haul what we cut.',
      },
      {
        id: 'estimates',
        question: 'Do you offer free estimates?',
        answer: "Yes. Tell us the job and we'll quote it. No charge to come look.",
      },
    ],
    related: [
      { type: 'service', slug: 'tree-removal' },
      { type: 'service', slug: 'lot-clearing' },
      { type: 'area', slug: 'plant-city' },
    ],
  },
  {
    slug: 'deadwooding',
    jobType: 'Deadwooding',
    title: 'Deadwooding in Plant City & Tampa Bay | Dages Services',
    metaDescription:
      'Cut out dead limbs before they fall and damage property. Licensed tree service based in Plant City.',
    h1: 'Deadwooding in Plant City & Tampa Bay',
    intro:
      'Dead limbs come out before they fall on a roof, a fence, or a car. If the rest of the tree needs a trim or a takedown, we tell you that up front.',
    sections: [
      {
        heading: 'Take the dead wood, leave the tree',
        body: 'We cut out what is already dead so it cannot drop on its own. The live canopy stays if the tree is otherwise sound.',
      },
      {
        heading: 'When deadwood is a warning',
        body: 'A lot of dead wood can mean the tree is on the way out. We will say if removal is the safer job.',
      },
    ],
    faqs: [
      {
        id: 'estimates',
        question: 'Do you offer free estimates?',
        answer: "Yes. Tell us the job and we'll quote it. No charge to come look.",
      },
      {
        id: 'year-round',
        question: 'Is this year-round work?',
        answer:
          'Storm and hazardous jobs get priority when they come in, but trimming, deadwooding, and removals happen year-round.',
      },
      {
        id: 'licensed',
        question: 'Are you licensed and insured?',
        answer: 'Yes. Licensed and insured — family-run out of Plant City.',
      },
    ],
    related: [
      { type: 'service', slug: 'tree-trimming' },
      { type: 'service', slug: 'hazardous-removal' },
      { type: 'area', slug: 'plant-city' },
    ],
  },
  {
    slug: 'storm-cleanup',
    jobType: 'Storm cleanup',
    title: 'Storm Cleanup in Plant City & Tampa Bay | Dages Services',
    metaDescription:
      'Clear fallen trees and debris after Tampa Bay storms. Storm and hazardous jobs go first — same-business-day callback.',
    h1: 'Storm Cleanup in Plant City & Tampa Bay',
    intro:
      'After a Tampa Bay storm, fallen trees and debris get cleared so you can use the yard again. Storm and hazardous jobs go first. Call or send the form — we follow up the same business day.',
    sections: [
      {
        heading: 'Storm jobs go first',
        body: 'When the weather takes trees down, those calls jump the line. We follow up the same business day and get to the site as soon as we can work it safely.',
      },
      {
        heading: 'Haul what we cut',
        body: "We clear the tree and the debris. You're not left stacking branches at the curb.",
      },
    ],
    faqs: [
      {
        id: 'speed',
        question: 'How fast can you get here for storm damage?',
        answer: `Call or send the form. Storm and hazardous jobs go first — we follow up ${siteConfig.callbackPromise}.`,
      },
      {
        id: 'year-round',
        question: 'Do you only work after storms?',
        answer:
          'Storm and hazardous jobs get priority when they come in, but trimming, removals, and stump grinding happen year-round.',
      },
      {
        id: 'haul',
        question: 'Will you haul away all the debris?',
        answer: "We haul what we cut. You're not left with a yard full of branches.",
      },
    ],
    related: [
      { type: 'service', slug: 'hazardous-removal' },
      { type: 'service', slug: 'tree-removal' },
      { type: 'area', slug: 'plant-city' },
    ],
  },
  {
    slug: 'hazardous-removal',
    jobType: 'Hazardous removal',
    title: 'Hazardous Tree Removal in Plant City & Tampa Bay | Dages Services',
    metaDescription:
      'Careful takedown of leaning, split, or near-power-line trees. Family-run, licensed, and insured out of Plant City.',
    h1: 'Hazardous Tree Removal in Plant City & Tampa Bay',
    intro:
      'Leaning, split, or close to lines or the house — those are jobs we handle carefully, not jobs we avoid. Storm and hazardous work go first.',
    sections: [
      {
        heading: 'Close to lines or the house',
        body: 'Hazardous removals next to power lines or structures are something we take on with a plan, not something we pass on.',
      },
      {
        heading: 'When a crane is the safe way down',
        body: "If there is no safe way to bring it down piece by piece, we bring in a crane instead of risking it.",
      },
    ],
    faqs: [
      {
        id: 'lines',
        question: 'Do you handle trees near power lines or my house?',
        answer:
          'Yes. Hazardous removals — leaning, split, or close to lines or structures — are something we handle carefully, not something we avoid.',
      },
      {
        id: 'speed',
        question: 'How fast can you get here?',
        answer: `Call or send the form. Storm and hazardous jobs go first — we follow up ${siteConfig.callbackPromise}.`,
      },
      {
        id: 'licensed',
        question: 'Are you licensed and insured?',
        answer: 'Yes. Licensed and insured — family-run out of Plant City.',
      },
    ],
    related: [
      { type: 'service', slug: 'crane-removal' },
      { type: 'service', slug: 'storm-cleanup' },
      { type: 'area', slug: 'plant-city' },
    ],
  },
  {
    slug: 'crane-removal',
    jobType: 'Crane removal',
    title: 'Crane Tree Removal in Plant City & Tampa Bay | Dages Services',
    metaDescription:
      'Tight-access jobs where a crane is the safe way down. Family-run tree service based in Plant City.',
    h1: 'Crane Tree Removal in Plant City & Tampa Bay',
    intro:
      "When a tree is too big or too tight to drop normally, that's what the crane is for. We bring it in instead of forcing a takedown that is not safe.",
    sections: [
      {
        heading: 'No room to drop it',
        body: "Fenced yards, trees over the house, no path for sections to fall — those are crane jobs. We do not try to muscle through a drop that does not have a landing.",
      },
      {
        heading: 'Same crew, right tool',
        body: 'Crane work is a regular part of the job list, not a special request we have to hunt down a sub for.',
      },
    ],
    faqs: [
      {
        id: 'when',
        question: 'What if a tree is too big or too tight to drop normally?',
        answer:
          "That's what the crane is for. When there's no safe way to bring a tree down piece by piece, we bring in a crane instead of risking it.",
      },
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
    ],
    related: [
      { type: 'service', slug: 'hazardous-removal' },
      { type: 'service', slug: 'tree-removal' },
      { type: 'area', slug: 'plant-city' },
    ],
  },
  {
    slug: 'lot-clearing',
    jobType: 'Lot clearing',
    title: 'Lot Clearing in Plant City & Tampa Bay | Dages Services',
    metaDescription:
      'Clear trees and brush so a lot is ready to build or sell. Family-run crew based in Plant City.',
    h1: 'Lot Clearing in Plant City & Tampa Bay',
    intro:
      'Lot clearing is one of our regular jobs, not a special request. We clear trees and brush so a lot is ready to build or sell, and we haul what we cut.',
    sections: [
      {
        heading: 'Whole lots, not just one tree',
        body: 'We take down what needs to come off the lot and grind stumps when you want the ground usable again.',
      },
      {
        heading: 'Tell us what the lot is for',
        body: 'Build, sell, or just get it walkable — that changes what stays and what goes. We quote it before we start.',
      },
    ],
    faqs: [
      {
        id: 'lots',
        question: 'Do you clear whole lots, not just single trees?',
        answer: 'Yes, lot clearing is one of our regular jobs, not a special request.',
      },
      {
        id: 'stump',
        question: 'Can you grind stumps after clearing?',
        answer: 'Yes. Stump grinding is on the list, and we grind below grade so the area is usable again.',
      },
      {
        id: 'estimates',
        question: 'Do you offer free estimates?',
        answer: "Yes. Tell us the job and we'll quote it. No charge to come look.",
      },
    ],
    related: [
      { type: 'service', slug: 'tree-removal' },
      { type: 'service', slug: 'stump-grinding' },
      { type: 'area', slug: 'plant-city' },
    ],
  },
]

const areaRelatedServices = [
  { type: 'service', slug: 'tree-removal' },
  { type: 'service', slug: 'storm-cleanup' },
  { type: 'service', slug: 'tree-trimming' },
]

export const areaPages = siteConfig.cities.map((city, index) => {
  const nearby = siteConfig.cities
    .filter((name) => name !== city)
    .slice(index % 3, index % 3 + 2)
    .concat(
      siteConfig.cities.filter((name) => name !== city).slice(0, 2),
    )
    .filter((name, i, list) => list.indexOf(name) === i)
    .slice(0, 2)

  return {
    slug: cityToSlug(city),
    city,
    title: `Tree Service in ${city}, FL | Dages Services`,
    metaDescription: `Tree removal, trimming, stump grinding, and storm work in ${city}. Family-run out of Plant City — same-business-day callback.`,
    h1: `Tree Service in ${city}`,
    intro: `Dages Services is based in Plant City and regularly works in ${city} — removal, trimming, stump grinding, storm cleanup, and hazardous jobs across ${countyList} counties. Tell us the job and we follow up the same business day.`,
    sections: [
      {
        heading: `Work we do in ${city}`,
        body: `Tree removal, trimming, deadwooding, stump grinding, storm cleanup, hazardous and crane work, and lot clearing. If it is in ${city} and it is a tree job, send it.`,
      },
      {
        heading: 'Same-business-day callback',
        body: `Storm and hazardous jobs go first. For everything else in ${city}, we still follow up ${siteConfig.callbackPromise}. Licensed and insured — family-run out of Plant City.`,
      },
    ],
    faqs: [
      {
        id: 'areas',
        question: `Do you work in ${city}?`,
        answer: `Yes. We serve ${countyList} counties — including ${cityList}. ${city} is on the regular list.`,
      },
      {
        id: 'speed',
        question: 'How fast can you get here?',
        answer: `Call or send the form. Storm and hazardous jobs go first — we follow up ${siteConfig.callbackPromise}.`,
      },
      {
        id: 'licensed',
        question: 'Are you licensed and insured?',
        answer: 'Yes. Licensed and insured — family-run out of Plant City.',
      },
    ],
    related: [
      ...areaRelatedServices,
      ...nearby.map((name) => ({ type: 'area', slug: cityToSlug(name) })),
    ],
  }
})

const serviceBySlug = new Map(servicePages.map((page) => [page.slug, page]))
const areaBySlug = new Map(areaPages.map((page) => [page.slug, page]))

export function getServicePage(slug) {
  return serviceBySlug.get(slug) ?? null
}

export function getAreaPage(slug) {
  return areaBySlug.get(slug) ?? null
}

export function resolveRelated(related = []) {
  return related.flatMap((ref) => {
    if (ref.type === 'service') {
      const page = getServicePage(ref.slug)
      return page
        ? [{ to: servicePath(page.slug), label: page.jobType || page.h1 }]
        : []
    }
    if (ref.type === 'area') {
      const page = getAreaPage(ref.slug)
      return page ? [{ to: areaPath(page.slug), label: page.city || page.h1 }] : []
    }
    return []
  })
}

export function getContentRoutes() {
  return [
    { path: '/', changefreq: 'weekly', priority: '1.0' },
    ...servicePages.map((page) => ({
      path: servicePath(page.slug),
      changefreq: 'monthly',
      priority: '0.8',
    })),
    ...areaPages.map((page) => ({
      path: areaPath(page.slug),
      changefreq: 'monthly',
      priority: '0.7',
    })),
  ]
}
