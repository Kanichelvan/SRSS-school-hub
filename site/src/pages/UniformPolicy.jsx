// School Uniform, Personal Appearance & Grooming Policy (/student-life/uniform). Text supplied by the School
// (Nov 2026) as a proposed policy for school management review and approval; it follows the formal layout of
// the School Fees and Payment Policy. Tables and illustrations live in src/data/uniform.js. Loaded on demand.
import { ArrowRight } from "@phosphor-icons/react/dist/csr/ArrowRight";
import { Closing, PageHero, PageSection } from "./SitePages.jsx";
import { JEWELLERY, PROGRESSIVE_RESPONSE, UNIFORM, UNIFORM_GALLERY, UNIFORM_WHEN } from "../data/uniform.js";
import "./fees.css";
import "./uniform.css";

const OFFICE = "saischoolpuchong@gmail.com";
const mailto = (subject) => `mailto:${OFFICE}?subject=${encodeURIComponent(subject)}`;

function Table({ caption, head, rows }) {
  return <div className="fees-table-wrap"><table className="fees-table uniform-table">
    {caption && <caption>{caption}</caption>}
    <thead><tr>{head.map((cell) => <th key={cell} scope="col">{cell}</th>)}</tr></thead>
    <tbody>{rows.map(([label, text]) => <tr key={label}><th scope="row">{label}</th><td>{text}</td></tr>)}</tbody>
  </table></div>;
}

// The left-chest identification sequence on the prefect and librarian vest (Sections 3.1 and 3.2).
function TagSequence({ designation, label }) {
  return <ol className="uniform-tags" aria-label={label}>
    <li><span className="uniform-tag-badge" aria-hidden="true" />School badge</li>
    <li><span className="uniform-tag">{designation}</span></li>
    <li><span className="uniform-tag">STUDENT NAME</span></li>
  </ol>;
}

function Gallery() {
  return <div className="uniform-gallery">
    {UNIFORM_GALLERY.map((group) => <section key={group.id} className={`uniform-group uniform-group-${group.id}`} aria-labelledby={`uniform-${group.id}`}>
      <h3 id={`uniform-${group.id}`}>{group.title}</h3>
      <ul>{group.figures.map((figure) => <li key={figure.src}><figure>
        <img src={figure.src} alt={figure.alt} loading="lazy" decoding="async" />
        <figcaption><strong>{figure.label}</strong><span>{figure.note}</span></figcaption>
      </figure></li>)}</ul>
    </section>)}
    <p className="page-note">Illustrations of the approved designs. Names on the tags are examples, and the badge artwork shown is indicative: the official school badge always applies. Please confirm current designs with the school office before buying.</p>
  </div>;
}

