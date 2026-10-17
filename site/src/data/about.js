// School-supplied About copy and community quotations, 17 October 2026.
export const aboutValues = [
 ['Truth','truth',['Truth'],'We seek honesty in thought, word and action.'],
 ['Right Conduct','conduct',['Right','Conduct'],'We do what is right, even when no one is watching.'],
 ['Peace','peace',['Peace'],'We cultivate calm, harmony and inner strength.'],
 ['Love','love',['Love'],'We act with compassion, kindness and care for all.'],
 ['Nonviolence','nonviolence',['Nonviolence'],'We resolve conflict with respect and understanding.'],
].map(([name,className,petalLabel,description])=>({name,className,petalLabel,description,practice:''}));
export const aboutPillars = [
 {id:'head',title:'Academic Excellence',part:'Head',body:'Rooted in Malaysia’s national curriculum, SRSS shapes confident learners with a global outlook. Children learn to question, think critically and apply what they know, with support tailored to each learner’s strengths and pace.',ways:[
 ['Nurturing a Joy for Learning','A caring environment where children feel happy, secure and ready to learn.'],
 ['Removing Barriers to Success','Every obstacle to learning is identified and removed.'],
 ['Building Courage Through Growth','Mistakes are stepping stones; new challenges build confidence and growing independence.'],
 ['Igniting Curiosity','A creative, stimulating curriculum.'],
 ['Honouring Every Individual','Each child’s specific needs, met with care and intention.'],
 ['Developing Life Skills','Resilience, independence, collaboration, problem-solving and creativity.'],
 ]},
 {id:'heart',title:'Character Development',part:'Heart',body:'Truth, Right Conduct, Peace, Love and Nonviolence guide all learning and relationships. Integrity, self-awareness and compassion grow through reflection, relationships and everyday choices, so children learn to act responsibly, persevere through difficulty and become thoughtful people of character.',ways:[
 ['Cultivating Respect and Wellbeing','Respect for self and others; positive choices for health and wellbeing.'],
 ['Nurturing Moral and Spiritual Growth','For all, honouring every person regardless of colour, creed or belief.'],
 ]},
 {id:'hands',title:'Holistic Empowerment',part:'Hands',body:'Clear thinking, compassionate character and purposeful action grow together. Through service, creativity, movement and care for the environment, children learn to honour Malaysia’s diversity and contribute meaningfully to the wider human family. We equip every learner with the skills, experiences and confidence to thrive, through purposeful activities in a safe, supportive and inclusive environment.',ways:[
 ['Giving Every Child a Voice','Pupils contribute to school life and take ownership of their learning.'],
 ['Building Community Connections','Active, engaged citizens in a diverse world.'],
 ['Partnering with Parents','Parents as “Partners in Learning”.'],
 ]},
];
export const aboutFaqGroups = [
 ['Our approach',[
 ['What does “Human Excellence, Lived with Purpose” actually mean?','We believe every child has the potential to be their best self — not just academically, but as a kind, thoughtful and capable human being. “Lived with purpose” means we help children discover what matters to them and give them the tools to pursue it.'],
 ['What do you mean by “empowering the mind, body and spirit”?','We don’t just focus on grades. We nurture your child’s mind through strong academics and critical thinking, body through physical activity, health and wellbeing, and spirit through moral values, reflection and a sense of meaning.'],
 ['How is SRSS different from other primary schools?','Three things set us apart: we follow Sai Educare principles, which focus on the whole child; we weave five universal values (Truth, Right Conduct, Peace, Love, Nonviolence) into everyday learning; and we honour every child as unique — their pace, their gifts and their needs.'],
 ['Do you follow the Malaysian national curriculum?','Yes. Our academic programme is rooted in Malaysia’s national curriculum, so your child meets all national standards. We enrich it with Sai Educare principles, global perspectives and holistic learning experiences.'],
 ['What are the “Three Pillars”?','The three areas we focus on to bring our vision to life: Academic Excellence (strong national-curriculum foundations with a global outlook), Character Development (integrity, compassion and resilience through daily practice of universal values) and Holistic Empowerment (head, heart and hands developed together through creativity, service and real-world learning).'],
 ['What is “Sai Educare”?','An educational philosophy inspired by Sathya Sai Baba. It sees education as drawing out the best in every child, not just putting information in. It emphasises five human values and develops the head, heart and hands equally.'],
 ]],
 ['Values and belief',[
 ['My family has its own religious beliefs. Will my child be pressured to follow a specific religion?','No. Truth, Right Conduct, Peace, Love and Nonviolence are universal human values, not tied to any single religion. We honour every child’s background and belief, and nurture moral and spiritual awareness in all children, regardless of colour, creed or religious belief.'],
 ['How do you teach values without it feeling like “preaching”?','Values are woven into daily life — through stories, reflection time, classroom discussions, service projects and how teachers model behaviour. Children learn values by living them, not just hearing about them.'],
 ['What does character development look like in practice?','It looks like a child learning to tell the truth even when it’s hard, stand up for a classmate who is being left out, persevere when a maths problem is difficult, say “thank you” and mean it, and reflect on their choices at the end of the day.'],
 ['How do you handle bullying or conflict?','Guided by our value of Nonviolence, we teach children to resolve conflict through respectful dialogue, empathy and understanding. Our teachers are trained to address issues early and support every child involved.'],
 ]],
 ['Your child at SRSS',[
 ['What kind of environment can my child expect?','A caring, welcoming and inclusive one, where children feel happy, secure and ready to embrace learning with enthusiasm. Mistakes are treated as stepping stones, not failures.'],
 ['What if my child has specific learning needs?','We are committed to removing barriers to success. If your child needs extra support — academic, emotional or social — we’ll work with you to find the right strategies so every learner reaches their fullest potential.'],
 ['Is there a focus on community service?','Yes. Through our Holistic Empowerment pillar, children learn responsibility through practical contribution — caring for the environment, helping others and recognising their place in the wider human family.'],
 ['What does “Partners in Learning” mean?','We see parents as essential collaborators in your child’s education. We communicate regularly, invite your input and work together to support your child’s growth — academically, socially and emotionally.'],
 ['How will I know how my child is progressing?','Through regular parent-teacher meetings, progress reports, informal check-ins and our open-door communication policy. Transparency and partnership produce the best outcomes for children.'],
 ]],
 ['Admissions',[
 ['What ages do you cater for?','SRSS is a primary school offering Standard 1 to Standard 6. Contact admissions to confirm the appropriate year group and entry requirements for your child.'],
 ['How do I enrol my child?','Visit our Admissions page or contact our admissions team directly. We’d love you to book a visit first, so you can see our vision in action.'],
 ]],
].map(([label,items])=>({label,items:items.map(([question,answer])=>({question,paragraphs:[answer]}))}));
export const communityQuotes = [
 {group:'parents',name:'Ms Gauri',role:'Parent of a Year 1 pupil',quote:'My son was nervous about starting school. Within a month he was coming home excited, telling me about the Language Lab and asking if we could start a kindness project at home.'},
 {group:'teachers',name:'Mr Dharmin',role:'Year 3 class teacher',quote:'Values aren’t a separate subject here. When two children disagree at break, we talk about Right Conduct and Nonviolence right there — and by the end of the week, they’re solving it on their own.'},
 {group:'teachers',name:'Ms Vasanthi',role:'Language teacher',quote:'Watching a shy child stand up and speak in front of the class for the first time — that’s the moment I teach for.'},
 {group:'students',name:'Kuru',role:'Year 6',quote:'My favourite part of the day is the quiet moment at morning assembly. It helps me feel calm before lessons. I also love the Science Lab because we get to test our own ideas.'},
 {group:'students',name:'Chan',role:'Year 3',quote:'At SRSS, if you make a mistake, nobody laughs. The teacher says, “Good, now we can learn something.”'},
 {group:'volunteers',name:'Tan Suei',role:'Community volunteer',quote:'I help with the school garden. The children don’t just plant seeds — they ask why plants need sunlight, take turns watering and look out for the younger ones. It reminds me why service matters.'},
 {group:'alumnus',name:'Kali',role:'Former pupil, now in secondary school',quote:'SRSS taught me to speak up for what’s right. In secondary school, that has helped me more than any exam.'},
 {group:'others',name:'Muni',role:'Grandparent of a Year 2 pupil',quote:'She greets elders now with such respect, and she reminds us at dinner to be grateful for our food. That’s something you can’t teach from a textbook.'},
];
export const parentVoice={name:'Mr Siva',role:'Parent of a Year 4 student',quote:'We chose SRSS because we wanted a school that would nurture our daughter’s character as much as her academics. We’ve seen her grow in confidence, kindness and curiosity — and we feel like true partners in her journey.'};
