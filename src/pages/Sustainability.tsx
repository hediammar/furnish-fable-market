import { Helmet } from "react-helmet-async";
import { useState } from "react";
import { motion } from "framer-motion";

const faqs = [
  {
    question: "Comment puis-je vivre une vie plus durable au quotidien ?",
    answer:
      "Minimisez les déchets en suivant les principes de réduction, de réutilisation et de recyclage. Optez pour des articles réutilisables, recyclez les matériaux chaque fois que possible et soyez attentif à votre consommation.",
  },
  {
    question: "Comment rendre ma vie quotidienne plus durable ?",
    answer:
      "Privilégiez les produits locaux, réduisez votre consommation d'énergie et soutenez les entreprises responsables.",
  },
  {
    question: "Où puis-je trouver des entreprises locales éco-responsables ?",
    answer:
      "Recherchez des labels de durabilité et consultez les annuaires spécialisés pour trouver des entreprises engagées dans votre région.",
  },
  {
    question: "Comment puis-je rendre ma vie plus éco-responsable ?",
    answer:
      "Adoptez des habitudes de consommation responsables, privilégiez les transports doux et réduisez votre empreinte carbone.",
  },
];

const features = [
  {
    title: "Solutions de durabilité complètes",
    desc: "Nous offrons une plateforme unifiée couvrant plusieurs aspects de la vie durable, avec des informations, outils et ressources.",
    icon: (
      <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 1.343-3 3 0 1.657 1.343 3 3 3s3-1.343 3-3c0-1.657-1.343-3-3-3z"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 2v2m0 16v2m10-10h-2M4 12H2m15.364-7.364l-1.414 1.414M6.05 17.95l-1.414 1.414m12.728 0l-1.414-1.414M6.05 6.05L4.636 4.636"/></svg>
    ),
  },
  {
    title: "Certifié et vérifié éco-responsable",
    desc: "Notre équipe collecte et vérifie les informations pour garantir des conseils fiables et précis sur les pratiques durables.",
    icon: (
      <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
    ),
  },
  {
    title: "Communauté engagée et support",
    desc: "Partagez votre parcours, participez à des défis et connectez-vous avec d'autres passionnés de l'environnement.",
    icon: (
      <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m9-5.13a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
    ),
  },
];

const Sustainability = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [openFeature, setOpenFeature] = useState<number | null>(null);

  return (
    <>
      <Helmet>
        <title>Durabilité | Meuble Karim</title>
        <meta name="description" content="Découvrez notre engagement envers la durabilité et la responsabilité sociale d'entreprise chez Meuble Karim." />
      </Helmet>

      {/* Hero Section */}
      <div className="relative h-[380px] md:h-[480px] w-full flex items-center justify-center bg-gray-200 overflow-hidden rounded-b-3xl mb-12">
        <img
          src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
          alt="Durabilité Meuble Karim"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-80"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40" />
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-lg">
            Notre Engagement pour un Avenir Durable
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto drop-shadow">
            Chez Meuble Karim, nous croyons en la création d'un avenir plus durable à travers nos pratiques commerciales responsables et notre engagement envers l'environnement.
          </p>
        </div>
      </div>

      {/* Intro Section */}
      <section className="max-w-3xl mx-auto text-center mb-12 px-4">
        <h2 className="text-2xl md:text-3xl font-semibold mb-4">Une approche holistique de la durabilité et de la responsabilité</h2>
        <p className="text-gray-600 text-lg">
          Embrassant la responsabilité environnementale et sociale, Meuble Karim intègre des principes durables dans chaque aspect de son activité.
        </p>
      </section>

      {/* Accordion/Feature Section */}
      <section className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 px-4">
        <div>
          {[
            {
              title: "Responsabilité Environnementale",
              content: (
                <ul className="list-disc pl-5 space-y-2 text-gray-700">
                  <li>Utilisation de matériaux durables et certifiés</li>
                  <li>Optimisation de la chaîne d'approvisionnement pour réduire l'empreinte carbone</li>
                  <li>Gestion responsable des déchets et recyclage</li>
                </ul>
              ),
            },
            {
              title: "Responsabilité Sociale",
              content: (
                <ul className="list-disc pl-5 space-y-2 text-gray-700">
                  <li>Conditions de travail équitables pour tous nos employés</li>
                  <li>Support aux communautés locales</li>
                  <li>Formation continue et développement professionnel</li>
                </ul>
              ),
            },
            {
              title: "Certifications et Standards",
              content: (
                <ul className="list-disc pl-5 space-y-2 text-gray-700">
                  <li>FSC : Bois provenant de forêts gérées durablement</li>
                  <li>ISO 14001 : Gestion environnementale</li>
                  <li>ISO 9001 : Qualité et excellence</li>
                </ul>
              ),
            },
          ].map((item, idx) => (
            <div key={item.title} className="mb-4">
              <button
                className="w-full flex justify-between items-center bg-gray-100 px-5 py-4 rounded-lg font-medium text-left text-lg hover:bg-green-50 transition"
                onClick={() => setOpenFeature(openFeature === idx ? null : idx)}
              >
                {item.title}
                <span className={`ml-2 transition-transform ${openFeature === idx ? 'rotate-180' : ''}`}>▼</span>
              </button>
              {openFeature === idx && (
                <div className="bg-white px-5 py-4 rounded-b-lg border-t border-gray-200">
                  {item.content}
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center">
          <img
            src="https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=600&q=80"
            alt="Sustainable Practices"
            className="rounded-xl shadow-lg w-full max-w-md object-cover"
          />
        </div>
      </section>

      {/* Feature Card Section */}
      <section className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 px-4 items-center">
        <div>
          <img
            src="https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=600&q=80"
            alt="Sustainable Practices"
            className="rounded-xl shadow-lg w-full object-cover mb-4 md:mb-0"
          />
        </div>
        <div>
          <h3 className="text-2xl font-semibold mb-3">Harmonisez vos pratiques durables</h3>
          <p className="text-gray-600 mb-6">
            Découvrez comment intégrer facilement des pratiques durables dans votre quotidien et votre entreprise grâce à nos conseils et ressources personnalisés.
          </p>
          <button className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors">
            En savoir plus
          </button>
        </div>
      </section>

      {/* Three-column Feature Highlights */}
      <section className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 px-4">
        {features.map((feature, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow p-6 flex flex-col items-center text-center">
            {feature.icon}
            <h4 className="font-semibold text-lg mt-4 mb-2">{feature.title}</h4>
            <p className="text-gray-600 text-sm">{feature.desc}</p>
          </div>
        ))}
      </section>

      {/* FAQ Section */}
      <section className="max-w-6xl mx-auto mb-20 px-4">
        <h3 className="text-2xl font-semibold mb-4 text-center">Questions Fréquemment Posées</h3>
        <p className="text-gray-600 text-center mb-8 max-w-2xl mx-auto">
          Nous croyons au pouvoir de l'action collective pour relever les défis environnementaux de notre planète.
        </p>
        <div className="max-w-2xl mx-auto">
          {faqs.map((faq, idx) => (
            <div key={faq.question} className="mb-4">
              <button
                className="w-full flex justify-between items-center bg-gray-100 px-5 py-4 rounded-lg font-medium text-left text-lg hover:bg-green-50 transition"
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
              >
                {faq.question}
                <span className={`ml-2 transition-transform ${openFaq === idx ? 'rotate-180' : ''}`}>▼</span>
              </button>
              {openFaq === idx && (
                <div className="bg-white px-5 py-4 rounded-b-lg border-t border-gray-200 text-gray-700">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </>
  );
};

export default Sustainability; 