const POLICY = [
  ["statement", "Policy Statement", <>
    <p>At Sekolah Rendah Sathya Sai (SRSS), we expect every student to take pride in belonging to the school by wearing the prescribed school uniform neatly, correctly and with distinction.</p>
    <p>Our school uniform represents more than a common identity. It reflects the values of discipline, dignity, equality, simplicity, cleanliness and personal responsibility that form an integral part of our philosophy of Human Excellence.</p>
    <p>We believe that good personal presentation begins with good habits. Maintaining clean clothing, practising personal hygiene, caring for one's belongings and dressing appropriately for different occasions are important aspects of a child's character development.</p>
    <p>The school encourages parents and guardians to support these expectations through positive reinforcement, appropriate guidance and cooperation with teachers.</p>
    <p>At the same time, SRSS recognises the diversity of religious, cultural and personal backgrounds within its school community. The uniform policy therefore accommodates appropriate religious attire while preserving a consistent, respectful and inclusive school identity.</p>
    <p className="fees-pledge">Our guiding principle is that every student should be neat, comfortable, appropriately dressed and proud to represent SRSS, without unnecessary financial burden or discrimination.</p>
  </>],
  ["general", "1. General Uniform Requirements", <>
    <ol className="uniform-clauses">
      <li data-n="1.1">Students are required to wear the complete prescribed school uniform on all school days, except when an alternative uniform is expressly permitted under this policy.</li>
      <li data-n="1.2">The school uniform must be clean, properly fitted, maintained in good condition and worn as intended.</li>
      <li data-n="1.3">Uniform items must not be deliberately altered in a manner that changes their approved design, colour, length or appearance.</li>
      <li data-n="1.4">All students must wear the prescribed school badge, name tag and other identification items in their designated positions.</li>
      <li data-n="1.5">Uniforms must be worn correctly throughout the school day, including during lessons, assemblies, examinations, school programmes and other school-organised activities.</li>
      <li data-n="1.6">Students must wear the prescribed formal school uniform on Mondays, during examinations, formal programmes, assemblies and other occasions specified by the school, regardless of whether Physical Education (PE) is scheduled.</li>
      <li data-n="1.7">On designated PE days, students may wear their complete sports uniform for the entire school day, subject to the exceptions described in <a href="#sports">Section 4</a>.</li>
      <li data-n="1.8">Uniform requirements apply equally to all students, with appropriate accommodation for religious practices, health conditions, disabilities and other circumstances approved by the school.</li>
    </ol>
  </>],
  ["standard", "2. Standard Daily School Uniform", <>
    <p>The standard school uniform consists of the following approved items.</p>
    <h3>2.1 Boys' Uniform</h3>
    <ul>
      <li>Light-purple short-sleeved collared school shirt.</li>
      <li>Dark-purple school tie bearing the prescribed school insignia.</li>
      <li>Dark-purple tailored school shorts or long trousers, according to the approved uniform options.</li>
      <li>Plain black belt where required, with a simple buckle.</li>
      <li>School badge on the shirt pocket or designated left-chest position.</li>
      <li>Official student name tag positioned immediately above the school badge.</li>
      <li>Plain black socks and approved black school shoes.</li>
    </ul>
    <p>Shirts must be properly tucked into trousers or shorts. Ties must be neatly secured and worn at the appropriate length. Trousers must be appropriately fitted, without excessive tightness or sagging.</p>
    <h3>2.2 Girls' Uniform</h3>
    <ul>
      <li>Light-purple short-sleeved collared school blouse.</li>
      <li>Dark-purple school tie bearing the prescribed school insignia.</li>
      <li>Dark-purple school pinafore with the approved pleated skirt design.</li>
      <li>Official school badge on the upper left section of the pinafore.</li>
      <li>Official student name tag positioned immediately above the school badge.</li>
      <li>Plain black socks and approved black school shoes.</li>
    </ul>
    <p>The pinafore must be of an appropriate length and fit, allowing students to sit, walk, participate in classroom activities and move comfortably.</p>
    <p>The approved uniform design must not be shortened, excessively tightened or otherwise modified.</p>
    <h3>2.3 School Badge, Name Tag and Tie</h3>
    <p>The official school badge and name tag are compulsory identification components of the standard uniform.</p>
    <p>The following placement rules apply:</p>
    <ul>
      <li>The badge must be securely attached to the designated left-chest area.</li>
      <li>The name tag must appear directly above the badge.</li>
      <li>The name tag must be clearly legible, properly aligned and maintained in good condition.</li>
      <li>The school tie must be worn correctly, with the school insignia visible.</li>
    </ul>
    <p>Handwritten, decorative or unofficial replacements are not permitted except as a temporary measure authorised by the school.</p>
  </>],
  ["variations", "3. Special Uniform Variations", <>
    <p>SRSS provides additional uniform variations for students appointed to specific responsibilities or participating in designated school activities.</p>
    <h3>3.1 School Prefects (Pengawas)</h3>
    <p>School prefects wear the approved school uniform with an additional black sleeveless formal vest.</p>
    <p>The prefect uniform consists of the standard light-purple shirt or blouse, dark-purple tie, approved purple trousers or pinafore/skirt, black vest, and prescribed black footwear.</p>
    <p>On the left chest of the vest, the identification sequence must be:</p>
    <TagSequence designation="PENGAWAS" label="Prefect vest identification sequence, from top to bottom" />
    <p>The badge must be positioned above the designation tag, followed by the student's name tag. Both tags must be of the approved school design, securely attached and neatly aligned.</p>
    <p>Prefects must maintain exemplary standards of personal presentation, recognising their responsibilities as student leaders and role models.</p>
    <h3>3.2 School Librarians</h3>
    <p>Appointed student librarians wear the same approved black vest arrangement as prefects, with a different designation tag.</p>
    <p>The identification sequence on the left chest must be:</p>
    <TagSequence designation="LIBRARIAN" label="Librarian vest identification sequence, from top to bottom" />
    <p>The LIBRARIAN designation must be displayed on a small, neat acrylic or school-approved tag, followed by the student's name tag below it (for example, PRIYA).</p>
    <p>The school badge, designation tag and name tag must follow the same vertical sequence and alignment as those of school prefects.</p>
    <p>Librarians must wear the complete prescribed uniform during their assigned duties and on other occasions directed by the school.</p>
    <h3>3.3 Club and Uniformed Body Attire</h3>
    <p>Students participating in recognised school clubs, societies or uniformed bodies may be required or permitted to wear their respective approved uniforms.</p>
    <p>These may include, for example, Kadet Polis and other officially recognised uniformed organisations.</p>
    <p>Requirements concerning shirts, trousers, headgear, belts, insignia, badges and accessories will vary according to the approved uniform of the respective club or organisation.</p>
    <p>Such uniforms may only be worn on designated activity days, during official duties or when authorised by the teacher-in-charge.</p>
    <p>Club uniforms must not be substituted for the regular school uniform without permission.</p>
    <h3>3.4 Graduation and Ceremonial Robes</h3>
    <p>Students participating in official graduation ceremonies or other designated ceremonial events may be required to wear the school's prescribed graduation robe.</p>
    <p>The approved robe is maroon with gold-coloured decorative trim, as illustrated in the school's <a href="#glance">uniform guide</a>.</p>
    <p>The robe must be worn neatly over the attire specified for the ceremony. Students must not modify, decorate or personalise the robe without school approval.</p>
    <p>Graduation robes are ceremonial garments and are not part of the regular daily school uniform.</p>
  </>],
  ["sports", "4. Physical Education and Sports Uniform", <>
    <h3>4.1 Approved Sports Attire</h3>
    <p>The prescribed sports uniform comprises:</p>
    <ul>
      <li>Official SRSS sports T-shirt, polo shirt or approved sports-house T-shirt.</li>
      <li>Appropriate sports-house colour or approved school sports design.</li>
      <li>Official school badge or insignia on the upper chest.</li>
      <li>Dark-coloured school track trousers with the prescribed white vertical SRSS lettering along the outer leg.</li>
      <li>Approved all-black sports shoes.</li>
      <li>Plain black socks.</li>
      <li>Official sports-house cap, where required, displaying the school badge at the front.</li>
    </ul>
    <p>The sports-house shirt colour or design may vary between houses or annual releases. Parents should refer to the school-approved design for the relevant academic year.</p>
    <p>Sports shirts must be neatly tucked into the track trousers unless a specific activity or approved garment design requires otherwise.</p>
    <h3>4.2 Wearing Sports Uniform Throughout the School Day</h3>
    <p>To minimise unnecessary changing, reduce the risk of lost clothing and maximise instructional time, students are permitted to wear their complete official sports uniform for the entire school day on their designated PE days.</p>
    <p>However, this permission does not apply on:</p>
    <ul>
      <li><strong>Mondays</strong>, when the prescribed formal school uniform is required for the weekly assembly.</li>
      <li>Days involving formal school programmes, official ceremonies, distinguished visitors or special events for which formal attire is required.</li>
      <li><strong>Examination days</strong>, when students must wear their formal school uniform unless otherwise directed.</li>
      <li>Any other day on which the school specifically instructs students to wear their formal uniform.</li>
    </ul>
    <p>Where PE falls on one of these days, students must attend school in formal uniform and bring their sports attire separately if changing is necessary for the activity.</p>
    <p>The class teacher or PE teacher will communicate any specific arrangements.</p>
    <h3>4.3 Changing After Sports and Physical Activities</h3>
    <p>Students are encouraged to maintain personal cleanliness after physical activities.</p>
    <p>Where students have become excessively sweaty, wet, muddy or otherwise uncomfortable, they may change into a clean set of approved school clothing, subject to the teacher's instructions.</p>
    <p>Students should bring a spare shirt, small towel and suitable bag for soiled clothing when required.</p>
    <p>Changing must take place in designated areas with appropriate privacy and supervision arrangements.</p>
    <p>Students must not share personal clothing, towels or hygiene items.</p>
    <h3>4.4 Sports Day and House Activities</h3>
    <p>For annual Sports Day, inter-house competitions and other approved sporting events, students must wear the designated sports-house attire announced for that event.</p>
    <p>The school may introduce updated sports-house shirt designs in different academic years. Students and parents will be informed of any compulsory changes in advance.</p>
    <p>Students must wear suitable footwear and may be required to use additional protective equipment for particular activities.</p>
  </>],
  ["religious", "5. Religious and Cultural Uniform Accommodations", <>
    <p>SRSS respects the religious and cultural diversity of its students. The school seeks to accommodate appropriate religious attire without compromising student safety, cleanliness or the overall identity of the school uniform.</p>
    <h3>5.1 Baju Kurung Option</h3>
    <p>Female students, including Malay and Muslim students, may wear the approved baju kurung uniform at the discretion of their parents or guardians.</p>
    <p>The approved design consists of:</p>
    <ul>
      <li>A long-sleeved, light-purple baju kurung top.</li>
      <li>A matching dark-purple, full-length skirt.</li>
      <li>Official school badge and name tag in the prescribed positions.</li>
      <li>Approved black school shoes and plain black socks.</li>
    </ul>
    <p>The baju kurung must be loose-fitting, comfortable, opaque and suitable for the student's age and school activities.</p>
    <p>Students wearing the baju kurung are subject to the same general standards of neatness, cleanliness and appropriate presentation as other students.</p>
    <h3>5.2 Headscarf or Hijab</h3>
    <p>Students may wear a headscarf or hijab at their parents' or guardians' discretion.</p>
    <p>The approved headscarf colour is school purple, in the shade specified by the school.</p>
    <p>The headscarf must:</p>
    <ul>
      <li>Be plain, neat, opaque and appropriately fitted.</li>
      <li>Cover the hair and neck as required by the student's religious practice.</li>
      <li>Allow the face to remain clearly visible for identification and communication.</li>
      <li>Be secured safely without loose or hazardous accessories.</li>
      <li>Be suitable for classroom learning, movement and school activities.</li>
    </ul>
    <p className="fees-callout">Students are not required to wear a headscarf solely because of their ethnicity or religion. The decision rests with the parents or guardians and the student, consistent with the family's preferences.</p>
    <h3>5.3 Sports Attire for Students Wearing a Hijab</h3>
    <p>Students who wear a hijab may use the approved modest sports uniform, consisting of:</p>
    <ul>
      <li>A long-sleeved school sports top in the approved school design.</li>
      <li>Dark-purple or school-approved sports hijab.</li>
      <li>Prescribed SRSS full-length track trousers.</li>
      <li>Approved black sports shoes and plain black socks.</li>
    </ul>
    <p>The sports hijab should be lightweight, breathable and securely fitted, without loose ends that may become entangled during physical activities.</p>
    <p>The school will make reasonable adjustments where necessary to enable students to participate safely and comfortably in PE and sports.</p>
    <h3>5.4 Sikh Turbans and Patkas</h3>
    <p>Sikh students may wear a turban, patka or other appropriate Sikh religious head covering in accordance with their family's religious practices.</p>
    <p>The preferred colour is school purple or another school-approved dark colour.</p>
    <p>Head coverings must be clean, neatly tied, securely fitted and appropriate for school activities.</p>
    <p>Students who maintain uncut hair as part of their Sikh faith are exempt from hair-length or haircut requirements that would conflict with their religious observance. Their hair must nevertheless be kept clean, tidy and securely managed.</p>
    <p>The school will accommodate Sikh religious articles and practices through respectful discussion with parents, while considering student safety during sports, laboratory activities and other practical lessons.</p>
    <h3>5.5 Other Religious and Cultural Requirements</h3>
    <p>Parents or guardians seeking accommodation for other religious or cultural clothing, head coverings or articles should contact the school office or Principal.</p>
    <p>Requests will be considered respectfully and individually, with the aim of supporting religious freedom, student dignity, safety and reasonable consistency with the school uniform.</p>
  </>],
  ["grooming", "6. Personal Grooming and Hair", <>
    <p>Students are expected to maintain clean, neat and age-appropriate hairstyles that are practical for learning and physical activities.</p>
    <h3>6.1 Hair Requirements</h3>
    <ul>
      <li>Hair that reaches or touches the shoulders must be neatly tied back.</li>
      <li>Hair must be kept clean, combed and away from the eyes.</li>
      <li>Haircuts and hairstyles must be appropriate for a primary school environment.</li>
      <li>Extreme or deliberately unconventional hairstyles, including exaggerated mullets, shaved patterns, excessive undercuts or distracting designs, are not permitted.</li>
      <li>Artificial hair colouring, coloured extensions and decorative hairpieces are not permitted unless specifically approved for a school event.</li>
      <li>Religious hairstyles and head coverings are accommodated as described in <a href="#religious">Section 5</a>.</li>
    </ul>
    <h3>6.2 Hair Accessories</h3>
    <p>Hairbands, ribbons, clips, scrunchies and other hair accessories must be plain black or dark purple.</p>
    <p>Accessories must be simple, safe and functional. Oversized bows, brightly coloured decorations, glitter, flashing accessories and elaborate ornaments are not permitted.</p>
    <h3>6.3 Addressing Inappropriate Hairstyles</h3>
    <p>Where a student's hairstyle does not meet the school's expectations, the teacher or Principal will first contact the parents or guardians to explain the concern and discuss a reasonable solution.</p>
    <p>Students will not automatically be sent home for a hairstyle-related concern.</p>
    <p>Parents will be given a reasonable opportunity to make the necessary adjustments. The Principal retains discretion in determining whether a hairstyle is appropriate, taking into account cultural, religious, medical and individual circumstances.</p>
  </>],
  ["jewellery", "7. Jewellery and Personal Accessories", <>
    <p>For reasons of safety, simplicity, equality and practicality, jewellery must be kept to a minimum.</p>
    <Table head={["Item", "Requirement"]} rows={JEWELLERY} />
    <p>The school discourages students from bringing expensive or sentimental jewellery.</p>
    <p>Where a student wears an unauthorised item, the teacher may instruct the student to remove it and store it safely. Where necessary, the item may be temporarily retained by the school office and returned at the end of the school day, with appropriate recording and safeguards.</p>
    <p>Religious articles, including Sikh articles of faith, will be addressed respectfully through consultation rather than treated automatically as prohibited jewellery.</p>
  </>],
  ["cosmetics", "8. Cosmetics, Nails and Body Art", <>
    <p>Students must maintain a natural and age-appropriate appearance.</p>
    <ul>
      <li>Make-up, including lipstick, foundation, mascara, eyeliner and cosmetic face products, is not permitted.</li>
      <li>Nail polish, artificial nails, nail extensions and decorative nail art are not permitted.</li>
      <li>Fingernails must be clean, neatly trimmed and of a safe length.</li>
      <li>False eyelashes and cosmetic enhancements are not permitted.</li>
      <li>Temporary or permanent tattoos must not be visible while wearing the school uniform, except where an appropriate cultural or religious accommodation has been approved.</li>
      <li>Decorative body stickers and similar items are not permitted unless part of an authorised school activity.</li>
      <li>Medically necessary skin products, including prescribed creams, lip balm and sunscreen, are permitted.</li>
    </ul>
  </>],
  ["footwear", "9. Footwear and Socks", <>
    <h3>9.1 Approved Shoes</h3>
    <p>Students must wear plain black, closed-toe shoes appropriate for school activities.</p>
    <p>All-black jogger-style sports shoes are preferred because they support movement during PE, recess and other physical activities.</p>
    <p>On non-sports days, conventional black leather school shoes may also be worn.</p>
    <p>Shoes must be:</p>
    <ul>
      <li>Properly fitted and securely fastened.</li>
      <li>Comfortable, safe and suitable for active primary school children.</li>
      <li>Predominantly plain black, including visible soles and laces.</li>
      <li>Maintained in a reasonably clean and serviceable condition.</li>
    </ul>
    <p>Boots, sandals, slippers, high heels, platform shoes and fashion-oriented footwear such as Vans or Converse-style shoes are not part of the approved uniform.</p>
    <p>Students requiring specialised footwear for medical or orthopaedic reasons may request an accommodation.</p>
    <h3>9.2 Socks</h3>
    <p>Only plain black socks are permitted.</p>
    <p>Socks must be visible above the shoes and must not display decorative patterns, prominent logos, lettering or coloured designs.</p>
    <p>Students should wear a clean pair of socks each day.</p>
  </>],
  ["bags", "10. School Bags and Personal Belongings", <>
    <p>School bags must be practical, appropriately sized and suitable for the student's age.</p>
    <p>A two-compartment school bag is recommended, with one compartment for books and learning materials and another for food containers, water bottles and personal items.</p>
    <p>This arrangement helps prevent accidental spills from damaging textbooks, exercise books, clothing and school supplies.</p>
    <p>For upper primary students, a bag capable of accommodating an A3-sized homework folder is recommended where practical.</p>
    <p>Bags should have comfortable straps and be light enough for children to carry safely.</p>
    <p>Students may choose cheerful colours and positive designs that reflect the school's Human Values. Offensive, violent, discriminatory or otherwise inappropriate imagery is not permitted.</p>
    <p>School bags are functional learning accessories and should not become a source of unnecessary competition or financial pressure among students.</p>
    <h3>10.1 Labelling of Belongings</h3>
    <p>Parents must clearly label their child's belongings, including uniforms, ties, shoes, sportswear, caps, bags, water bottles, lunch boxes, towels and spare clothing.</p>
    <p>Labels should preferably include the student's name and class.</p>
    <p>Students are encouraged to take responsibility for their belongings and promptly report lost items to their class teacher.</p>
  </>],
  ["hygiene", "11. Personal Hygiene and Health", <>
    <p>Personal hygiene is an essential component of the school's emphasis on cleanliness, self-respect and responsibility.</p>
    <p>Students are expected to:</p>
    <ul>
      <li>Bathe regularly and attend school in clean clothing.</li>
      <li>Maintain appropriate oral hygiene.</li>
      <li>Keep their hair, nails and hands clean.</li>
      <li>Change into fresh clothing after activities when necessary.</li>
      <li>Use suitable personal hygiene products where appropriate.</li>
      <li>Dispose of tissues, sanitary products and other waste responsibly.</li>
      <li>Avoid sharing personal hygiene items.</li>
    </ul>
    <p>Teachers will reinforce these habits through age-appropriate guidance without embarrassing or publicly identifying individual students.</p>
    <h3 id="menstrual-hygiene">11.1 Menstrual Hygiene and Sanitary Pads</h3>
    <p>SRSS recognises that some upper primary students may begin menstruating during their primary school years.</p>
    <p>The school is committed to ensuring that students experiencing menstruation are treated with dignity, sensitivity and privacy.</p>
    <ul>
      <li>Students who have begun menstruating are encouraged to carry a small personal hygiene pouch containing sanitary pads, spare underwear and a sealable bag for soiled clothing.</li>
      <li>The school should maintain a small emergency supply of sanitary pads, accessible discreetly through designated female staff or the school office.</li>
      <li>Students requiring assistance may approach a trusted teacher or designated staff member without embarrassment.</li>
      <li>Sanitary pads must be disposed of in designated sanitary bins and must not be flushed down toilets.</li>
      <li>Where a student experiences menstrual leakage or staining, staff should assist discreetly in arranging a change of clothing and, where necessary, contacting the parent or guardian.</li>
    </ul>
    <p className="fees-callout">No student should be reprimanded, publicly embarrassed or unnecessarily excluded from learning because of menstruation or an accidental menstrual leak.</p>
  </>],
  ["exemptions", "12. Temporary Uniform Exemptions", <>
    <p>The school recognises that exceptional circumstances may occasionally prevent a student from wearing the complete prescribed uniform.</p>
    <p>Examples include clothing becoming unexpectedly soiled or damaged, a uniform being temporarily unavailable, participation in a special activity such as football practice, or other unforeseen circumstances.</p>
    <ul>
      <li>In such cases, a temporary substitute of a similar colour and style may be permitted for <strong>one school day only</strong>.</li>
      <li>Parents or guardians must inform the school in writing, explaining the reason for the temporary non-compliance.</li>
      <li>Written notification may be provided through an official school communication channel accepted by the school.</li>
      <li>Where the issue cannot reasonably be resolved within one day, parents should contact the school office to request an extension or appropriate accommodation.</li>
    </ul>
    <p>The school may also approve temporary modifications for medical needs, injuries, disabilities, religious observances or other reasonable circumstances.</p>
  </>],
  ["compliance", "13. Uniform Compliance and Corrective Measures", <>
    <p>SRSS adopts an educational and supportive approach to uniform compliance, consistent with its commitment to Human Values.</p>
    <p>The purpose of addressing uniform concerns is to develop responsibility and good habits, rather than to punish or embarrass students.</p>
    <h3>13.1 Progressive Response</h3>
    <p>These stages generally apply to repeated, avoidable uniform breaches. They are not intended to penalise students for circumstances beyond their control.</p>
    <Table head={["Incident", "School response"]} rows={PROGRESSIVE_RESPONSE} />
    <h3>13.2 Parent Communication</h3>
    <p>Where a student is unable to comply with a uniform requirement, parents should provide a signed note or written explanation.</p>
    <p>For recurring concerns, the school will seek to understand whether there are underlying difficulties, including financial constraints, household arrangements, medical needs or problems obtaining the correct uniform.</p>
    <h3>13.3 Financial Hardship and Special Circumstances</h3>
    <p>Families experiencing financial hardship or other difficulties are encouraged to contact the school office confidentially.</p>
    <p>The school will endeavour to explore reasonable solutions, which may include additional time to obtain uniform items, temporary accommodations or assistance where resources are available.</p>
    <p>Students must not be publicly singled out or humiliated because their families are unable to obtain a particular uniform item.</p>
    <p><a className="text-link" href="/join/fees/sponsorship">Sponsorship and confidential assistance <ArrowRight size={15} /></a></p>
    <h3>13.4 Participation in Learning</h3>
    <p>A uniform concern should not ordinarily prevent a student from attending lessons or participating in school.</p>
    <p>Any restriction involving a particular activity must be justified by a genuine safety, health or practical requirement and managed in a manner that protects the student's dignity and access to education.</p>
  </>],
  ["supply", "14. Uniform Purchasing and Supply", <>
    <p>The school will provide information about its designated uniform vendor upon registration.</p>
    <p>The vendor's contact details, purchasing arrangements, available uniform items and relevant ordering information will also be made available to parents and guardians upon request through the school office.</p>
    <p>Parents are encouraged to obtain the approved uniform before the commencement of the academic term.</p>
    <p>The school office may assist families in identifying the correct uniform sizes, required items and appropriate purchasing arrangements.</p>
    <p>Uniform purchases and associated costs are arranged separately from school tuition fees. Parents may contact the school office for guidance on both matters before the school term begins.</p>
    <p>Parents should confirm the current approved designs before purchasing uniforms, particularly sports-house shirts, prefect and librarian accessories, and other specialised items that may change over time.</p>
  </>],
  ["care", "15. Uniform Care and Replacement", <>
    <p>Parents and students share responsibility for maintaining school uniforms in good condition.</p>
    <p>Uniform items should be washed regularly, dried appropriately and repaired or replaced when they become excessively worn, damaged or unsuitable.</p>
    <p>Missing buttons, torn seams, damaged badges and illegible name tags should be addressed promptly.</p>
    <p>Where a uniform item has become too small, parents should arrange for an appropriately sized replacement.</p>
    <p>The school encourages families to avoid unnecessary purchases and to consider responsible reuse of uniform items that remain in good condition, where permitted.</p>
  </>],
  ["events", "16. School Events, Excursions and Special Programmes", <>
    <p>The school will communicate the required attire for excursions, educational visits, competitions, cultural programmes, graduation ceremonies and other activities.</p>
    <p>Students must follow the dress requirements announced for the specific event.</p>
    <p>Where no alternative dress instruction has been issued, the standard formal school uniform is required.</p>
    <p>Students representing SRSS at external events must maintain the same standards of cleanliness, grooming and respectful conduct expected within the school.</p>
  </>],
  ["roles", "17. Roles and Responsibilities", <>
    <dl className="uniform-roles">
      <div><dt>Students</dt><dd>Students are expected to wear their uniform correctly, maintain personal cleanliness, care for their belongings and respond positively to guidance.</dd></div>
      <div><dt>Parents and Guardians</dt><dd>Parents and guardians are responsible for helping their children obtain and maintain the prescribed uniform, develop appropriate grooming habits and communicate any difficulties to the school promptly.</dd></div>
      <div><dt>Teachers</dt><dd>Teachers are responsible for applying the policy consistently, explaining requirements clearly, maintaining respectful communication and responding sensitively to individual circumstances.</dd></div>
      <div><dt>School Management</dt><dd>The Principal and school management are responsible for overseeing the policy, considering requests for accommodation, resolving disputes and ensuring that enforcement remains fair, practical and consistent with the school's educational philosophy.</dd></div>
    </dl>
  </>],
  ["review", "18. Policy Interpretation, Review and Amendments", <>
    <p>The Principal retains discretion to interpret and apply this policy, subject to applicable legal requirements, student welfare considerations and the school's governing arrangements.</p>
    <p>The school may update approved uniform designs, accessories, vendor arrangements and operational requirements when necessary.</p>
    <p>Where changes require parents to purchase new items, the school should provide reasonable advance notice and, where practical, transitional arrangements.</p>
    <p>This policy should be reviewed periodically to ensure that it remains appropriate for the needs of SRSS students and families.</p>
  </>],
  ["acknowledgement", "19. Parent and Guardian Acknowledgement", <>
    <p>By enrolling their child at Sekolah Rendah Sathya Sai, parents and guardians are expected to familiarise themselves with the school's uniform and personal appearance requirements and to support their implementation.</p>
    <p>Parents are encouraged to contact the school office whenever clarification, assistance or reasonable accommodation is required.</p>
    <p><a className="text-link" href={mailto("Uniform question")}>Contact the school office <ArrowRight size={15} /></a></p>
  </>],
  ["commitment", "Our Commitment", <>
    <p className="fees-pledge">At SRSS, a uniform is not intended to erase individuality, but to nurture a shared sense of belonging. Through neatness, simplicity, cleanliness and responsibility, we encourage children to develop habits that reflect the Human Values they learn and practise each day.</p>
  </>],
];

