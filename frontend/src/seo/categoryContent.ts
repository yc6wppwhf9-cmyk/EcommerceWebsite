// Buying-guide text shown under the products on the main category pages, and
// served to crawlers by the Vercel middleware. Written for the searches people
// make (Search Console): "priority school bags", "priority trolley bags",
// "priority backpack", "priority duffle bag"... Keep facts general and true:
// exact sizes, capacity and warranty belong on each product page.

export interface CategoryContent {
  heading: string;
  intro: string;
  sections: { heading: string; body: string }[];
  faqs: { q: string; a: string }[];
  related: [string, string][];
}

const BUY = 'Every product page links to Amazon, Myntra or Ajio, where you can check the current price and order with delivery across India.';

export const CATEGORY_CONTENT: Record<string, CategoryContent> = {
  'school-backpacks': {
    heading: 'Priority school bags for boys and girls',
    intro:
      'Priority school bags are made by High Spirit Commercial Ventures, a bag manufacturer with over 25 years of experience. The range covers nursery and primary school bags with cartoon and character prints, roomy bags for middle school, and sturdier backpacks for senior classes, in colours for boys and girls.',
    sections: [
      {
        heading: 'Which school bag size for which age?',
        body: 'A school bag should sit between the shoulders and the waist and never hang below the hips. As a guide: under 3 years, about a 14 inch bag; 3 to 5 years, 14 to 15 inch; 6 to 10 years, 16 to 17 inch; 11 years and above, 18 inch or larger. Check the size listed on each product before you buy.',
      },
      {
        heading: 'What to look for in a school bag',
        body: 'Padded shoulder straps spread the weight of books, and a padded back panel keeps the bag comfortable on the walk to school. Separate compartments help children keep books, tiffin and stationery apart, and a side pocket holds a water bottle. Lighter bags leave more of the weight limit for books.',
      },
      {
        heading: 'Combo sets and trolley school bags',
        body: 'For younger children, Priority Junior also offers combo sets with matching accessories and trolley backpacks with wheels for heavy book days. See the Priority Junior section for bags sorted by age and character.',
      },
    ],
    faqs: [
      { q: 'Which Priority school bag is right for a 6 year old?', a: 'For 6 to 10 years, a 16 to 17 inch school bag usually fits best. Choose one with padded straps and a separate compartment for books.' },
      { q: 'Where can I buy Priority school bags?', a: BUY },
    ],
    related: [['/junior', 'Priority Junior kids bags'], ['/college-backpacks', 'College backpacks'], ['/accessories', 'Lunch bags and pouches']],
  },
  'college-backpacks': {
    heading: 'Priority college bags and backpacks',
    intro:
      'Priority college backpacks are built for daily campus use: books, a laptop or tablet, chargers and a water bottle in one bag. The range includes printed and solid designs for men and women, in sizes from everyday daypacks to larger bags for long college days.',
    sections: [
      {
        heading: 'Choosing a college backpack',
        body: 'If you carry a laptop, pick a bag with a padded laptop compartment and check that it fits your laptop size. Multiple compartments and front pockets keep small things easy to find, padded straps and back panel help on long commutes, and a bottle pocket on the side saves space inside.',
      },
      {
        heading: 'Capacity',
        body: 'Most students do well with a mid-size backpack that holds a laptop plus a few books. If you also carry a gym kit or travel home on weekends, a larger bag gives room to spare. Each product page lists its size.',
      },
    ],
    faqs: [
      { q: 'Are Priority college bags good for carrying a laptop?', a: 'Many Priority college backpacks have a padded laptop compartment. Check the product details for the laptop size it fits.' },
      { q: 'Where can I buy Priority college bags?', a: BUY },
    ],
    related: [['/laptop-backpacks', 'Laptop backpacks'], ['/school-backpacks', 'School bags'], ['/trekking-backpacks', 'Trekking bags']],
  },
  'laptop-backpacks': {
    heading: 'Priority laptop backpacks for office, college and travel',
    intro:
      'Priority laptop backpacks protect your laptop on the daily commute with a padded compartment, and keep chargers, documents and everyday items organised in separate pockets. They suit office use, college and short work trips.',
    sections: [
      {
        heading: 'How to pick the right laptop backpack',
        body: 'Measure your laptop or check its screen size, then choose a bag whose laptop compartment fits it, since a laptop that moves around inside is more likely to get knocked. Look for padding on the back and straps if you commute by train, bus or bike, and an organiser panel if you carry many small items.',
      },
      {
        heading: 'For work and travel',
        body: 'A slimmer laptop bag works well for the office, while a larger backpack with extra compartments suits travel days when you also carry clothes or a jacket.',
      },
    ],
    faqs: [
      { q: 'Which laptop sizes do Priority laptop backpacks fit?', a: 'It varies by model. Each product page lists the laptop size the compartment fits.' },
      { q: 'Where can I buy Priority laptop backpacks?', a: BUY },
    ],
    related: [['/college-backpacks', 'College backpacks'], ['/backpacks', 'All backpacks'], ['/luggage', 'Trolley bags']],
  },
  'trekking-backpacks': {
    heading: 'Priority trekking bags and rucksacks',
    intro:
      'Priority trekking bags are made for hikes, treks and outdoor trips, with space for clothes, food and water and multiple compartments to keep gear organised. They also work well as a large travel backpack.',
    sections: [
      {
        heading: 'Choosing a trekking bag',
        body: 'For a day hike, a smaller backpack with a water bottle pocket is enough. For overnight and multi-day treks, choose a larger rucksack that can hold a change of clothes, a jacket and food. Adjustable, padded straps help carry the load comfortably, and outer pockets keep essentials within reach.',
      },
    ],
    faqs: [
      { q: 'Can a trekking bag be used for travel?', a: 'Yes. Trekking rucksacks make good travel backpacks when you want to carry your luggage on your back instead of wheeling it.' },
      { q: 'Where can I buy Priority trekking bags?', a: BUY },
    ],
    related: [['/duffle', 'Duffle bags'], ['/luggage', 'Trolley bags'], ['/college-backpacks', 'College backpacks']],
  },
  luggage: {
    heading: 'Priority trolley bags and suitcases',
    intro:
      'Priority trolley bags and suitcases come in cabin, medium and large sizes and in sets of 2 and 3 pieces, so the whole family can travel with matching luggage. The TRAWORLD range by Priority adds premium hard-shell trolleys with 360-degree spinner wheels.',
    sections: [
      {
        heading: 'Which trolley size do you need?',
        body: 'A cabin trolley (around 20 inch) is for carry-on travel; check your airline\'s cabin size and weight limits before you fly. A medium trolley (around 24 inch) suits trips of about a week, and a large trolley (around 28 inch) is for long holidays or family packing. Sets of 2 or 3 pieces give you the right size for every trip.',
      },
      {
        heading: 'Hard-shell or soft luggage?',
        body: 'Hard-shell suitcases protect fragile items and resist rain, while soft trolleys often have outside pockets for things you need on the way. Spinner wheels that turn 360 degrees make a trolley easy to move through airports and stations.',
      },
    ],
    faqs: [
      { q: 'Does Priority sell trolley bag sets?', a: 'Yes. Priority trolley bags come as single pieces and in sets of 2 (20 and 24 inch) and 3 (20, 24 and 28 inch) in several colours.' },
      { q: 'Where can I buy Priority trolley bags?', a: BUY },
    ],
    related: [['/premium', 'TRAWORLD premium luggage'], ['/duffle', 'Duffle bags'], ['/accessories', 'Travel pouches']],
  },
  duffle: {
    heading: 'Priority duffle bags for travel',
    intro:
      'Priority duffle bags by High Spirit Commercial Ventures (HSCVPL) are roomy, easy-to-carry bags for weekend trips, gym days and train journeys. They pack quickly, fit into overhead racks and car boots, and come in several sizes and colours.',
    sections: [
      {
        heading: 'Choosing a duffle bag',
        body: 'A smaller duffle works as a gym or overnight bag, while a larger one holds clothes for a few days of travel. Look for a detachable shoulder strap for longer walks, side pockets for shoes or toiletries, and a sturdy base. Duffles with wheels combine the space of a duffle with the ease of a trolley.',
      },
    ],
    faqs: [
      { q: 'What is the difference between a duffle bag and a trolley bag?', a: 'A duffle is a soft bag you carry by hand or on the shoulder and packs flat when empty. A trolley has wheels and a handle and is easier for heavier loads.' },
      { q: 'Where can I buy Priority duffle bags?', a: BUY },
    ],
    related: [['/luggage', 'Trolley bags and suitcases'], ['/trekking-backpacks', 'Trekking bags'], ['/accessories', 'Accessories']],
  },
  backpacks: {
    heading: 'Priority backpacks for every day',
    intro:
      'Priority backpacks cover every age and use: school bags for children, college backpacks for students, laptop backpacks for office and travel, and trekking bags for the outdoors. Every bag is made by High Spirit Commercial Ventures, with over 25 years of bag manufacturing.',
    sections: [
      {
        heading: 'Find the right backpack',
        body: 'For children, start with school bags sized by age. Students usually want a college backpack with a laptop compartment. Working professionals often prefer a slimmer laptop backpack, and travellers and hikers a larger trekking rucksack. Use the filters above to narrow down by type, colour and size.',
      },
    ],
    faqs: [
      { q: 'Are Priority backpacks good?', a: 'Priority backpacks are made by High Spirit Commercial Ventures, a manufacturer with over 25 years of experience, and are sold on Amazon, Myntra and Ajio where you can read buyer ratings and reviews.' },
      { q: 'Where can I buy Priority backpacks?', a: BUY },
    ],
    related: [['/school-backpacks', 'School bags'], ['/college-backpacks', 'College backpacks'], ['/laptop-backpacks', 'Laptop backpacks'], ['/trekking-backpacks', 'Trekking bags']],
  },
  accessories: {
    heading: 'Priority pouches, lunch bags and tote bags',
    intro:
      'Priority accessories complete your bag: pouches for stationery, cosmetics and travel documents, lunch bags for school and office, tote bags for daily errands and light daypacks for short outings.',
    sections: [
      {
        heading: 'Useful add-ons',
        body: 'A pouch keeps small items from getting lost in a backpack or suitcase, and a lunch bag keeps food separate from books and laptops. Tote bags and daypacks are handy when you don\'t need a full backpack.',
      },
    ],
    faqs: [
      { q: 'Where can I buy Priority accessories?', a: BUY },
    ],
    related: [['/school-backpacks', 'School bags'], ['/luggage', 'Trolley bags'], ['/backpacks', 'Backpacks']],
  },
};
