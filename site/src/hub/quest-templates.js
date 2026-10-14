// Editable development examples, not school history. Answer keys stay in the authoring screen only.
export const questionTemplate = (type) => {
  const base = { prompt: 'Replace this sample with your reviewed question.', explanation: 'Add a helpful explanation.' };
  switch (type) {
    case 'mcq': return { ...base, prompt: 'What is 2 + 3?', explanation: 'Two plus three makes five.', options: ['4', '5', '6'], answer: 1 };
    case 'trueFalse': return { ...base, prompt: 'A square has four equal sides.', explanation: 'A square has four equal sides and four right angles.', answer: 0 };
    case 'decode': return { ...base, prompt: 'Decode this message.', clue: 'Move each letter back one: SFBE', explanation: 'Moving each letter back one gives READ.', answer: 'READ' };
    case 'wordScramble': return { ...base, prompt: 'Unscramble the word.', clue: 'KOOB', explanation: 'These letters make BOOK.', answer: 'BOOK' };
    case 'wordSearch': return { ...base, prompt: 'Find READ.', grid: ['READ', 'ABCD', 'EFGH', 'IJKL'], words: ['READ'], answer: ['r0c0', 'r0c1', 'r0c2', 'r0c3'] };
    case 'picturePuzzle': return { ...base, prompt: 'Reassemble the picture, left to right, top to bottom.', image: '/assets/photos/processed/student-speaker-960.jpg', rows: 2, columns: 2, items: [{ id: 'd', label: 'Piece D', cropX: 1, cropY: 1 }, { id: 'b', label: 'Piece B', cropX: 1, cropY: 0 }, { id: 'a', label: 'Piece A', cropX: 0, cropY: 0 }, { id: 'c', label: 'Piece C', cropX: 0, cropY: 1 }], answer: ['a', 'b', 'c', 'd'] };
    case 'memoryMatch': return { ...base, prompt: 'Pair words with their meaning.', items: [{ id: 'a', label: 'Book' }, { id: 'b', label: 'Read' }, { id: 'c', label: 'A collection of pages' }, { id: 'd', label: 'Explore written words' }], answer: [['a', 'c'], ['b', 'd']] };
    case 'sequence': return { ...base, prompt: 'Arrange the reading steps.', items: [{ id: 'reflect', label: 'Reflect on the story' }, { id: 'choose', label: 'Choose a book' }, { id: 'read', label: 'Read the book' }], answer: ['choose', 'read', 'reflect'] };
    case 'spotDifference': return { ...base, prompt: 'Replace these sample assets with two reviewed comparison images.', images: ['/assets/photos/processed/student-speaker-960.jpg', '/assets/photos/processed/student-speaker-960.jpg'], regions: [{ id: 'a', label: 'Area A', x: 25, y: 25 }, { id: 'b', label: 'Area B', x: 75, y: 75 }], answer: ['a'] };
    default: return null;
  }
};