export function UniformPolicyPage() {
  return <main id="main" className="site-page fees-page uniform-page">
    <PageHero eyebrow="Sekolah Rendah Sathya Sai" title={UNIFORM.title}
      actions={<><a className="primary-button" href="#glance">The uniform at a glance</a><a className="text-button" href="#policy">Read the full policy</a></>}>
      <p>Neat, comfortable, appropriately dressed and proud to represent SRSS, without unnecessary financial burden or discrimination.</p>
      <dl className="fees-policy-meta">
        <div><dt>Applicable to</dt><dd>{UNIFORM.applicableTo}</dd></div>
        <div><dt>Policy status</dt><dd>{UNIFORM.status}</dd></div>
      </dl>
    </PageHero>
    <PageSection id="glance" eyebrow="The uniform at a glance" title="What to wear, and when." tone="ivory">
      <Gallery />
      <Table caption="Which uniform, when" head={["Day or occasion", "What students wear"]} rows={UNIFORM_WHEN} />
    </PageSection>
    <div className="page-inner fees-policy" id="policy">
      <nav className="fees-policy-toc" aria-label="Policy sections"><p className="eyebrow">Contents</p><ol>{POLICY.map(([id, title]) => <li key={id}><a href={`#${id}`}>{title}</a></li>)}</ol><a className="text-link" href="#glance">The uniform at a glance <ArrowRight size={15} /></a></nav>
      <article className="fees-prose">{POLICY.map(([id, title, body]) => <section key={id} id={id} aria-labelledby={`${id}-title`}><h2 id={`${id}-title`}>{title}</h2>{body}</section>)}</article>
    </div>
    <Closing title="Questions about the uniform?">
      <a className="primary-button" href={mailto("Uniform question")}>Contact the school office</a>
      <a className="text-button" href="/join/parent-partnership">Our partnership with families</a>
    </Closing>
  </main>;
}
