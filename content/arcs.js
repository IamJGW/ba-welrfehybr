// The arcs of stories shown on the world map of the time device, in Bible
// order. Each is a place on the map, given as [longitude, latitude]; pins in
// crowded places are nudged apart, so they are only roughly where things
// happened. Arcs marked "later" are shown locked with the stories planned for
// them (see ARC_PLAN.md). Each built story's own pin on its arc's map is the
// "place" line in its story.js.

export const ARCS = [
  {
    id: 'beginning', title: 'In the Beginning', when: 'The first days',
    blurb: 'Creation, the garden, the flood and Babel.', at: [44.4, 32.5], map: 'crescent',
    stories: ['light', 'garden', 'ark', 'rainbow', 'babel'],
  },
  {
    id: 'promise', title: 'The Promise', when: 'The time of Abraham',
    blurb: 'Abraham, Isaac and Jacob, and the promise God made them.', at: [39.03, 36.87], map: 'promise',
    stories: ['haran', 'stars', 'mamre', 'moriah', 'rebekah', 'bethel', 'brothers'],
  },
  {
    id: 'joseph', title: 'Joseph', when: 'The time of Joseph',
    blurb: 'A favorite son sold into Egypt, and how God used it for good.', at: [31.0, 30.1], map: 'egypt',
    stories: ['coat', 'sold', 'prison', 'pharaoh', 'cup', 'meant'],
  },
  {
    id: 'exodus', title: 'Out of Egypt', when: 'The time of Moses',
    blurb: 'A baby in the Nile, a bush that burned, ten plagues and a sea that opened.', at: [32.6, 29.3], map: 'egypt',
    stories: ['basket', 'bush', 'plagues', 'passover', 'sea'],
  },
  {
    id: 'wilderness', title: 'The Wilderness', when: 'Forty years in the desert',
    blurb: 'Bread from heaven, water from a rock, the mountain of God and a tent for His glory.', at: [33.97, 28.4], map: 'egypt',
    stories: ['manna', 'rock', 'sinai', 'calf', 'tabernacle', 'spies'],
  },
  {
    id: 'canaan', title: 'The Promised Land', when: 'The time of Joshua',
    blurb: 'Rahab and the spies, the Jordan, the walls of Jericho and the people\'s choice.', at: [36.0, 31.7], map: 'canaan',
    stories: ['rahab', 'jordan', 'walls', 'choose'],
  },
  {
    id: 'judges', title: 'Judges and Ruth', when: 'The time of the judges',
    blurb: 'Deborah, Gideon and his three hundred, and Ruth who stayed.', at: [35.35, 32.75], map: 'canaan',
    stories: ['deborah', 'fleece', 'torches', 'ruth', 'redeemer'],
  },
  {
    id: 'samuel', title: 'Samuel and the First King', when: 'The last judge, and the first king',
    blurb: 'Hannah and her prayer, a boy who heard his name, the ark, and a king who would not obey.', at: [34.95, 32.15], map: 'canaan',
    stories: ['hannah', 'listen', 'dagon', 'saul', 'cliff', 'obey'],
  },
  {
    id: 'david', title: 'The Life of David', when: 'About 1000 BC',
    blurb: 'From shepherd boy to king of Israel.', at: [34.95, 31.4], map: 'israel',
    stories: ['shepherd', 'music', 'elah', 'covenant', 'cave', 'king'],
  },
  { id: 'jesus', title: 'The Life of Jesus', at: [35.75, 33.4], later: true },
];
