// Student Life › "Inside SRSS": the spaces pupils use every day and two moments of school life.
// Photos supplied by the School (26 Nov 2026). Originals are kept in public/assets/photos/spaces/originals;
// each slide has square WebP derivatives at its listed widths (the two open-space panels were cut from one montage).
const dir = "/assets/photos/spaces";

export const SCHOOL_SPACES = [
  { id: "library", kind: "Our spaces", title: "The Library", sizes: [240, 720, 1200],
    copy: "Shelves of books, reading tables and quiet corners where pupils borrow, browse and read for pleasure.",
    alt: "The SRSS library: white and black bookshelves, a reading table with stools, a world map mural and yellow armchairs." },
  { id: "assembly-court", kind: "Open spaces", title: "The Assembly Court", sizes: [240, 542],
    copy: "The open court in front of the school building, where pupils gather for morning assembly.",
    alt: "Pupils in sports uniform sitting in rows on the open court in front of the pink school building and flagpole." },
  { id: "prayer-hall", kind: "Open spaces", title: "The Prayer Hall", sizes: [240, 542],
    copy: "A calm, light-filled hall for prayer, silent sitting and reflection.",
    alt: "Pupils sitting cross-legged on mats in a bright prayer hall facing an altar with the Om symbol." },
  { id: "classrooms", kind: "Our spaces", title: "Classrooms", sizes: [240, 720, 1200],
    copy: "Bright rooms for group work, language lessons and hands-on science.",
    alt: "Three classroom scenes: pupils working with shapes alongside their teacher, a Tamil language class, and a science lesson." },
  { id: "main-hall", kind: "Our spaces", title: "The Main Hall", sizes: [240, 720, 1200],
    copy: "The school hall and stage for gatherings, performances and events. Its folding walls open it up for larger occasions.",
    alt: "The main hall with rows of blue chairs facing a stage with a gold curtain, folding walls drawn back on each side." },
  { id: "ssehv-lab", kind: "Our spaces", title: "The SSEHV Lab", sizes: [240, 720, 1200],
    copy: "A dedicated room for Sathya Sai Education in Human Values (SSEHV) lessons, discussion and reflection.",
    alt: "A lavender room with a whiteboard, glass-topped table and chairs, and posters about mindfulness and growth." },
  { id: "indoor-games-arena", kind: "Our spaces", title: "The Indoor Games Arena", sizes: [240, 720, 1200],
    copy: "Carrom, chess, foosball, table tennis and fitness equipment under one roof.",
    alt: "A covered games area with a carrom board, chess set, foosball table, table tennis table and exercise bike." },
  { id: "chinese-new-year", kind: "Cultural appreciation", title: "Chinese New Year", sizes: [240, 720, 1200],
    copy: "Drummers, a lion dance and families celebrating together in the assembly hall.",
    alt: "Pupils playing large drums, a lion dance in front of seated pupils, and families and pupils celebrating Chinese New Year." },
  { id: "choral-speaking", kind: "School life", title: "Choral Speaking Team", sizes: [240, 720, 1200],
    copy: "Our choral speaking team on stage performing “Operation: Humanity!”.",
    alt: "The SRSS choral speaking team in uniform on stage with hands on their hearts beneath an “Operation: Humanity!” screen." },
].map((item) => ({
  ...item,
  src: `${dir}/${item.id}-${item.sizes.at(-1)}.webp`,
  thumb: `${dir}/${item.id}-240.webp`,
  srcSet: item.sizes.filter((w) => w > 240).map((w) => `${dir}/${item.id}-${w}.webp ${w}w`).join(", "),
}));
