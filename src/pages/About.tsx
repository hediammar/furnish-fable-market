import { Helmet } from 'react-helmet-async';

const teamPhoto = 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=1200&q=80';
const teamMembers = [
  { name: 'Jane Doe', role: 'CEO', img: 'https://randomuser.me/api/portraits/women/44.jpg' },
  { name: 'John Smith', role: 'Creative Director', img: 'https://randomuser.me/api/portraits/men/32.jpg' },
  { name: 'Alice Brown', role: 'Lead Designer', img: 'https://randomuser.me/api/portraits/women/68.jpg' },
  { name: 'Bob Lee', role: 'Production Manager', img: 'https://randomuser.me/api/portraits/men/65.jpg' },
];
const awards = [
  { name: 'Eco Fun', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Logo_2013_Ecofun.jpg/120px-Logo_2013_Ecofun.jpg' },
  { name: 'Design Award', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Red_dot_design_award_logo.svg/120px-Red_dot_design_award_logo.svg.png' },
  { name: 'Innovation', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/IF_design_award_logo_2017.svg/120px-IF_design_award_logo_2017.svg.png' },
  { name: 'Quality Mark', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Good_Design_Award_logo.svg/120px-Good_Design_Award_logo.svg.png' },
];

export default function About() {
  return (
    <div className="bg-[#f6f6f3] min-h-screen w-full">
      <Helmet>
        <title>About | Meubles Karim</title>
      </Helmet>
      <main className="max-w-5xl mx-auto px-4 pt-12 pb-24">
        {/* Header */}
        <header className="mb-12">
          <h1 className="text-5xl md:text-7xl font-bold mb-4 tracking-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
            MEET MEUBLES KARIM
          </h1>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
            <p className="text-lg md:text-xl max-w-2xl" style={{ fontFamily: 'Playfair Display, serif' }}>
              A custom, modern approach to furniture—where simplicity, authenticity, and craftsmanship meet.
            </p>
            <p className="text-base md:text-lg text-gray-500" style={{ fontFamily: 'Playfair Display, serif' }}>
              Discover a new way of living with Meubles Karim: crafted simplicity, rooted in real design. Our collections combine timeless aesthetics, ergonomic comfort, and mindful innovation, shaping spaces that feel as good as they look.
            </p>
          </div>
        </header>

        {/* Team Photo */}
        <div className="w-full rounded-lg overflow-hidden mb-12">
          <img src={teamPhoto} alt="Meubles Karim Team" className="w-full h-64 md:h-96 object-cover" />
        </div>

        {/* Vision & Mission */}
        <section className="mb-16 grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>Our Vision</h2>
            <p className="text-lg text-gray-700" style={{ fontFamily: 'Playfair Display, serif' }}>
              To inspire beautiful, functional living through honest design and enduring quality.
            </p>
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>Our Mission</h2>
            <p className="text-lg text-gray-700" style={{ fontFamily: 'Playfair Display, serif' }}>
              To create furniture that elevates everyday life, blending tradition and innovation for spaces that feel personal, purposeful, and beautifully made.
            </p>
          </div>
        </section>

        {/* Design & Craftsmanship */}
        <section className="mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-8" style={{ fontFamily: 'Playfair Display, serif' }}>DESIGN • CRAFTSMANSHIP</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>Design & Soul</h3>
              <p className="text-base text-gray-700 mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                Each piece is thoughtfully designed to balance form and function, with a focus on timeless beauty and comfort.
              </p>
              <ul className="text-base text-gray-700 space-y-2 pl-4 list-disc" style={{ fontFamily: 'Playfair Display, serif' }}>
                <li>Purposeful Simplicity</li>
                <li>Timeless Aesthetics</li>
                <li>Material Integrity</li>
                <li>Mindful Craftsmanship</li>
                <li>Functional Comfort</li>
                <li>Innovative Sustainability</li>
                <li>Design for Experience</li>
              </ul>
            </div>
            <div className="flex flex-col gap-6">
              <img src="https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=400&q=80" alt="Design" className="rounded-lg w-full h-48 object-cover" />
              <div>
                <h3 className="text-xl font-semibold mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>Designers Behind the Vision</h3>
                <p className="text-base text-gray-700" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Each member of our team brings a unique perspective, bound by a shared passion for thoughtful design and timeless quality. Together, we shape spaces that feel personal, purposeful, and beautifully made.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Team Members */}
        <section className="mb-16">
          <h2 className="text-2xl md:text-3xl font-bold mb-8" style={{ fontFamily: 'Playfair Display, serif' }}>The Team</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mt-10">
            {[
              {
                name: 'Karim Belhadjali',
                role: 'Founder & Director',
                img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1974&auto=format&fit=crop',
                info: "Pioneer of vision and excellence in the furniture industry for over 30 years.",
                color: 'bg-yellow-100',
              },
              {
                name: 'Sonia Trabelsi',
                role: 'Art Director',
                img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1976&auto=format&fit=crop',
                info: "Expert in interior design, shaping the aesthetics of our collections with passion and creativity.",
                color: 'bg-purple-100',
              },
              {
                name: 'Mehdi Khelifi',
                role: 'Master Craftsman',
                img: 'https://images.unsplash.com/photo-1564564321837-a57b7070ac4f?q=80&w=2076&auto=format&fit=crop',
                info: "With over 25 years of woodworking experience, he oversees the production of every piece.",
                color: 'bg-green-100',
              },
              {
                name: 'Nouha Ben Salah',
                role: 'Customer Relations',
                img: 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?q=80&w=1974&auto=format&fit=crop',
                info: "Always attentive, she ensures every client's satisfaction with professionalism.",
                color: 'bg-cyan-100',
              },
            ].map((member) => (
              <div
                key={member.name}
                className={`group relative rounded-2xl overflow-hidden shadow-lg transition-transform duration-300 hover:scale-105 cursor-pointer ${member.color}`}
                style={{ minHeight: '260px', height: '260px' }}
              >
                {/* Full card image */}
                <img
                  src={member.img}
                  alt={member.name}
                  className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-110 z-0"
                />
                {/* Fade-in gradient from bottom */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-90 z-10 transition-opacity duration-300" />
                {/* Name and role at the bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-5 z-20">
                  <h3 className="text-white text-lg font-semibold mb-1 drop-shadow-lg" style={{ fontFamily: 'Playfair Display, serif' }}>{member.name}</h3>
                  <p className="text-white text-xs mb-1 italic drop-shadow-lg" style={{ fontFamily: 'Playfair Display, serif' }}>{member.role}</p>
                </div>
                {/* Hover info overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center bg-black/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30">
                  <h3 className="text-white text-lg font-semibold mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>{member.name}</h3>
                  <p className="text-yellow-200 text-xs mb-2 italic" style={{ fontFamily: 'Playfair Display, serif' }}>{member.role}</p>
                  <p className="text-white text-xs" style={{ fontFamily: 'Playfair Display, serif' }}>{member.info}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Awards */}
        <section className="mb-20">
          <h2 className="text-2xl md:text-3xl font-bold mb-8" style={{ fontFamily: 'Playfair Display, serif' }}>The Awards</h2>
          <div className="flex flex-wrap gap-8 items-center justify-center">
            {awards.map(award => (
              <div key={award.name} className="flex flex-col items-center">
                <img src={award.img} alt={award.name} className="w-20 h-20 object-contain mb-2" />
                <span className="text-xs text-gray-500" style={{ fontFamily: 'Playfair Display, serif' }}>{award.name}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Footer CTA */}
        <footer className="bg-[#eaeaea] rounded-lg py-12 px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>DESIGN • CRAFTSMANSHIP</h2>
          <p className="text-lg mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>CREATE WITH INTENTION</p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-4">
            <div className="text-base md:text-lg" style={{ fontFamily: 'Playfair Display, serif' }}>CREATE YOUR OWN HOMEY EXPERIENCE.</div>
            <a href="mailto:karim@meubleskarim.com" className="text-base md:text-lg underline text-gray-700 hover:text-black transition" style={{ fontFamily: 'Playfair Display, serif' }}>karim@meubleskarim.com</a>
          </div>
        </footer>
      </main>
    </div>
  );
}
