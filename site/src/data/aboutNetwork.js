// School-approved About brief, 19 October 2026. Shared across the directory and its pages.
export const aboutJourney = [
 {key:'story', path:'/about/our-story', title:'Our Story', short:'Our Story', description:'Discover the school, its origins, identity and journey since 2002.'},
 {key:'purpose', path:'/about/vision-mission', title:'Our Vision & Mission', short:'Our Purpose', description:'Understand our aspirations, educational commitments and guiding principles.'},
 {key:'excellence', path:'/about/human-excellence', title:'Human Excellence', short:'Human Excellence', description:'Explore what it means to develop the whole child: head, heart and hands.'},
 {key:'educare', path:'/about/sathya-sai-education', title:'The Sathya Sai Educare Philosophy', short:'Educare', description:'Understand the educational philosophy that distinguishes Sathya Sai Schools.'},
 {key:'why', path:'/about/why-srss', title:'Why SRSS?', short:'Why SRSS?', description:'Discover the practical advantages and distinctive features of learning at SRSS.'},
 {key:'leadership', path:'/about/leadership-governance', title:'Our Leadership', short:'Our Leadership', description:'Meet the people responsible for the school’s direction, governance and development.'},
 {key:'educators', path:'/about/our-educators', title:'Our Educators', short:'Our Educators', description:'Meet our educators and understand their role as teachers, mentors and examples of human values.'},
];
export const principles = [
 ['Every Child Matters','Each child deserves dignity, encouragement and opportunities to develop.','We listen to children, recognise their strengths and work with families to support their needs.'],
 ['Character Is Central','Academic accomplishment and good character should develop together.','Honesty, perseverance and care for others matter alongside the work a child completes.'],
 ['Learning Is Transformative','Education should influence understanding, behaviour and personal growth.','Children connect what they learn with the choices they make and the people they are becoming.'],
 ['Teachers Lead by Example','Educators model the values they seek to cultivate.','Children learn not only from what teachers explain, but also from how teachers speak, respond, cooperate and demonstrate integrity.'],
 ['Unity in Diversity','Cultural and religious differences are respected and celebrated.','We make room for different backgrounds, beliefs and traditions within one school community.'],
 ['Service Is Part of Education','Learning should inspire responsibility and contribution to others.','Shared responsibilities and care for the environment help children turn understanding into action.'],
];
export const dimensions = [
 {title:'Head',subtitle:'Knowledge and intellectual capability',body:'Literacy, numeracy, reasoning, inquiry and creativity develop a child’s ability to understand, question and think independently.',photo:'pledge',example:'Ask a thoughtful question. Explain an idea. Try another way.'},
 {title:'Heart',subtitle:'Character and emotional maturity',body:'Compassion, integrity, self-awareness and respect help children understand themselves and care for the people around them.',photo:'reflection',example:'Listen with care. Admit a mistake. Include someone new.'},
 {title:'Hands',subtitle:'Action and responsible contribution',body:'Service, teamwork, leadership and practical skills turn knowledge and good intentions into meaningful action.',photo:'welcome',example:'Take responsibility. Work together. Help without being asked.'},
];
export const valuesInLife = [
 ['Being Honest. Thinking Clearly. Acting with Integrity.','A child acknowledges damaging shared materials and takes responsibility for putting things right.','What does honesty ask of us when telling the truth feels difficult?'],
 ['Choosing What Is Right.','A pupil completes a shared classroom duty without needing a reminder.','How can we make a good choice when nobody is watching?'],
 ['Finding Calm. Responding with Understanding.','A quiet moment helps a child pause before responding to a disagreement.','What helps you find calm before you respond?'],
 ['Caring for Others.','A child invites a classmate who is sitting alone to join in.','Who might need a little kindness today?'],
 ['Respecting Life in Thought, Word and Action.','Children use respectful words to resolve a disagreement and care for their shared environment.','How can our words and actions protect rather than hurt?'],
];
export const dayMoments = [
 ['Morning reflection','Belonging, attention and a thoughtful start to the school day.'],
 ['Classroom learning','Curiosity, perseverance and cooperation as children explore ideas.'],
 ['Recess','Friendship, kindness and respect in everyday interactions.'],
 ['Group activities','Communication, leadership and teamwork through shared challenges.'],
 ['Service and care','Responsibility towards others and the natural environment.'],
];
export const exampleJourney = [
 ['Finding belonging','Reading a first short story; learning classroom routines; asking for help and welcoming a new friend.'],
 ['Growing independence','Explaining a number pattern; making a creative project; taking responsibility for shared materials.'],
 ['Discovering a voice','Presenting an idea; listening to another view; reflecting on how to resolve a disagreement.'],
 ['Working together','Investigating a question; contributing to a group; helping a younger pupil feel included.'],
 ['Taking responsibility','Planning a practical task; persevering through a challenge; caring for a shared space.'],
 ['Ready for the next chapter','Reflecting on learning; leading with kindness; recognising strengths and setting a new goal.'],
];
// Preserve old bookmarks when the long About page becomes a page network.
export function aboutAnchorDestination(path, hash) {
 const anchor=hash.replace(/^#/,'');
 const destinations={
  'who-we-are':'/about/our-story#identity', 'vision-mission':'/about/vision-mission', purpose:'/about/vision-mission#purpose', vision:'/about/vision-mission#vision', mission:'/about/vision-mission#mission', aims:'/about/vision-mission#commitments', values:'/about/human-excellence#values', head:'/about/human-excellence#whole-child', heart:'/about/human-excellence#whole-child', hands:'/about/human-excellence#whole-child',
  'principal-welcome':'/about/leadership-governance#principal-welcome', educare:'/about/sathya-sai-education', 'our-people':'/about/our-people', 'parent-questions':'/about/why-srss#parent-questions', testimonials:'/about/why-srss#testimonials', campus:'/about/campus', 'school-profile':'/about/school-profile',
 };
 if(path==='/about/sathya-sai-education') {
  const legacy={'three-hs':'/about/human-excellence#whole-child','five-values':'/about/human-excellence#values','integral-education':'/about/sathya-sai-education#integral',educare:'/about/sathya-sai-education#education-educare','educare-in-action':'/about/sathya-sai-education#five-methods','around-the-world':'/about/sathya-sai-education#community-educare',questions:'/about/why-srss#parent-questions'};
  return legacy[anchor]||null;
 }
 if(path==='/about/our-story'&&anchor==='who-we-are')return '/about/our-story#identity';
 if(path==='/about/vision-mission'&&['vision-mission','aims'].includes(anchor))return '/about/vision-mission#commitments';
 if(path==='/about')return destinations[anchor]||null;
 if(path==='/about/our-people'&&anchor==='principal')return destinations['principal-welcome'];
 return null;
}
