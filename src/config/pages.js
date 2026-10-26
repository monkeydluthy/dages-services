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
    title: 'Tree Removal in Plant City, FL | Dages Services',
    metaDescription:
      'Tree removal in Plant City and Tampa Bay. Dead, leaning, or storm-damaged trees taken down and hauled away. Free estimates, same-business-day callback.',
    h1: 'Tree Removal in Plant City & Tampa Bay',
    intro:
      "If a tree is too close to your house, dead, split, or just in the way, we take it down and haul away what we cut. Dages Services is a family-run tree service based in Plant City. Send the job details and we'll call back the same business day.",
    sections: [
      {
        heading: 'When a takedown is the right call',
        body: "Not every rough-looking tree has to come down, and we'll tell you if trimming will do the job. These are the signs that usually point to removal:",
        bullets: [
          'Large dead branches high in the canopy, or limbs that are already broken and hanging',
          "A lean that's getting worse, or soil lifting on one side of the trunk",
          'Mushrooms or fungus at the base, or open cavities in the trunk',
          'Two trunks growing from one point in a tight V, with bark pinched between them, where the union can split',
          'A thinning crown, or roots that are lifted, damaged, or circling the base',
        ],
        paragraphs: [
          "One thing that trips people up in Florida: a tree with no leaves isn't always dead, because many local trees drop their leaves for part of the year. If you're not sure, send photos and we'll tell you what we see.",
          'These warning signs follow the [UF/IFAS Extension guide, Is my tree safe? Recognizing Conditions that Increase the Likelihood of Tree Failure](https://ask.ifas.ufl.edu/publication/EP507).',
        ],
      },
      {
        heading: 'How a removal job goes',
        steps: [
          'You send the job details. We call back the same business day.',
          "We look at the tree and what's around it: the house, fences, pool cage, power lines, and where the pieces can go. The estimate is free.",
          "We take the tree down. Trees close to a house, fence, or power line come down in sections. When there's no safe way to do that, a crane lifts the pieces out.",
          'We haul away what we cut.',
          'If you want the stump gone too, we grind it below grade so the area is usable again. See [stump grinding](/services/stump-grinding).',
        ],
      },
      {
        heading: 'What affects the cost',
        body: "We don't quote prices without seeing the job, because two trees that look alike can be very different jobs. What moves the number:",
        bullets: [
          'Size and height of the tree',
          'How close it is to a house, fence, pool cage, or power lines',
          'Whether equipment can get to it, or a crane is needed',
          'The condition of the wood. Dead or brittle trees are harder and riskier to take down',
          'How many trees, and how much there is to haul away',
          'Whether you want the stump ground',
        ],
      },
      {
        heading: 'Tight access, power lines, and crane work',
        body: "Some trees can't be climbed and dropped safely. They lean over a roof, sit in a fenced yard with no truck access, or stand next to power lines. For those jobs we use a crane to lift sections out. See [crane removal](/services/crane-removal) and [hazardous removal](/services/hazardous-removal).",
        paragraphs: [
          'If a tree or limb is touching a power line, stay clear, treat the line as live, and call your electric utility before anyone goes near it. Then call us.',
        ],
      },
      {
        type: 'gallery',
        heading: 'Tree removal jobs',
        body: 'Pine takedowns, dead palms, tight lots, and big trees that had to come down in sections. Here is some recent work.',
      },
      {
        heading: 'After a storm',
        body: 'If a tree has come down or a limb is hanging, choose "Emergency today" on the form and tell us what happened. Photos help us plan before we arrive, and you can add them right after you send the form. See [storm cleanup](/services/storm-cleanup).',
      },
    ],
    faqs: [
      {
        id: 'estimates',
        question: 'Do you offer free estimates?',
        answer: "Yes. There's no charge to come look at the job.",
      },
      {
        id: 'callback',
        question: 'How fast will someone call me back?',
        answer: "The same business day. If it's an emergency, say so on the form.",
      },
      {
        id: 'haul',
        question: 'Do you haul the tree away?',
        answer: 'Yes. We haul away what we cut.',
      },
      {
        id: 'stump',
        question: 'Can you grind the stump too?',
        answer: 'Yes. We grind stumps below grade so the area is usable again.',
      },
      {
        id: 'save',
        question: 'Can my tree be saved instead?',
        answer:
          "Sometimes. If trimming can fix the problem, we'll tell you that instead of recommending a takedown.",
      },
      {
        id: 'no-leaves',
        question: 'Is a tree with no leaves dead?',
        answer:
          "Not always. Many Florida trees drop their leaves for part of the year. Look at the branches and send us photos if you're unsure.",
      },
      {
        id: 'power-lines',
        question: 'Do you work near power lines?',
        answer:
          'Yes, hazardous work is part of what we do. Keep clear of any line and call your utility if a line is touched or down.',
      },
      {
        id: 'already-fell',
        question: 'What if the tree already fell?',
        answer:
          'Choose "Emergency today" on the form and add photos. See [storm cleanup](/services/storm-cleanup).',
      },
    ],
    related: [
      { type: 'service', slug: 'stump-grinding' },
      { type: 'service', slug: 'hazardous-removal' },
      { type: 'service', slug: 'crane-removal' },
      { type: 'service', slug: 'storm-cleanup' },
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
